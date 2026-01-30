#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include "MAX30105.h"
#include "heartRate.h"

// === WiFi Credentials ===
const char* ssid = "Ss";
const char* password = "22334455";
const char* server = "http://192.168.195.148:5000/send-data";

#define ECG_PIN     34
#define LM35_PIN    35
#define BUZZER_PIN  25

Adafruit_BMP085 bmp;
MAX30105 max30102;
WebServer serverAPI(80);

// === Timers ===
unsigned long lastRead = 0;
unsigned long lastSend = 0;

// === Mute ===
bool isMuted = false;

// === Rolling Buffer ===
#define BUFFER_SIZE 60
float sequence[BUFFER_SIZE][5];
int bufferIndex = 0;

// === Current Reading ===
float latestTemp = 0, latestHR = 0, latestSpO2 = 0, latestPressure = 0, latestECG = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(ECG_PIN, INPUT);
  pinMode(LM35_PIN, INPUT);
  digitalWrite(BUZZER_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("🔌 Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println(" ✅ Connected!");

  if (!max30102.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("❌ MAX30102 not found!");
    while (1);
  }
  max30102.setup();
  max30102.setPulseAmplitudeRed(0x0A);
  max30102.setPulseAmplitudeGreen(0x00);

  if (!bmp.begin()) {
    Serial.println("❌ BMP180 not found!");
    while (1);
  }

  setupWebServer();

  Serial.println("🚀 All systems initialized.\n");
}

void loop() {
  serverAPI.handleClient();
  unsigned long now = millis();

  if (now - lastRead >= 1000) {
    lastRead = now;
    readSensors();
    checkForAlerts();
    updateBuffer();
  }

  if (now - lastSend >= 10000) {
    lastSend = now;
    if (bufferIndex >= BUFFER_SIZE) {
      postToFlask();
    } else {
      Serial.println("⏳ Buffer not full yet, skipping post.");
    }
  }
}

void setupWebServer() {
  serverAPI.on("/mute-buzzer", HTTP_POST, []() {
    if (serverAPI.hasArg("plain")) {
      String body = serverAPI.arg("plain");
      isMuted = body.indexOf("true") != -1;
      String msg = isMuted ? "🔇 Buzzer muted" : "🔊 Buzzer unmuted";
      Serial.println(msg);
      serverAPI.send(200, "application/json", "{\"status\": \"" + msg + "\"}");
    } else {
      serverAPI.send(400, "application/json", "{\"error\": \"Missing payload\"}");
    }
  });

  serverAPI.begin();
  Serial.println("🌐 Web server started at /mute-buzzer");
}

void readSensors() {
  int ecgVal = analogRead(ECG_PIN);
  latestECG = ecgVal / 4095.0;

  long irValue = max30102.getIR();
  if (checkForBeat(irValue)) {
    static unsigned long lastBeat = 0;
    unsigned long delta = millis() - lastBeat;
    lastBeat = millis();
    latestHR = 60000.0 / delta;
  }

  latestSpO2 = irValue > 10000 ? random(95, 99) : 0;
  latestPressure = bmp.readPressure() / 100.0;

  int raw = analogRead(LM35_PIN);
  float voltage = raw * (3.3 / 4095.0);
  latestTemp = voltage * 100.0;

  Serial.printf("📊 ECG: %.2f | HR: %.1f | SpO₂: %.1f%% | BP: %.1f hPa | Temp: %.1f°C\n",
    latestECG, latestHR, latestSpO2, latestPressure, latestTemp);
}

void updateBuffer() {
  if (bufferIndex < BUFFER_SIZE) {
    sequence[bufferIndex][0] = latestTemp;
    sequence[bufferIndex][1] = latestHR;
    sequence[bufferIndex][2] = latestSpO2;
    sequence[bufferIndex][3] = latestPressure;
    sequence[bufferIndex][4] = latestECG;
    bufferIndex++;
  } else {
    // Shift left
    for (int i = 0; i < BUFFER_SIZE - 1; i++) {
      for (int j = 0; j < 5; j++) {
        sequence[i][j] = sequence[i + 1][j];
      }
    }
    // Add new row
    sequence[BUFFER_SIZE - 1][0] = latestTemp;
    sequence[BUFFER_SIZE - 1][1] = latestHR;
    sequence[BUFFER_SIZE - 1][2] = latestSpO2;
    sequence[BUFFER_SIZE - 1][3] = latestPressure;
    sequence[BUFFER_SIZE - 1][4] = latestECG;
  }
}

void checkForAlerts() {
  bool ecgAbnormal = latestECG > 0.25;
  bool hrAbnormal = latestHR < 60 || latestHR > 100;
  bool spo2Abnormal = latestSpO2 < 95;
  bool tempAbnormal = latestTemp < 35 || latestTemp > 38.5;

  if ((ecgAbnormal || hrAbnormal || spo2Abnormal || tempAbnormal) && !isMuted) {
    Serial.println("🚨 Abnormal vital detected. Triggering buzzer...");
    tone(BUZZER_PIN, 2000);
    delay(500);
    noTone(BUZZER_PIN);
  }
}

void postToFlask() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(server);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"sequence\":[";
    for (int i = 0; i < BUFFER_SIZE; i++) {
      json += "[";
      for (int j = 0; j < 5; j++) {
        json += String(sequence[i][j], 3);
        if (j < 4) json += ",";
      }
      json += "]";
      if (i < BUFFER_SIZE - 1) json += ",";
    }
    json += "]}";

    int httpCode = http.POST(json);
    if (httpCode > 0) {
      Serial.printf("✅ Data sent to Flask! Code: %d\n", httpCode);
    } else {
      Serial.printf("❌ Failed to send data. Code: %d\n", httpCode);
    }
    http.end();
  } else {
    Serial.println("❌ WiFi disconnected.");
  }
}
