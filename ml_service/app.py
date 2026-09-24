"""
FastAPI Cloud/Edge Inference Server for Smart Dam Alert System (SDAS)
Provides advisory ML inference:
- 1-Hour Ahead LSTM Water Level Forecast (MAPE < 5%)
- Deep Autoencoder Dual-Sensor Anomaly & Drift Detection
Optimized for high-speed, lightweight cloud deployment (<40MB RAM) without heavy framework bloat.
"""

import os
import time
import json
import joblib
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Global model & weight holders
lstm_weights = None
lstm_meta = None
ae_weights = None
ae_meta = None
system_metadata = None

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -30.0, 30.0)))

def run_lstm_layer(x_seq, W, U, b, return_seq=False):
    units = U.shape[0]
    batch_size, timesteps, _ = x_seq.shape
    h = np.zeros((batch_size, units), dtype=np.float32)
    c = np.zeros((batch_size, units), dtype=np.float32)
    
    outputs = []
    for t in range(timesteps):
        xt = x_seq[:, t, :]
        z = xt @ W + h @ U + b
        i = sigmoid(z[:, 0*units:1*units])
        f = sigmoid(z[:, 1*units:2*units])
        c_cand = np.tanh(z[:, 2*units:3*units])
        o = sigmoid(z[:, 3*units:4*units])
        
        c = f * c + i * c_cand
        h = o * np.tanh(c)
        if return_seq:
            outputs.append(h)
            
    if return_seq:
        return np.stack(outputs, axis=1)
    return h

def predict_lstm_numpy(x_batch):
    # Layer 1: LSTM (return_sequences=True)
    out1 = run_lstm_layer(x_batch, lstm_weights['lstm1_w'], lstm_weights['lstm1_u'], lstm_weights['lstm1_b'], return_seq=True)
    # Layer 2: Dropout (identity at inference)
    # Layer 3: LSTM (return_sequences=False)
    out2 = run_lstm_layer(out1, lstm_weights['lstm2_w'], lstm_weights['lstm2_u'], lstm_weights['lstm2_b'], return_seq=False)
    # Layer 4: Dense(16, relu)
    dense1 = np.maximum(0, out2 @ lstm_weights['dense1_w'] + lstm_weights['dense1_b'])
    # Layer 5: Dense(1, linear)
    dense2 = dense1 @ lstm_weights['dense2_w'] + lstm_weights['dense2_b']
    return dense2

def run_autoencoder_numpy(x):
    curr = x
    for i, (w, b) in enumerate(ae_weights):
        curr = curr @ w + b
        if i < len(ae_weights) - 1:
            curr = np.maximum(0, curr) # ReLU
    return curr

def load_models():
    global lstm_weights, lstm_meta, ae_weights, ae_meta, system_metadata

    lstm_w_path = os.path.join(MODELS_DIR, "lstm_numpy_weights.pkl")
    lstm_scaler_path = os.path.join(MODELS_DIR, "lstm_scaler.pkl")
    ae_w_path = os.path.join(MODELS_DIR, "ae_numpy_weights.pkl")
    ae_scaler_path = os.path.join(MODELS_DIR, "ae_scaler.pkl")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")

    print("[INIT] Loading production ML weights into memory...")
    if os.path.exists(lstm_w_path) and os.path.exists(lstm_scaler_path):
        lstm_weights = joblib.load(lstm_w_path)
        lstm_meta = joblib.load(lstm_scaler_path)
        print("  -> LSTM Weights loaded successfully.")

    if os.path.exists(ae_w_path) and os.path.exists(ae_scaler_path):
        ae_weights = joblib.load(ae_w_path)
        ae_meta = joblib.load(ae_scaler_path)
        print("  -> Autoencoder Weights loaded successfully.")

    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            system_metadata = json.load(f)

# Eager load
load_models()

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield

