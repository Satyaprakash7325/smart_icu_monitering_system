from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import joblib
import numpy as np
import datetime
import os
import requests

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Base directory for relative paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "model", "icu_lstm_model.h5")
scaler_path = os.path.join(BASE_DIR, "model", "scaler.save")

# Load model and scaler with fallback
model = None
scaler = None
HAS_ML = False

try:
    from keras.models import load_model
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    HAS_ML = True
    print("🧠 LSTM model and scaler loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load LSTM model or scaler ({str(e)}). Running in threshold fallback mode.")

ALERT_THRESHOLD = 0.8  # Prediction threshold
last_esp32_ip = None    # Auto-detected ESP32 IP


@app.route("/")
def index():
    return "✅ Smart ICU Flask Server Running"


@app.route("/send-data", methods=["POST"])
def receive_data():
    global last_esp32_ip
    
    # Store the ESP32's IP address automatically
    last_esp32_ip = request.remote_addr
    
    data = request.json
    if not data or "sequence" not in data:
        return {"error": "Invalid format: Expected 'sequence' field"}, 400

    sequence_data = data.get("sequence")
    if not isinstance(sequence_data, list) or len(sequence_data) == 0:
        return {"error": "Invalid format: 'sequence' must be a non-empty list"}, 400

    try:
        # Enforce sequence length of 60 for the LSTM model
        seq_len = len(sequence_data)
        if seq_len > 60:
            sequence_data = sequence_data[-60:]
        elif seq_len < 60:
            # Pad by repeating the first reading at the beginning
            first_val = sequence_data[0]
            if not isinstance(first_val, list) or len(first_val) != 5:
                return {"error": "Malformed readings: expected 5 features per timestep"}, 400
            sequence_data = [first_val] * (60 - seq_len) + sequence_data

        # Verify all elements have exactly 5 features
        for idx, step in enumerate(sequence_data):
            if not isinstance(step, list) or len(step) != 5:
                return {"error": f"Step {idx} has invalid shape: expected 5 elements"}, 400
            
        sequence_np = np.array(sequence_data, dtype=float)  # shape: (60, 5)
    except (IndexError, TypeError, ValueError) as e:
        return {"error": f"Malformed reading: {str(e)}"}, 400

    # Extract the latest reading for WebSocket emit
    latest = sequence_np[-1]
    temperature = float(latest[0])
    heart_rate = float(latest[1])
    spo2 = float(latest[2])
    systolic = float(latest[3])
    ecg = float(latest[4])
    diastolic = 80.0  # Placeholder since ESP32 sends 5 vitals

    # Run prediction
    if HAS_ML and model and scaler:
        # Scale the sequence using the 5-feature scaler
        scaled_sequence = scaler.transform(sequence_np)  # shape: (60, 5)

        # Reshape for LSTM prediction: (batch_size, timesteps, features) -> (1, 60, 5)
        input_seq = scaled_sequence.reshape(1, 60, 5)
        
        prediction_probs = model.predict(input_seq)
        # prediction_probs is shape (1, 2) due to Softmax. Index 1 represents the abnormal/alert class.
        prediction = float(prediction_probs[0][1])
    else:
        # Threshold fallback logic for anomaly detection when ML components are not loaded
        # Temp: [36, 37.5], HR: [60, 100], SpO2: >= 95
        is_abnormal = (
            heart_rate < 60 or heart_rate > 100 or
            spo2 < 95 or
            temperature < 36.0 or temperature > 37.5 or
            systolic > 1250
        )
        prediction = 0.95 if is_abnormal else 0.05
    
    alert = prediction > ALERT_THRESHOLD
    print(f"📊 Anomaly Prediction: {prediction:.4f} | Alert: {alert} (ML Loaded: {HAS_ML})")

    # Emit vitals to WebSocket clients
    socketio.emit("vitals", {
        "temperature": temperature,
        "heart_rate": heart_rate,
        "spo2": spo2,
        "bp_systolic": systolic,
        "bp_diastolic": diastolic,
        "ecg": ecg,
        "alert": alert,
        "prediction": prediction,
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S")
    })

    return {"status": "received", "prediction": prediction, "alert": alert}, 200


@app.route("/mute-buzzer", methods=["POST"])
def mute_buzzer():
    global last_esp32_ip
    if not last_esp32_ip:
        return {"status": "error", "message": "No ESP32 connection registered yet"}, 400
    
    # Forward the text plain "true" or "false" payload
    mute_state = request.get_data(as_text=True)
    esp32_url = f"http://{last_esp32_ip}/mute-buzzer"
    
    print(f"Forwarding mute request ({mute_state}) to ESP32 at {esp32_url}")
    try:
        response = requests.post(esp32_url, data=mute_state, headers={"Content-Type": "text/plain"}, timeout=3)
        if response.status_code == 200:
            return response.json(), 200
        else:
            return {"status": "error", "message": f"ESP32 returned status code {response.status_code}"}, 500
    except requests.RequestException as e:
        return {"status": "error", "message": f"Failed to reach ESP32 at {last_esp32_ip}: {str(e)}"}, 500


@socketio.on("connect")
def handle_connect():
    print("✅ WebSocket client connected")
    emit("connect", {"message": "Connected to Flask WebSocket"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
