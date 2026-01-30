from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import joblib
import numpy as np
from keras.models import load_model
import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Load model and scaler
model = load_model("model/icu_lstm_model.h5")
scaler = joblib.load("model/scaler.save")

# Sequence buffer for LSTM input
sequence_buffer = []
SEQUENCE_LENGTH = 10
ALERT_THRESHOLD = 0.8  # Prediction threshold


@app.route("/")
def index():
    return "✅ Smart ICU Flask Server Running"


@app.route("/send-data", methods=["POST"])
def receive_data():
    data = request.json
    print("📥 Received:", data)

    if not data or "sequence" not in data or not isinstance(data["sequence"], list):
        return {"error": "Invalid format: Expected 'sequence' field"}, 400

    try:
        # Latest reading: [temp, hr, spo2, sysBP, ecg]
        latest = data["sequence"][-1]
        temperature = float(latest[0])
        heart_rate = float(latest[1])
        spo2 = float(latest[2])
        systolic = float(latest[3])
        ecg = float(latest[4])
        diastolic = 80.0  # Placeholder
    except (IndexError, TypeError, ValueError) as e:
        return {"error": f"Malformed reading: {str(e)}"}, 400

    # Feature vector and scaling
    input_features = np.array([
        temperature,
        heart_rate,
        spo2,
        systolic,
        diastolic,
        ecg
    ])
    scaled_input = scaler.transform([input_features])[0]

    # Add to buffer
    sequence_buffer.append(scaled_input.tolist())
    if len(sequence_buffer) > SEQUENCE_LENGTH:
        sequence_buffer.pop(0)

    prediction = None
    if len(sequence_buffer) == SEQUENCE_LENGTH:
        input_seq = np.array(sequence_buffer).reshape(1, SEQUENCE_LENGTH, -1)
        prediction = float(model.predict(input_seq)[0][0])
        print(f"📊 LSTM Prediction: {prediction:.4f}")

        alert = prediction > ALERT_THRESHOLD

        # WebSocket Emit
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

    return {"status": "received", "prediction": prediction}, 200


@socketio.on("connect")
def handle_connect():
    print("✅ WebSocket client connected")
    emit("connect", {"message": "Connected to Flask WebSocket"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
