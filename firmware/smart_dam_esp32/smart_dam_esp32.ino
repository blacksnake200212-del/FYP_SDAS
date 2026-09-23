/**
 * ============================================================================
 * SMART DAM ALERT SYSTEM (SDAS) - ESP32 FIRMWARE
 * SLTC Research University | Faculty of Computing & IT | Final Year Project
 * 
 * Hardware Architecture:
 * - ESP32 DevKit V1
 * - Dual JSN-SR04T Waterproof Ultrasonic Sensors (Via ML2029 Logic Level Converter)
 * - DHT22 Temperature & Humidity Sensor (Dynamic Acoustic Velocity Compensation)
 * - MG996R Metal-Gear High-Torque Servo Motor (Spillway Gate Actuator on GPIO25)
 * - SIM800L GSM Cellular Modem (Staged Emergency SMS Alerts on Serial2)
 * - Common Anode RGB LED Module (Active LOW on GPIO32, 33, 13)
 * - 5V Active Buzzer (Emergency Siren on GPIO27 with Flyback Diode)
 * - Isolated Dual-Rail XL4015 Buck Power System (5V and 4V)
 * ============================================================================
 */

#include <Arduino.h>
#include "config.h"
#include "sensors_dual_ultrasonic.h"
#include "gate_actuator.h"
#include "indicators.h"
#include "gsm_sim800l.h"
#include "state_machine.h"
#include "cloud_supabase.h"

// Instantiate System Subsystems
DualUltrasonicSensors sensors;
GateActuator gate;
SystemIndicators indicators;
GsmSim800L gsm;
DamSafetyStateMachine stateMachine(gate, indicators, gsm);
CloudSupabase cloud;

// Periodic Timers
unsigned long lastSensorSampleTime = 0;
unsigned long lastCloudPublishTime = 0;
unsigned long lastOverrideCheckTime = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n=======================================================");
    Serial.println("  SMART DAM ALERT SYSTEM (SDAS) INITIALIZING...        ");
    Serial.println("=======================================================");

    // 1. Initialize Visual & Acoustic Warning Indicators
    Serial.print("[INIT] Configuring RGB LED & Active Buzzer...");
    indicators.begin();
    Serial.println(" OK");

    // 2. Initialize MG996R High-Torque Gate Actuator
    Serial.print("[INIT] Initializing MG996R Servo on GPIO25 (50Hz PWM)...");
    gate.begin();
    Serial.println(" OK (Spillway Closed 0 deg)");

    // 3. Initialize Dual JSN-SR04T Waterproof Ultrasonic & DHT22 Sensors
    Serial.print("[INIT] Initializing Dual Ultrasonic Transducers & DHT22...");
    sensors.begin();
    Serial.println(" OK");

    // 4. Initialize SIM800L GSM Cellular Modem
    Serial.print("[INIT] Initializing SIM800L GSM Modem on UART2 (Pins 16/17)...");
    gsm.begin();
    if (gsm.isModuleReady()) {
        Serial.print(" OK (Signal RSSI: ");
        Serial.print(gsm.getSignalQuality());
        Serial.println(")");
    } else {
        Serial.println(" WARNING: SIM800L not responding (will retry in loop)");
    }

    // 5. Initialize Autonomous Safety State Machine
    Serial.print("[INIT] Initializing 3% Hysteresis Safety State Machine...");
    stateMachine.begin();
    Serial.println(" OK (State: NORMAL)");

    // 6. Connect to WiFi & Supabase Cloud
    Serial.print("[INIT] Initializing WiFi & Supabase Cloud Client...");
    cloud.begin();
    Serial.println(" OK (Background Connection)");

    Serial.println("=======================================================");
    Serial.println("  SYSTEM FULLY ARMED — RUNNING AUTONOMOUS DECISION LOOP");
    Serial.println("=======================================================\n");
}

void loop() {
    unsigned long now = millis();

    // 1. Non-blocking high-frequency updates (Servo smooth stepping & LED/Buzzer patterns)
    gate.update();
    indicators.update();
    gsm.update();

    // 2. Periodic Sensor Acquisition & Deterministic Safety Evaluation (Every 500 ms)
    if (now - lastSensorSampleTime >= SENSOR_SAMPLE_INTERVAL_MS) {
        lastSensorSampleTime = now;

        // Acquire temperature-compensated telemetry
        ReservoirTelemetry telemetry = sensors.readSensors();

        // Evaluate deterministic state machine (<2.0s local decision guarantee)
        stateMachine.evaluate(telemetry);

        // Debug output to Serial Monitor
        Serial.printf("[TELEMETRY] H2O: %.1fcm (%.1f%%) | S1: %.1fcm | S2: %.1fcm | Temp: %.1fC | Gate: %d deg (%.0f%%) | State: %s\n",
            telemetry.water_level_cm,
            telemetry.capacity_pct,
            telemetry.distance1_cm,
            telemetry.distance2_cm,
            telemetry.temperature_c,
            gate.getCurrentAngle(),
            gate.getCurrentPercent(),
            stateMachine.getStageName()
        );

        if (telemetry.sensor_discrepancy) {
            Serial.println("  -> [ALERT] Sensor discrepancy detected between S1 and S2!");
        }
    }

    // 3. Periodic Cloud Telemetry Publishing (Every 2000 ms)
    if (now - lastCloudPublishTime >= TELEMETRY_INTERVAL_MS) {
        lastCloudPublishTime = now;
        ReservoirTelemetry currentData = sensors.readSensors();
        bool pubOk = cloud.publishTelemetry(currentData, stateMachine, gate);
        if (pubOk) {
            // Telemetry successfully pushed to Supabase
        }
    }

    // 4. Periodic Operator Manual Override Check (Every 1500 ms)
    if (now - lastOverrideCheckTime >= OVERRIDE_CHECK_INTERVAL_MS) {
        lastOverrideCheckTime = now;
        cloud.checkRemoteOverride(gate);
    }
}
