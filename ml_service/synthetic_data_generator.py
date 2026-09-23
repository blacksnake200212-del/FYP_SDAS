"""
Synthetic Hydrological Data Generator for Puttalam District (Deduru Oya Reservoir Basin)
Generates 2 years of hourly sensor time-series simulating monsoon floods, baseflow,
diurnal temperature shifts, and injected sensor faults for Autoencoder training.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_puttalam_data(n_hours=10000, seed=42):
    np.random.seed(seed)
    
    start_date = datetime(2022, 1, 1, 0, 0)
    timestamps = [start_date + timedelta(hours=i) for i in range(n_hours)]
    
    # 1. Base seasonality & diurnal cycles
    t = np.arange(n_hours)
    
    # Diurnal cycle (24 hours) for temperature and humidity
    diurnal_cycle = np.sin(2 * np.pi * t / 24.0)
    
    # Ambient Temperature: Puttalam tropical coastal (23C night to 34C afternoon)
    temperature = 28.5 + 4.5 * diurnal_cycle + np.random.normal(0, 0.6, n_hours)
    temperature = np.clip(temperature, 21.0, 38.0)
    
    # Humidity: Inversely related to temperature (60% to 95%)
    humidity = 78.0 - 14.0 * diurnal_cycle + np.random.normal(0, 2.0, n_hours)
    humidity = np.clip(humidity, 55.0, 99.0)
    
    # Speed of sound based on acoustic formula: v = 331.3 + 0.606 * T
    sound_speed = 331.3 + 0.606 * temperature
    
    # 2. Rainfall & Hydrological Inflow (Puttalam Monsoon surges)
    # Monsoons occur roughly in May-Sep (Southwest) and Oct-Dec (Northeast)
    seasonal_monsoon = 0.5 * (np.sin(2 * np.pi * t / (365.25 * 24)) + 1.0)
    
    # Rain events are sparse but heavy
    rain_probability = 0.08 + 0.15 * seasonal_monsoon
    is_raining = (np.random.rand(n_hours) < rain_probability).astype(float)
    rainfall_intensity = np.random.exponential(scale=18.0, size=n_hours) * is_raining
    
    # Inflow accumulates rainfall with hydrological runoff lag
    inflow = np.zeros(n_hours)
    current_inflow = 5.0 # Baseflow
    for i in range(1, n_hours):
        current_inflow = current_inflow * 0.94 + rainfall_intensity[i] * 1.8 + np.random.normal(0, 0.3)
        current_inflow = max(2.0, current_inflow)
        inflow[i] = current_inflow
        
    # 3. Reservoir Water Level (Max 85 cm prototype scale; baseline ~45 cm)
    # Spillway automatically releases when level gets high
    water_level = np.zeros(n_hours)
    curr_level = 42.0
    gate_opening = 0.0
    
    for i in range(n_hours):
        # Inflow raises level
        inflow_rise = (inflow[i] / 60.0)
        
        # Gate discharge lowers level
        discharge = (gate_opening / 100.0) * 1.6
        evap_loss = 0.04
        
        curr_level = curr_level + inflow_rise - discharge - evap_loss + np.random.normal(0, 0.08)
        curr_level = np.clip(curr_level, 20.0, 85.0)
        water_level[i] = curr_level
        
        # Simulated gate response logic (staged)
        cap = (curr_level / 85.0) * 100.0
        if cap > 85.0:
            gate_opening = 100.0
        elif cap > 78.0:
            gate_opening = 60.0
        elif cap > 70.0:
            gate_opening = 25.0
        elif cap < 67.0:
            gate_opening = 0.0
            
    capacity_pct = (water_level / 85.0) * 100.0
    
    # 4. Dual Sensor Ranging (Distance = 100 cm - Water Level)
    true_distance = 100.0 - water_level
    sensor_1 = true_distance + np.random.normal(0, 0.4, n_hours)
    sensor_2 = true_distance + np.random.normal(0, 0.4, n_hours)
    
    is_anomaly = np.zeros(n_hours, dtype=bool)
    
    # 5. Inject realistic sensor faults for Autoencoder evaluation (~2% of data)
    n_faults = int(n_hours * 0.02)
    fault_indices = np.random.choice(n_hours, size=n_faults, replace=False)
    
    for idx in fault_indices:
        fault_type = np.random.choice(['spike', 'drift', 'sensor1_fail', 'stuck'])
        is_anomaly[idx] = True
        if fault_type == 'spike':
            sensor_1[idx] += np.random.choice([-15.0, 20.0])
        elif fault_type == 'drift':
            sensor_2[idx] += 12.0
        elif fault_type == 'sensor1_fail':
            sensor_1[idx] = 99.0 # complete dropout
        elif fault_type == 'stuck':
            sensor_2[idx] = sensor_2[max(0, idx-1)] + 18.0

    df = pd.DataFrame({
        'timestamp': timestamps,
        'rainfall_mm': np.round(rainfall_intensity, 2),
        'inflow_m3s': np.round(inflow, 2),
        'water_level_cm': np.round(water_level, 2),
        'capacity_pct': np.round(capacity_pct, 2),
        'sensor_1_cm': np.round(sensor_1, 2),
        'sensor_2_cm': np.round(sensor_2, 2),
        'temperature_c': np.round(temperature, 2),
        'humidity_pct': np.round(humidity, 2),
        'sound_speed_mps': np.round(sound_speed, 2),
        'is_anomaly': is_anomaly
    })
    
    return df

if __name__ == '__main__':
    df = generate_puttalam_data(n_hours=10000)
    out_csv = "f:/FYP SDAS/ml_service/puttalam_hydrology_data.csv"
    df.to_csv(out_csv, index=False)
    print(f"Generated {len(df)} hourly hydrological observations saved to {out_csv}")
    print(df.head())
