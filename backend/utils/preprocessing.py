import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler

# Try loading scaler saved from training
try:
    scaler = joblib.load("scaler.save")  # Ensure this file exists in backend root
except:
    # If not found, use a dummy scaler for testing
    scaler = MinMaxScaler()
    scaler.fit(np.random.rand(100, 5))  # Dummy fit

def preprocess_sequence(sequence):
    """
    Preprocess a 10-second window (shape: 60x5)
    - Normalizes using saved scaler
    - Reshapes for LSTM model: (1, 60, 5)
    """
    sequence = np.array(sequence)
    if sequence.shape != (60, 5):
        raise ValueError("Expected shape (60, 5) for the input sequence")
    
    scaled = scaler.transform(sequence)
    return np.expand_dims(scaled, axis=0)  # Output shape: (1, 60, 5)
