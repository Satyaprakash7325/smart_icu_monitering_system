import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt

# === Simulate ICU vitals for 1000 patients ===
np.random.seed(42)
num_samples = 1000
X = np.random.rand(num_samples, 60, 5)

# Realistic vital signs
X[:, :, 0] = X[:, :, 0] * 2 + 36.0     # Temp: 36–38°C
X[:, :, 1] = X[:, :, 1] * 40 + 60      # HR: 60–100 bpm
X[:, :, 2] = X[:, :, 2] * 5 + 95       # SpO2: 95–100%
X[:, :, 3] = X[:, :, 3] * 30 + 1180    # BP proxy
X[:, :, 4] = X[:, :, 4]                # ECG: 0–1 normalized

# 20% abnormal cases
y = np.random.choice([0, 1], size=(num_samples,), p=[0.8, 0.2])

# === Split for training ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# === Define LSTM model ===
model = Sequential([
    LSTM(128, input_shape=(60, 5)),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dense(2, activation='softmax')
])

model.compile(
    optimizer=Adam(0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# === Train the model ===
history = model.fit(X_train, y_train, epochs=10, batch_size=32, validation_split=0.2)

# === Evaluate ===
loss, acc = model.evaluate(X_test, y_test)
print(f"\n✅ Accuracy: {acc:.2f}")

y_pred = np.argmax(model.predict(X_test), axis=1)
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# === Save model ===
model.save("icu_lstm_model.h5")
print("\n✅ Model saved as icu_lstm_model.h5")

# === Plot accuracy ===
plt.plot(history.history['accuracy'], label='Train')
plt.plot(history.history['val_accuracy'], label='Val')
plt.title("LSTM Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)
plt.show()