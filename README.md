# Smart ICU Bedside Telemetry & Predictive Monitoring Workstation

An advanced IoT-driven, Machine Learning-powered clinical patient monitoring workstation. This system captures real-time physiological signals from a bedside ESP32 micro-controller, evaluates multi-channel sequence stability using a custom Long Short-Term Memory (LSTM) neural network on a Flask backend, and streams vital metrics dynamically to a responsive, high-tech React interface via WebSockets.

---

## 🖥️ System Overview

The workstation integrates three distinct layers to provide real-time patient analytics:

```mermaid
graph TD
    subgraph Bedside Node (IoT)
        A[Sensors: LM35, MAX30102, BMP180, ECG] -->|1Hz Readings| B(ESP32 Controller)
        B -->|Bedside Alarm| C[Physical Buzzer]
    end
    
    subgraph Analytics Node (ML Backend)
        B -->|HTTP POST 60s window| D[Flask Server]
        D -->|Feature Scaling| E[MinMaxScaler]
        E -->|Sequence Inference| F[LSTM Anomaly Model]
        F -->|Anomaly Probability| D
    end

    subgraph Monitoring Terminal (Frontend)
        D -->|WebSockets event: vitals| G[React Client]
        G -->|Dynamic Visualizations| H[ECG Canvas Waveform]
        G -->|Trends| I[Recharts Trend Analytics]
        G -->|Clinical Alerts| J[Status & Alerts Center]
        G -->|Remote Mute Command| D
        D -->|HTTP Proxy Command| B
    end
```

---

## 🔌 Bedside Node (ESP32) Hardware Schema

The bedside node utilizes an **ESP32 DevKit V1** connected to four medical-grade analog/digital sensor proxies.

### 📌 Pin Wiring Configuration

| Sensor/Actuator | Sensor Description | ESP32 Pin | Connection Protocol | Notes / Details |
| :--- | :--- | :--- | :--- | :--- |
| **LM35** | Ambient/Skin Temp Sensor | `GPIO 35` | Analog (ADC) | Reads output voltage; converts to Celsius ($V_{out} \times 100$) |
| **MAX30102** | Photoplethysmography (PPG) | `SDA (GPIO 21)`<br>`SCL (GPIO 22)` | Digital ($I^2C$) | Measures Blood Oxygen saturation ($SpO_2$) and Heart Rate |
| **AD8232 (ECG)**| Electrocardiogram Monitor | `GPIO 34` | Analog (ADC) | Reads cardiac electrical signals; normalized to $0.0 - 1.0$ |
| **BMP180** | Barometric Pressure proxy | `SDA (GPIO 21)`<br>`SCL (GPIO 22)` | Digital ($I^2C$) | Utilized as a high-fidelity proxy for Blood Pressure telemetry |
| **Buzzer** | Bedside Audio Alarm | `GPIO 25` | Digital Output (PWM)| Emits a $2\text{kHz}$ tone when abnormal vitals are encountered |

---

## 🧠 Machine Learning Engine (LSTM)

Traditional patient monitors rely on fixed-threshold alarms (e.g., alert if Heart Rate > 100), leading to high false-alarm rates. This workstation utilizes an **LSTM (Long Short-Term Memory) Recurrent Neural Network** to evaluate the **temporal relationship** of vital parameters over time.

### 📊 Model Architecture & Data Path
1. **Sequence Input**: The ESP32 streams a **60-step history** of vitals `(Temp, HR, SpO2, Pressure Proxy, ECG)` captured at 1Hz frequency (shape: `(60, 5)`).
2. **Preprocessing**: The Flask backend normalizes incoming values via a pre-fit `MinMaxScaler` (`scaler.save`) and reshapes them to `(1, 60, 5)` for sequence inference.
3. **Sequence Classifier**:
   - `LSTM Layer (128 units)`: Extracts time-series features and detects sudden pattern transitions.
   - `Dropout (0.3)`: Prevents overfitting.
   - `Dense Layer (64 units, ReLU)`: Deep feature mapping.
   - `Dense Output (2 units, Softmax)`: Computes classification probabilities for class `0` (Normal Vitals Sequence) and class `1` (Critical Clinical Anomaly Sequence).
4. **Actionable Alerts**: If the abnormal class probability crosses $80\%$ (`ALERT_THRESHOLD = 0.8`), the system triggers a warning banner on the dashboard and signals the ESP32 buzzer.

---

## 🚀 Installation & Local Development

Follow these steps to deploy and run the system locally:

### 1. Flask Backend Setup
Ensure you have Python 3.8+ installed.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend will boot up at `http://localhost:5000`.*

---

### 2. React (Vite) Frontend Setup
Make sure you have Node.js (v18+) installed.

1. Navigate to the frontend directory:
   ```bash
   cd frontend-vite
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
   *The interface will run on `http://localhost:5173` (or the next available port).*

---

### 3. ESP32 Bedside Node Setup (Arduino IDE)
1. Open `esp32/main.ino` in the **Arduino IDE**.
2. Install the necessary libraries via the Library Manager:
   - **MAX30105** by SparkFun
   - **Adafruit BMP085 Library** by Adafruit
3. Update the WiFi configurations in the sketch:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* server = "http://<YOUR_BACKEND_IP>:5000/send-data";
   ```
4. Connect your ESP32 to your workstation via USB, select the corresponding COM port and Board model, and hit **Upload**.

---

## 🛠️ Offline Verification & Test Simulator

If you do not have the physical ESP32 hardware assembled, you can verify the backend predictions and frontend telemetry dashboard using the offline stream simulator:

1. Leave your Flask backend and React frontend running.
2. In a new terminal tab at the root of the project, run:
   ```bash
   python simulate_esp32.py
   ```
3. The simulator will establish a rolling connection to the server, alternating between normal vitals and anomaly states (fever, tachycardia, hypoxia) every 30 seconds.
4. Open your browser to the React dashboard port, and watch the vital boxes, canvas ECG waveform, and trend graphs update dynamically in real-time.
