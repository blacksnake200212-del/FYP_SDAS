"""
Test script for ML models and FastAPI endpoints
"""

import os
import json
from fastapi.testclient import TestClient
from app import app

def test_system():
    with TestClient(app) as client:
        print("Testing /api/v1/health ...")
        res = client.get("/api/v1/health")
        assert res.status_code == 200, res.text
        print("Health response:", json.dumps(res.json(), indent=2))

        print("\nTesting /api/v1/predict (LSTM Forecast) ...")
        history = [
            {"water_level_cm": 50.0 + (i * 0.5), "rainfall_mm": 2.0, "temperature_c": 28.5, "humidity_pct": 80.0}
            for i in range(24)
        ]
        res_pred = client.post("/api/v1/predict", json={"history": history})
        assert res_pred.status_code == 200, res_pred.text
        print("Predict response:", json.dumps(res_pred.json(), indent=2))

        print("\nTesting /api/v1/anomaly-check (Normal Reading) ...")
        normal_reading = {
            "sensor_1_cm": 38.0,
            "sensor_2_cm": 38.2,
            "temperature_c": 28.5,
            "humidity_pct": 78.0
        }
        res_normal = client.post("/api/v1/anomaly-check", json=normal_reading)
        assert res_normal.status_code == 200, res_normal.text
        print("Normal response:", json.dumps(res_normal.json(), indent=2))

        print("\nTesting /api/v1/anomaly-check (Anomalous Reading) ...")
        anomaly_reading = {
            "sensor_1_cm": 38.0,
            "sensor_2_cm": 85.0, # High sensor disagreement/drift
            "temperature_c": 28.5,
            "humidity_pct": 78.0
        }
        res_anomaly = client.post("/api/v1/anomaly-check", json=anomaly_reading)
        assert res_anomaly.status_code == 200, res_anomaly.text
        print("Anomaly response:", json.dumps(res_anomaly.json(), indent=2))
        assert res_anomaly.json()["is_anomaly"] == True, "Failed to flag anomaly!"
        print("\n>>> ALL ML INFERENCE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_system()
