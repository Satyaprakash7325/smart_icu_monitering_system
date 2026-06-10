import time
import random
import requests
import json

SERVER_URL = "http://localhost:5000/send-data"
BUFFER_SIZE = 60

# Initialize buffer with normal baseline readings
# Features: [temp, hr, spo2, bp_proxy, ecg]
sequence = []
for _ in range(BUFFER_SIZE):
    sequence.append([
        round(random.uniform(36.2, 37.2), 2),  # Temp
        round(random.uniform(70.0, 85.0), 1),  # HR
        round(random.uniform(97.0, 99.0), 1),  # SpO2
        round(random.uniform(1150.0, 1220.0), 1),  # BP proxy
        round(random.uniform(0.1, 0.4), 3),  # ECG
    ])

print("🚀 Smart ICU ESP32 Data Stream Simulator Started.")
print(f"📡 Targeting Flask server: {SERVER_URL}")
print("🔄 Alternating between NORMAL and ANOMALY conditions every 30 seconds.")

phase = "normal"
last_phase_change = time.time()
tick_count = 0

try:
    while True:
        # Check if we should switch phase
        current_time = time.time()
        if current_time - last_phase_change >= 30:
            phase = "anomaly" if phase == "normal" else "normal"
            last_phase_change = current_time
            print(f"\n⚠️ Changing condition phase to: {phase.upper()} ⚠️\n")

        # Generate a new reading based on the current phase
        if phase == "normal":
            temp = round(random.uniform(36.1, 37.3), 2)
            hr = round(random.uniform(65.0, 85.0), 1)
            spo2 = round(random.uniform(96.0, 99.0), 1)
            bp = round(random.uniform(1150.0, 1210.0), 1)
            ecg = round(random.uniform(0.05, 0.35), 3)
        else:  # Anomaly phase (fever, tachycardia, hypoxia)
            temp = round(random.uniform(38.5, 40.0), 2)
            hr = round(random.uniform(110.0, 130.0), 1)
            spo2 = round(random.uniform(88.0, 93.0), 1)
            bp = round(random.uniform(1300.0, 1380.0), 1)
            ecg = round(random.uniform(0.55, 0.95), 3)

        # Shift sequence buffer and append latest reading
        sequence.pop(0)
        sequence.append([temp, hr, spo2, bp, ecg])

        tick_count += 1
        print(f"[{phase.upper()}] Temp: {temp}°C | HR: {hr} bpm | SpO2: {spo2}% | BP: {bp} | ECG: {ecg} (Tick {tick_count}/10)", end="\r")

        # Post data to Flask server every 10 seconds
        if tick_count >= 10:
            tick_count = 0
            payload = {"sequence": sequence}
            try:
                response = requests.post(SERVER_URL, json=payload, timeout=2)
                if response.status_code == 200:
                    res_data = response.json()
                    print(f"\n✅ Sent sequence. Server response: LSTM Prediction Score={res_data.get('prediction', 0.0):.4f}, Alert={res_data.get('alert', False)}")
                else:
                    print(f"\n❌ Server error: {response.status_code} - {response.text}")
            except requests.RequestException as e:
                print(f"\n❌ Connection failed: Unable to connect to Flask server. Is it running? Details: {str(e)}")

        time.sleep(1)

except KeyboardInterrupt:
    print("\n🛑 Simulator terminated.")
