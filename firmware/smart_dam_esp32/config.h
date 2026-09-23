#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ============================================================================
// HARDWARE PIN ASSIGNMENTS (Matching Circuit Schematic Exactly)
// ============================================================================

// Dual JSN-SR04T Waterproof Ultrasonic Sensors (Via Logic Level Converter)
#define PIN_TRIG_1          5    // Ultrasonic Sensor 1 Trigger (LV1 <-> HV1)
#define PIN_ECHO_1          19   // Ultrasonic Sensor 1 Echo (LV2 <-> HV2)
#define PIN_TRIG_2          18   // Ultrasonic Sensor 2 Trigger (LV3 <-> HV3)
#define PIN_ECHO_2          21   // Ultrasonic Sensor 2 Echo (LV4 <-> HV4)

// DHT22 Temperature & Humidity Sensor (Acoustic Velocity Compensation)
#define PIN_DHT22           4    // Single-bus data with 10k pull-up to 3.3V

// MG996R High-Torque Servo Motor (Gate Actuator)
#define PIN_SERVO_GATE      25   // PWM Signal Output (LEDC Channel 0)

// Visual Indicators - RGB LED Module (Common Anode, Active LOW via 220Ω)
#define PIN_RGB_RED         32   // Red Cathode
#define PIN_RGB_GREEN       33   // Green Cathode
#define PIN_RGB_BLUE        13   // Blue Cathode

// Audio Indicator - 5V Active Buzzer
#define PIN_BUZZER          27   // Buzzer Driver (Protected by 1N4007 Diode)

// Cellular Modem - SIM800L GSM Module (HardwareSerial 2)
#define PIN_GSM_TX          16   // ESP32 TX2 -> SIM800L RXD
#define PIN_GSM_RX          17   // ESP32 RX2 <- SIM800L TXD
#define GSM_BAUD_RATE       9600

// ============================================================================
// RESERVOIR CALIBRATION & THRESHOLD CONSTANTS
// ============================================================================

// Reservoir Geometry (Prototype scale: 100 cm full depth)
#define RESERVOIR_SENSOR_HEIGHT_CM   100.0f  // Total height of sensor above dam bed
#define RESERVOIR_MAX_WATER_CM       85.0f   // Max capacity water level (100% full)
#define SENSOR_MIN_DISTANCE_CM       15.0f   // Minimum blind zone of JSN-SR04T (~20cm)

// Staged Thresholds (in % Capacity)
#define THRESHOLD_PRE_WARNING_PCT    70.0f   // Gate opens 25%, Pre-warning alert
#define THRESHOLD_CLEAR_AREA_PCT     78.0f   // Gate opens 60%, Evacuate riverbed
#define THRESHOLD_DANGER_PCT         85.0f   // Gate opens 100%, Danger alarm

// Hysteresis Band (3% Deadband to prevent actuator chattering)
#define HYSTERESIS_PCT               3.0f

// Gate Angular Positions (MG996R Servo Degrees)
#define GATE_ANGLE_CLOSED            0       // 0% aperture (0 degrees)
#define GATE_ANGLE_PRE_WARNING       27      // ~30% aperture (27 degrees)
#define GATE_ANGLE_CLEAR_AREA        54      // ~60% aperture (54 degrees)
#define GATE_ANGLE_DANGER_FULL       90      // 100% full open (90 degrees)

// Dual Sensor Cross-Validation
#define SENSOR_DISCREPANCY_LIMIT_CM  8.0f    // Max allowed delta between S1 and S2

// ============================================================================
// NETWORK, CLOUD & TELEPHONY CREDENTIALS
// ============================================================================

// WiFi Configuration
#define WIFI_SSID           "SDAS_Dam_Field_AP"
#define WIFI_PASS           "SmartDam2026!"

// Supabase Cloud Configuration
#define SUPABASE_URL        "https://ekozmubrolqmtshmjkcw.supabase.co"
#define SUPABASE_ANON_KEY   "sb_publishable_B3VAEM-xgoDik7RGUAnXLw_6JhQFYzO"
#define SUPABASE_REST_PATH  "/rest/v1/sensor_readings"

// ML Inference Cloud Server (Advisory Endpoint)
#define ML_SERVER_URL       "http://192.168.1.100:8000/api/v1/predict"

// GSM Emergency Broadcast Contacts (Puttalam District Dispatch)
#define PHONE_OPERATOR_1    "+94771234567"
#define PHONE_POLICE_HQ     "+94322222222"
#define PHONE_DISASTER_CTR  "+94112670002"

// Telemetry Publication Intervals (Milliseconds)
#define TELEMETRY_INTERVAL_MS        2000
#define OVERRIDE_CHECK_INTERVAL_MS   1500
#define SENSOR_SAMPLE_INTERVAL_MS    500

#endif // CONFIG_H
