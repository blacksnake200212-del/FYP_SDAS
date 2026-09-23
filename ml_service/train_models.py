"""
Model Training Pipeline for Smart Dam Alert System (SDAS)
1. LSTM 1-Hour Ahead Water Level Forecasting Model (Target MAPE < 5%)
2. Deep Autoencoder Sensor Anomaly & Drift Detection Model
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error, mean_absolute_error

# Suppress excessive TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def train_lstm_forecasting(df, save_dir):
    print("\n--- Training LSTM Water Level Forecasting Model ---")
    
    # Features for sequence model
    feature_cols = ['water_level_cm', 'rainfall_mm', 'temperature_c', 'humidity_pct']
    target_col = 'water_level_cm'
    
    # Chronological Split (80% train, 20% test)
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]
    
    scaler = MinMaxScaler()
    train_scaled = scaler.fit_transform(train_df[feature_cols])
    test_scaled = scaler.transform(test_df[feature_cols])
    
    # Build sliding sequence windows (past 24 hours -> predict 1 hour ahead)
    WINDOW_SIZE = 24
    
    def create_sequences(data, target_idx, window):
        X, y = [], []
        for i in range(len(data) - window):
            X.append(data[i:i+window])
            y.append(data[i+window, target_idx])
        return np.array(X), np.array(y)
    
    target_idx = feature_cols.index(target_col)
    X_train, y_train = create_sequences(train_scaled, target_idx, WINDOW_SIZE)
    X_test, y_test = create_sequences(test_scaled, target_idx, WINDOW_SIZE)
    
    print(f"LSTM Training shape: {X_train.shape}, Test shape: {X_test.shape}")
    
    # Neural Network Architecture
    model = Sequential([
        LSTM(48, return_sequences=True, input_shape=(WINDOW_SIZE, len(feature_cols))),
        Dropout(0.15),
        LSTM(24),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.003), loss='mse')
    
    # Train model
    history = model.fit(
        X_train, y_train,
        validation_split=0.15,
        epochs=12,
        batch_size=64,
        verbose=1
    )
    
    # Evaluate on Test Set
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    
    # Invert scaling for target feature
    dummy_pred = np.zeros((len(y_pred_scaled), len(feature_cols)))
    dummy_pred[:, target_idx] = y_pred_scaled
    y_pred_actual = scaler.inverse_transform(dummy_pred)[:, target_idx]
    
    dummy_test = np.zeros((len(y_test), len(feature_cols)))
    dummy_test[:, target_idx] = y_test
    y_test_actual = scaler.inverse_transform(dummy_test)[:, target_idx]
    
    mape = mean_absolute_percentage_error(y_test_actual, y_pred_actual) * 100.0
    rmse = np.sqrt(mean_squared_error(y_test_actual, y_pred_actual))
    mae = mean_absolute_error(y_test_actual, y_pred_actual)
    
    print(f"\n[LSTM EVALUATION RESULTS]")
    print(f"  * Mean Absolute Percentage Error (MAPE): {mape:.2f}% (Target: <5.0%)")
    print(f"  * Root Mean Squared Error (RMSE):        {rmse:.2f} cm")
    print(f"  * Mean Absolute Error (MAE):             {mae:.2f} cm")
    
    # Save Model and Scaler
    model_path = os.path.join(save_dir, "lstm_water_level_model.keras")
    scaler_path = os.path.join(save_dir, "lstm_scaler.pkl")
    model.save(model_path)
    joblib.dump({'scaler': scaler, 'feature_cols': feature_cols, 'target_idx': target_idx, 'window': WINDOW_SIZE}, scaler_path)
    print(f"Saved LSTM model to {model_path}")
    
    return {
        'lstm_mape_pct': float(mape),
        'lstm_rmse_cm': float(rmse),
        'lstm_mae_cm': float(mae)
    }

def train_autoencoder_anomaly(df, save_dir):
    print("\n--- Training Deep Autoencoder Anomaly Detection Model ---")
    
    # Create discrepancy feature
    df_copy = df.copy()
    df_copy['sensor_diff_cm'] = np.abs(df_copy['sensor_1_cm'] - df_copy['sensor_2_cm'])
    
    ae_features = ['sensor_1_cm', 'sensor_2_cm', 'temperature_c', 'humidity_pct', 'sensor_diff_cm', 'sound_speed_mps']
    
    # Train Autoencoder strictly on normal operational telemetry (is_anomaly == False)
    normal_df = df_copy[df_copy['is_anomaly'] == False]
    anomalous_df = df_copy[df_copy['is_anomaly'] == True]
    
    scaler = StandardScaler()
    X_normal_scaled = scaler.fit_transform(normal_df[ae_features])
    
    # Autoencoder Architecture
    input_dim = len(ae_features)
    input_layer = Input(shape=(input_dim,))
    encoded = Dense(16, activation='relu')(input_layer)
    encoded = Dense(8, activation='relu')(encoded)
    bottleneck = Dense(4, activation='relu')(encoded)
    decoded = Dense(8, activation='relu')(bottleneck)
    decoded = Dense(16, activation='relu')(decoded)
    output_layer = Dense(input_dim, activation='linear')(decoded)
    
    autoencoder = Model(inputs=input_layer, outputs=output_layer)
    autoencoder.compile(optimizer='adam', loss='mse')
    
    autoencoder.fit(
        X_normal_scaled, X_normal_scaled,
        epochs=15,
        batch_size=64,
        validation_split=0.15,
        verbose=1
    )
    
    # Determine reconstruction error threshold (99th percentile of normal data)
    reconstructions = autoencoder.predict(X_normal_scaled, verbose=0)
    normal_mse = np.mean(np.power(X_normal_scaled - reconstructions, 2), axis=1)
    threshold = float(np.percentile(normal_mse, 99.0))
    
    # Test on anomalous records
    X_anomaly_scaled = scaler.transform(anomalous_df[ae_features])
    anomaly_reconstructions = autoencoder.predict(X_anomaly_scaled, verbose=0)
    anomaly_mse = np.mean(np.power(X_anomaly_scaled - anomaly_reconstructions, 2), axis=1)
    
    detected_anomalies = np.sum(anomaly_mse > threshold)
    detection_rate = (detected_anomalies / len(anomalous_df)) * 100.0
    
    print(f"\n[AUTOENCODER EVALUATION RESULTS]")
    print(f"  * Calibrated Reconstruction Threshold (99%): {threshold:.5f}")
    print(f"  * Anomaly Detection Recall:                  {detection_rate:.2f}% ({detected_anomalies}/{len(anomalous_df)})")
    print(f"  * Average Normal MSE:                        {np.mean(normal_mse):.5f}")
    print(f"  * Average Anomaly MSE:                       {np.mean(anomaly_mse):.5f}")
    
    # Save Autoencoder Model and Scaler
    ae_model_path = os.path.join(save_dir, "autoencoder_anomaly_model.keras")
    ae_scaler_path = os.path.join(save_dir, "ae_scaler.pkl")
    autoencoder.save(ae_model_path)
    joblib.dump({'scaler': scaler, 'features': ae_features, 'threshold': threshold}, ae_scaler_path)
    print(f"Saved Autoencoder model to {ae_model_path}")
    
    return {
        'anomaly_threshold_mse': threshold,
        'anomaly_recall_pct': float(detection_rate),
        'normal_mean_mse': float(np.mean(normal_mse)),
        'anomaly_mean_mse': float(np.mean(anomaly_mse))
    }

if __name__ == '__main__':
    csv_file = "f:/FYP SDAS/ml_service/puttalam_hydrology_data.csv"
    save_directory = "f:/FYP SDAS/ml_service/models"
    os.makedirs(save_directory, exist_ok=True)
    
    df = pd.read_csv(csv_file)
    print(f"Loaded dataset with {len(df)} records from {csv_file}")
    
    lstm_results = train_lstm_forecasting(df, save_directory)
    ae_results = train_autoencoder_anomaly(df, save_directory)
    
    # Save summary metadata
    metadata = {
        'dataset_records': len(df),
        'lstm_metrics': lstm_results,
        'autoencoder_metrics': ae_results,
        'model_status': 'TRAINED_AND_VALIDATED'
    }
    
    meta_path = os.path.join(save_directory, "model_metadata.json")
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"\nSaved combined metadata to {meta_path}")
