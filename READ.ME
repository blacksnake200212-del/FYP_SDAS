# Smart Dam Alert System (SDAS) with Automated Gate Control

**SLTC Research University | Faculty of Computing and IT**  
**Final Year Project (FYP) — Prototype Engineering & Research System**  
**Authors:** Dias Adrian (Cyber Security), AAA Aadhil (Data Science), JMRA Dilshan (Software Engineering)  
**Supervisors:** Dr. Sanika Wijayasekara (Supervisor), Mr. Kavinda Tharindu (Co-Supervisor)  
**Target Deployment:** Puttalam District, Sri Lanka (Deduru Oya / Rajangana Reservoir Basin)

---

## 🌐 Live Cloud Deployments & Mobile Builds

| Service / App | Platform | Status | URL / Artifact |
|---|---|---|---|
| **Render ML Microservice** | Render Cloud (Python 3.11) | 🟢 Live (HTTP 200) | [`https://fyp-sdas.onrender.com`](https://fyp-sdas.onrender.com) ([Swagger Docs](https://fyp-sdas.onrender.com/docs)) |
| **Supabase Cloud DB & RLS** | Supabase PostgreSQL | 🟢 Active | [`https://ekozmubrolqmtshmjkcw.supabase.co`](https://ekozmubrolqmtshmjkcw.supabase.co) |
| **Public Dam Alert App** | Android Preview (APK) | 🟢 Built & Ready | [📥 Download Public APK](https://expo.dev/artifacts/eas/B2P3AU3xWbEWi70wudPLDyuodKQcWqDlsDjrO3L6_ro.apk) · [EAS Page](https://expo.dev/accounts/vibecodes-team/projects/fypsdas/builds/bae73095-3ef8-431a-88b9-e0e9e43b001e) |
| **Operator Portal App** | Android Preview (APK) | 🟢 Built & Ready | [📥 Download Operator APK](https://expo.dev/artifacts/eas/0ymI6tlgmO99EHBQjtMIoA5xdjWsLNH1eDiEyYOV_H8.apk) · [EAS Page](https://expo.dev/accounts/vibecodes-team/projects/fypsdas-operator/builds/1dcf057e-4028-4aaf-a7f4-7aa33b80e6e8) |
| **GitHub Repository** | GitHub | 🟢 Synced | [`blacksnake200212-del/FYP_SDAS`](https://github.com/blacksnake200212-del/FYP_SDAS.git) |

---

## 📌 Project Architecture Overview

```
                                      [12V 3A DC Input]
                                              │
                                       [SPST Switch]
                                              │
                                  [C1: 1000 µF 25V Filter]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
       ┌──────────────────────────────┐                ┌──────────────────────────────┐
       │  Buck Converter #1 (XL4015)  │                │  Buck Converter #2 (XL4015)  │
       │         12V to 5.0V          │                │         12V to 4.0V          │
       │   (For MG996 Servo & 5V I/O) │                │      (For SIM800L GSM)       │
       └──────────────┬───────────────┘                └──────────────┬───────────────┘
                      │                                               │
             [C2: 1000 µF 16V]                               [C3: 1000 µF 16V]
                      │                                               │
                      ├── +5V Rail                                    └── +4.0V Rail
                      │   ├── ESP32 VIN pin                               └── SIM800L VCC
                      │   ├── MG996 Servo VCC (Red)
                      │   ├── 5V Active Buzzer (+)
                      │   ├── Logic Level Converter HV
                      │   └── JSN-SR04T Sensor 1 & 2 VCC
                      │
                      ▼
       ┌────────────────────────────────────────────────────────────────────────────┐
       │                    ESP32 DevKit V1 (30-pin Microcontroller)                │
       │                         3.3V Regulated Output Rail                         │
       │   ├── DHT22 Temp & Humidity Sensor VCC                                     │
       │   ├── 10kΩ Pull-Up Resistor (R1) for DHT22 DATA                            │
       │   ├── Logic Level Converter LV Pin                                         │
       │   └── RGB LED Module Common Anode (VCC)                                    │
       └────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Structure

```
f:/FYP SDAS/
├── docs/
│   ├── SDAS_Updated_Proposal.pdf             # Academic Research Proposal (IEEE 4-page updated format)
│   ├── SDAS_Final_Project_Report.pdf         # Comprehensive Engineering Final Report (5-page standard)
│   ├── HARDWARE_PINOUT_AND_WIRING_GUIDE.md   # Pinout, power distribution, and assembly guide
│   ├── generate_updated_proposal_pdf.py      # Python script to compile proposal PDF
│   └── generate_final_report_pdf.py          # Python script to compile final report PDF
│
├── hardware_schematic/
│   └── circuit_schematic.png                 # Complete high-resolution electrical wiring diagram
│
├── firmware/
│   └── smart_dam_esp32/
│       ├── smart_dam_esp32.ino               # Main Arduino setup & non-blocking execution loop
│       ├── config.h                          # Pin mappings, thresholds (70%, 85%, 3% hysteresis), WiFi
│       ├── sensors_dual_ultrasonic.h / .cpp  # Dual JSN-SR04T + DHT22 acoustic velocity compensation
│       ├── gate_actuator.h / .cpp            # MG996R servo motor 50Hz PWM smooth controller
│       ├── indicators.h / .cpp               # Common Anode RGB LED & active buzzer siren patterns
│       ├── gsm_sim800l.h / .cpp              # SIM800L AT engine & staged SMS broadcaster
│       ├── state_machine.h / .cpp            # Autonomous 3% hysteresis decision engine (<2s response)
│       └── cloud_supabase.h / .cpp           # WiFi HTTPS telemetry client & override poller
│
├── backend/
│   ├── schema.sql                            # Complete Supabase PostgreSQL schema, RLS & triggers
│   └── seed_data.sql                         # Puttalam reservoir flood history seeds & emergency contacts
│
├── ml_service/
│   ├── app.py                                # FastAPI edge inference server (/predict, /anomaly-check)
│   ├── train_models.py                       # LSTM (MAPE < 5%) & Deep Autoencoder training pipeline
│   ├── synthetic_data_generator.py           # 2-year Puttalam monsoon hydrological time series generator
│   ├── test_inference.py                     # Automated ML test suite
│   ├── requirements.txt                      # Python dependencies
│   └── models/                               # Saved models (.keras, .pkl, metadata)
│
├── mobile_apps/
│   ├── public_app/                           # React Native (Expo) - Community monitoring (No login)
│   │   ├── App.js, package.json, app.json
│   └── operator_app/                         # React Native (Expo) - Operator control (Supabase Auth)
│       ├── App.js, package.json, app.json
│
└── simulation/
    ├── end_to_end_simulator.py               # Virtual ESP32 node simulating physical dam progression
    └── run_verification_tests.py             # Automated unit & integration tests for all targets
```

---

## ⚡ Hardware Pin Assignment Summary

| Peripheral / Signal | ESP32 GPIO | Logic Level | Function / Notes |
|---|---|---|---|
| **Sensor 1 (TRIG)** | **GPIO 5** | 3.3V LV (5V HV) | Through Logic Level Converter Ch 1 |
| **Sensor 1 (ECHO)** | **GPIO 19** | 3.3V LV (5V HV) | Through Logic Level Converter Ch 2 |
| **Sensor 2 (TRIG)** | **GPIO 18** | 3.3V LV (5V HV) | Through Logic Level Converter Ch 3 |
| **Sensor 2 (ECHO)** | **GPIO 21** | 3.3V LV (5V HV) | Through Logic Level Converter Ch 4 |
| **DHT22 Temp & Humidity** | **GPIO 4** | 3.3V Single-Bus | 10kΩ pull-up to 3.3V (Acoustic compensation) |
| **MG996R Servo (Signal)** | **GPIO 25** | 3.3V PWM (50Hz) | Spillway gate aperture regulation (0°–90°) |
| **5V Active Buzzer** | **GPIO 27** | 3.3V Switching | Acoustic alarm siren with 1N4007 flyback diode |
| **RGB LED (Red Cathode)** | **GPIO 32** | Active LOW | Common Anode (220Ω resistor) |
| **RGB LED (Green Cathode)** | **GPIO 33** | Active LOW | Common Anode (220Ω resistor) |
| **RGB LED (Blue Cathode)** | **GPIO 13** | Active LOW | Common Anode (220Ω resistor) |
| **SIM800L GSM (RX / TX)** | **GPIO 16 / 17** | 3.3V UART2 | HardwareSerial2 (16=TX2 to RXD, 17=RX2 to TXD) |

---

## 🚨 Staged Warning & Gate Control Logic (3% Hysteresis)

| Status | Capacity Trigger | Falling Deadband | MG996R Gate Angle | RGB LED | Buzzer | Emergency SMS Dispatch |
|---|---|---|---|---|---|---|
| **NORMAL** | `< 70%` | Reverts `< 67%` | 0° (Closed 0%) | Green | Silent | No SMS; continuous monitoring |
| **PRE-WARNING** | `70% – 85%` | Reverts `< 67%` | 27° (Opening 30%) | Yellow (R+G) | 1s Chirp | Pre-warning SMS to registered contacts |
| **CLEAR-AREA** | Rising in `70%–85%` | Reverts `< 72%` | 54° (Progressive 60%) | Orange | Pulsed Beep | Urgent "Clear Downstream Riverbed" SMS |
| **DANGER** | `> 85%` | Reverts `< 82%` | 90° (Full Open 100%) | Red | Continuous | Emergency SMS to Police, DMC & Public |

---

## 🚀 How to Run and Test

### 1. Compile Research Proposal & Final Report PDFs
```bash
python docs/generate_updated_proposal_pdf.py
python docs/generate_final_report_pdf.py
```
Generated documents are located at:
- `docs/SDAS_Updated_Proposal.pdf`
- `docs/SDAS_Final_Project_Report.pdf`

### 2. Start Advisory Machine Learning Service
```bash
python ml_service/app.py
```
Swagger UI interactive documentation available at: `http://127.0.0.1:8000/docs`.

### 3. Run Automated System Verification Tests
```bash
python simulation/run_verification_tests.py
```
Validates:
- Temperature-compensated acoustic speed formula (±2.0 cm target).
- Local firmware decision latency (< 2.0s).
- 3% Hysteresis stability (chatter elimination).
- LSTM 1-Hour Forecast accuracy (**measured: MAPE = 0.66%**, target < 5%).
- Autoencoder Anomaly Recall (**measured: 100%**, response < 3s).

### 4. Run End-to-End System Simulator
```bash
python simulation/end_to_end_simulator.py
```
Simulates full reservoir flood progression, sensor acquisition, 3% hysteresis gate transitions, and SIM800L staged SMS alerts.

### 5. Launch React Native Mobile Applications
```bash
# Public Monitoring App
cd mobile_apps/public_app
npx expo start

# Operator Control App
cd mobile_apps/operator_app
npx expo start
```
