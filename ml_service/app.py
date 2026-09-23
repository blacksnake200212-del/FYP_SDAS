"""
FastAPI Cloud/Edge Inference Server for Smart Dam Alert System (SDAS)
Provides advisory ML inference:
- 1-Hour Ahead LSTM Water Level Forecast (MAPE < 5%)
- Deep Autoencoder Dual-Sensor Anomaly & Drift Detection
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
import tensorflow as tf

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from contextlib import asynccontextmanager

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

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Global model holders
lstm_model = None
lstm_meta = None
ae_model = None
ae_meta = None
system_metadata = None

def load_models():
    global lstm_model, lstm_meta, ae_model, ae_meta, system_metadata

    lstm_model_path = os.path.join(MODELS_DIR, "lstm_water_level_model.keras")
    lstm_scaler_path = os.path.join(MODELS_DIR, "lstm_scaler.pkl")
    ae_model_path = os.path.join(MODELS_DIR, "autoencoder_anomaly_model.keras")
    ae_scaler_path = os.path.join(MODELS_DIR, "ae_scaler.pkl")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")

    print("[INIT] Loading trained ML models into memory...")
    if os.path.exists(lstm_model_path) and os.path.exists(lstm_scaler_path):
        lstm_model = tf.keras.models.load_model(lstm_model_path)
        lstm_meta = joblib.load(lstm_scaler_path)
        print("  -> LSTM Forecast Model loaded successfully.")

    if os.path.exists(ae_model_path) and os.path.exists(ae_scaler_path):
        ae_model = tf.keras.models.load_model(ae_model_path)
        ae_meta = joblib.load(ae_scaler_path)
        print("  -> Autoencoder Anomaly Model loaded successfully.")

    if os.path.exists(meta_path):
        with open(meta_path, 'r') as f:
            system_metadata = json.load(f)

# Ensure models are loaded immediately upon module import
load_models()


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
        "status": "OPERATIONAL"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "lstm_loaded": lstm_model is not None,
        "autoencoder_loaded": ae_model is not None,
        "metadata": system_metadata
    }

@app.post("/api/v1/predict", response_model=ForecastResponse)
def predict_water_level(req: ForecastRequest):
    if lstm_model is None or lstm_meta is None:
        raise HTTPException(status_code=503, detail="LSTM forecasting model not loaded.")

    start_time = time.time()
    feature_cols = lstm_meta['feature_cols']
    scaler = lstm_meta['scaler']
    window_size = lstm_meta['window']

    # Convert request history into array
    records = []
    for item in req.history:
        records.append([
            item.water_level_cm,
            item.rainfall_mm,
            item.temperature_c,
            item.humidity_pct
        ])

    if len(records) < window_size:
        # If fewer than 24 points, replicate first element to pad window
        pad_count = window_size - len(records)
        first_elem = records[0] if len(records) > 0 else [45.0, 0.0, 28.5, 78.0]
        records = [first_elem] * pad_count + records
    elif len(records) > window_size:
        records = records[-window_size:]

    input_arr = np.array(records)
    input_scaled = scaler.transform(input_arr)
    input_batch = np.expand_dims(input_scaled, axis=0) # shape (1, 24, 4)

    # Execute inference
    pred_scaled = lstm_model.predict(input_batch, verbose=0)[0, 0]

    # Inverse transform
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

    latency_ms = (time.time() - start_time) * 1000.0
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
    if ae_model is None or ae_meta is None:
        raise HTTPException(status_code=503, detail="Autoencoder anomaly model not loaded.")

    start_time = time.time()
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
    ]])

    feat_scaled = scaler.transform(feat_vector)
    reconstructed = ae_model.predict(feat_scaled, verbose=0)
    mse = float(np.mean(np.power(feat_scaled - reconstructed, 2)))

    is_anomaly = (mse > threshold) or (diff > 8.0)
    status = "SENSOR_ANOMALY" if is_anomaly else "HEALTHY"
    latency_ms = (time.time() - start_time) * 1000.0

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