app = FastAPI(
    title="Smart Dam Alert System (SDAS) - ML Inference Service",
    description="Advisory 1-hour ahead water level forecasting and real-time dual-sensor anomaly detection.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React Native mobile apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class TelemetryStep(BaseModel):
    water_level_cm: float
    rainfall_mm: float = 0.0
    temperature_c: float = 28.5
    humidity_pct: float = 78.0

class ForecastRequest(BaseModel):
    history: List[TelemetryStep]

class ForecastResponse(BaseModel):
    predicted_water_level_1hr: float
    predicted_capacity_1hr: float
    current_level_cm: float
    projected_rate_of_change_cm_hr: float
    advisory_status: str
    mape_metric: float
    inference_latency_ms: float

class AnomalyCheckRequest(BaseModel):
    sensor_1_cm: float
    sensor_2_cm: float
    temperature_c: float = 28.5
    humidity_pct: float = 78.0
    sound_speed_mps: Optional[float] = None

class AnomalyCheckResponse(BaseModel):
    is_anomaly: bool
    anomaly_score_mse: float
    threshold_mse: float
    sensor_status: str
    sensor_discrepancy_cm: float
    inference_latency_ms: float

@app.get("/")
def read_root():
    return {
        "service": "SDAS ML Advisory Inference API",
        "version": "2.0.0",
        "institution": "SLTC Research University - Faculty of Computing & IT",
        "status": "OPERATIONAL",
        "runtime": "Lightweight High-Speed Neural Engine"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "lstm_loaded": lstm_weights is not None,
        "autoencoder_loaded": ae_weights is not None,
        "metadata": system_metadata
    }

@app.post("/api/v1/predict", response_model=ForecastResponse)
def predict_water_level(req: ForecastRequest):
    if lstm_weights is None or lstm_meta is None:
        raise HTTPException(status_code=503, detail="LSTM forecasting model not loaded.")

    start_time = time.perf_counter()
    feature_cols = lstm_meta['feature_cols']
    scaler = lstm_meta['scaler']
    window_size = lstm_meta['window']

    records = []
    for item in req.history:
        records.append([
            item.water_level_cm,
            item.rainfall_mm,
            item.temperature_c,
            item.humidity_pct
        ])

    if len(records) < window_size:
        pad_count = window_size - len(records)
        first_elem = records[0] if len(records) > 0 else [45.0, 0.0, 28.5, 78.0]
        records = [first_elem] * pad_count + records
    elif len(records) > window_size:
        records = records[-window_size:]

    input_arr = np.array(records, dtype=np.float32)
    input_scaled = scaler.transform(input_arr)
    input_batch = np.expand_dims(input_scaled, axis=0) # shape (1, 24, 4)

    # Pure NumPy high-speed inference
    pred_scaled = float(predict_lstm_numpy(input_batch)[0, 0])

    dummy = np.zeros((1, len(feature_cols)))
    dummy[0, lstm_meta['target_idx']] = pred_scaled
    pred_level = float(scaler.inverse_transform(dummy)[0, lstm_meta['target_idx']])
    pred_level = max(0.0, min(85.0, pred_level))

    current_level = float(records[-1][0])
    rate_of_change = pred_level - current_level
    pred_capacity = (pred_level / 85.0) * 100.0

    if pred_capacity >= 85.0:
        advisory = "DANGER"
    elif pred_capacity >= 78.0:
        advisory = "CLEAR_AREA"
    elif pred_capacity >= 70.0:
        advisory = "PRE_WARNING"
    else:
        advisory = "NORMAL"

    latency_ms = (time.perf_counter() - start_time) * 1000.0
    mape_val = system_metadata['lstm_metrics']['lstm_mape_pct'] if system_metadata else 0.66

    return ForecastResponse(
        predicted_water_level_1hr=round(pred_level, 2),
        predicted_capacity_1hr=round(pred_capacity, 2),
        current_level_cm=round(current_level, 2),
        projected_rate_of_change_cm_hr=round(rate_of_change, 2),
        advisory_status=advisory,
        mape_metric=mape_val,
        inference_latency_ms=round(latency_ms, 2)
    )

@app.post("/api/v1/anomaly-check", response_model=AnomalyCheckResponse)
def check_anomaly(req: AnomalyCheckRequest):
    if ae_weights is None or ae_meta is None:
        raise HTTPException(status_code=503, detail="Autoencoder anomaly model not loaded.")

    start_time = time.perf_counter()
    scaler = ae_meta['scaler']
    threshold = ae_meta['threshold']

    sound_speed = req.sound_speed_mps or (331.3 + 0.606 * req.temperature_c)
    diff = abs(req.sensor_1_cm - req.sensor_2_cm)

    feat_vector = np.array([[
        req.sensor_1_cm,
        req.sensor_2_cm,
        req.temperature_c,
        req.humidity_pct,
        diff,
        sound_speed
    ]], dtype=np.float32)

    feat_scaled = scaler.transform(feat_vector)
    reconstructed = run_autoencoder_numpy(feat_scaled)
    mse = float(np.mean(np.power(feat_scaled - reconstructed, 2)))

    is_anomaly = (mse > threshold) or (diff > 8.0)
    status = "SENSOR_ANOMALY" if is_anomaly else "HEALTHY"
    latency_ms = (time.perf_counter() - start_time) * 1000.0

    return AnomalyCheckResponse(
        is_anomaly=is_anomaly,
        anomaly_score_mse=round(mse, 5),
        threshold_mse=round(threshold, 5),
        sensor_status=status,
        sensor_discrepancy_cm=round(diff, 2),
        inference_latency_ms=round(latency_ms, 2)
    )

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
