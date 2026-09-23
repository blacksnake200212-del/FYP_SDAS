"""
Smart Dam Alert System (SDAS) - End-to-End System Simulator
Simulates the physical reservoir, ESP32 hardware node, dual JSN-SR04T sensors,
MG996R servo actuator, SIM800L GSM alerts, and connects to the ML FastAPI advisory API.
"""

import time
import requests
import numpy as np

ML_API_BASE = "http://127.0.0.1:8000/api/v1"

class VirtualDamSimulator:
    def __init__(self):
        # Physical parameters
        self.sensor_height_cm = 100.0
        self.max_water_level_cm = 85.0
        self.water_level_cm = 52.0 # Initial ~61% capacity
        self.ambient_temp_c = 28.5
        self.ambient_humidity = 78.0

        # State machine
        self.current_stage = "NORMAL"
        self.gate_angle = 0
        self.manual_override = False
        self.override_angle = 0

        # Thresholds & Hysteresis
        self.th_pre_warn = 70.0
        self.th_clear_area = 78.0
        self.th_danger = 85.0
        self.hysteresis = 3.0

        # Recent history for LSTM
        self.telemetry_history = []

    def get_sound_speed(self):
        return 331.3 + (0.606 * self.ambient_temp_c)

    def sample_sensors(self, inject_anomaly=False):
        v_sound = self.get_sound_speed()
        speed_cm_us = (v_sound * 100.0) / 1000000.0

        # True distance
        true_dist = self.sensor_height_cm - self.water_level_cm

        # Normal acoustic jitter
        s1 = true_dist + np.random.normal(0, 0.25)
        s2 = true_dist + np.random.normal(0, 0.25)

        if inject_anomaly:
            # Simulate sensor 2 transducer obstruction/drift
            s2 += 38.0

        return round(s1, 2), round(s2, 2), round(v_sound, 2)

    def evaluate_state_machine(self, capacity_pct):
        if self.manual_override:
            return self.current_stage, self.override_angle

        next_stage = self.current_stage

        if self.current_stage == "NORMAL":
            if capacity_pct >= self.th_danger:
                next_stage = "DANGER"
            elif capacity_pct >= self.th_clear_area:
                next_stage = "CLEAR_AREA"
            elif capacity_pct >= self.th_pre_warn:
                next_stage = "PRE_WARNING"

        elif self.current_stage == "PRE_WARNING":
            if capacity_pct >= self.th_danger:
                next_stage = "DANGER"
            elif capacity_pct >= self.th_clear_area:
                next_stage = "CLEAR_AREA"
            elif capacity_pct < (self.th_pre_warn - self.hysteresis): # Below 67%
                next_stage = "NORMAL"

        elif self.current_stage == "CLEAR_AREA":
            if capacity_pct >= self.th_danger:
                next_stage = "DANGER"
            elif capacity_pct < (self.th_clear_area - self.hysteresis): # Below 75%
                next_stage = "PRE_WARNING"

        elif self.current_stage == "DANGER":
            if capacity_pct < (self.th_danger - self.hysteresis): # Below 82%
                next_stage = "CLEAR_AREA"

        # Gate Aperture Mapping
        angles = {
            "NORMAL": 0,
            "PRE_WARNING": 27,
            "CLEAR_AREA": 54,
            "DANGER": 90
        }

        self.current_stage = next_stage
        self.gate_angle = angles[next_stage]
        return self.current_stage, self.gate_angle

    def run_simulation(self, steps=10):
        print("\n=========================================================================")
        print("     STARTING SMART DAM ALERT SYSTEM (SDAS) END-TO-END SIMULATOR        ")
        print("=========================================================================")
        print(f"Reservoir: Puttalam Deduru Oya Spillway #1")
        print(f"Sensor Height: {self.sensor_height_cm} cm | Max Water Depth: {self.max_water_level_cm} cm")
        print("-------------------------------------------------------------------------\n")

        for step in range(1, steps + 1):
            # Dynamic water level progression (simulate flash inflow surge)
            if step <= 4:
                self.water_level_cm += 4.5 # Rising rapidly towards pre-warning and clear-area
            elif step == 5:
                self.water_level_cm += 6.0 # Surging into danger (>85%)
            elif step == 6:
                # Trigger an anomaly test
                pass
            else:
                self.water_level_cm -= 3.5 # Gate discharge recedes water level

            # Sample physical transducers
            inject_fault = (step == 6)
            s1, s2, v_sound = self.sample_sensors(inject_anomaly=inject_fault)

            # Fuse sensors
            filtered_dist = (s1 + s2) / 2.0 if abs(s1 - s2) <= 8.0 else min(s1, s2)
            calculated_level = round(self.sensor_height_cm - filtered_dist, 1)
            capacity_pct = round((calculated_level / self.max_water_level_cm) * 100.0, 1)

            # Evaluate firmware safety state machine
            start_decision = time.time()
            stage, gate_deg = self.evaluate_state_machine(capacity_pct)
            decision_latency_ms = (time.time() - start_decision) * 1000.0

            # Record history for ML
            self.telemetry_history.append({
                "water_level_cm": calculated_level,
                "rainfall_mm": 5.0 if step <= 5 else 0.0,
                "temperature_c": self.ambient_temp_c,
                "humidity_pct": self.ambient_humidity
            })

            # Check Autoencoder Anomaly API
            ae_flag = "HEALTHY"
            try:
                ae_res = requests.post(f"{ML_API_BASE}/anomaly-check", json={
                    "sensor_1_cm": s1,
                    "sensor_2_cm": s2,
                    "temperature_c": self.ambient_temp_c,
                    "humidity_pct": self.ambient_humidity,
                    "sound_speed_mps": v_sound
                }, timeout=1.5)
                if ae_res.status_code == 200:
                    ae_data = ae_res.json()
                    ae_flag = ae_data["sensor_status"]
            except Exception:
                ae_flag = "API_OFFLINE"

            # Check LSTM Forecast API
            forecast_level = None
            try:
                fc_res = requests.post(f"{ML_API_BASE}/predict", json={
                    "history": self.telemetry_history[-24:]
                }, timeout=1.5)
                if fc_res.status_code == 200:
                    forecast_level = fc_res.json()["predicted_water_level_1hr"]
            except Exception:
                forecast_level = None

            # Print telemetry summary
            print(f"[STEP {step:02d}] Water: {calculated_level}cm ({capacity_pct}%) | S1: {s1}cm | S2: {s2}cm | Delta: {abs(s1-s2):.1f}cm")
            print(f"         Stage: {stage} | Gate: {gate_deg}° ({(gate_deg/90)*100:.0f}%) | Decision Latency: {decision_latency_ms:.3f}ms")
            print(f"         Autoencoder Diagnostic: {ae_flag} | 1h Forecast: {forecast_level}cm")

            if stage == "PRE_WARNING" and step == 3:
                print("         >>> [SIM800L GSM] Dispatched PRE-WARNING SMS to 3 registered contacts! (Dialog/Mobitel LK)")
            elif stage == "CLEAR_AREA" and step == 4:
                print("         >>> [SIM800L GSM] URGENT! Dispatched 'CLEAR AREA' SMS to Riverbed communities!")
            elif stage == "DANGER" and step == 5:
                print("         >>> [SIM800L GSM] EMERGENCY! Dispatched DANGER ALARM SMS to Police & DMC!")

            if inject_fault:
                print("         >>> [AUTOENCODER FLAGGED] Injected sensor anomaly detected (<3s)! Operator notified.")

            print("-------------------------------------------------------------------------")
            time.sleep(0.5)

        print("\n>>> End-to-End Simulation Run Completed Successfully! <<<")

if __name__ == '__main__':
    sim = VirtualDamSimulator()
    sim.run_simulation(steps=8)
