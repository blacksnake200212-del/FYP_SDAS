#ifndef GATE_ACTUATOR_H
#define GATE_ACTUATOR_H

#include <Arduino.h>
#include "config.h"

class GateActuator {
public:
    GateActuator();
    void begin();
    
    // Automatic control interface
    void setTargetAngle(int angleDegrees);
    void setTargetPercent(float percent);
    
    // Operator Manual Override interface
    void enableManualOverride(int angleDegrees);
    void disableManualOverride();
    bool isManualOverrideActive() const { return manualOverrideActive; }

    // Stepping update (call periodically in loop for smooth motion)
    void update();

    // Telemetry getters
    int getCurrentAngle() const { return currentAngle; }
    float getCurrentPercent() const { return (float)currentAngle / (float)GATE_ANGLE_DANGER_FULL * 100.0f; }

private:
    int currentAngle;
    int targetAngle;
    bool manualOverrideActive;
    unsigned long lastStepTime;

    // LEDC PWM hardware configuration for ESP32
    static const uint8_t LEDC_CHANNEL = 0;
    static const uint32_t LEDC_FREQ = 50;         // 50 Hz standard servo frequency
    static const uint8_t LEDC_RESOLUTION = 16;     // 16-bit resolution (0-65535)

    // Pulse width mapping for MG996R (500us to 2500us at 20ms period)
    uint32_t angleToDutyCycle(int angle);
    void writePwmDuty(uint32_t duty);
};

#endif // GATE_ACTUATOR_H
