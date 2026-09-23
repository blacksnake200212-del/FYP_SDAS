#include "gate_actuator.h"

GateActuator::GateActuator() 
    : currentAngle(GATE_ANGLE_CLOSED), targetAngle(GATE_ANGLE_CLOSED), 
      manualOverrideActive(false), lastStepTime(0) {}

void GateActuator::begin() {
    // Configure ESP32 LEDC PWM timer and channel on PIN_SERVO_GATE (GPIO25)
    #if defined(ESP_IDF_VERSION_MAJOR) && (ESP_IDF_VERSION_MAJOR >= 5)
        ledcAttachChannel(PIN_SERVO_GATE, LEDC_FREQ, LEDC_RESOLUTION, LEDC_CHANNEL);
    #else
        ledcSetup(LEDC_CHANNEL, LEDC_FREQ, LEDC_RESOLUTION);
        ledcAttachPin(PIN_SERVO_GATE, LEDC_CHANNEL);
    #endif

    // Initial position: Closed (0 degrees)
    currentAngle = GATE_ANGLE_CLOSED;
    targetAngle = GATE_ANGLE_CLOSED;
    writePwmDuty(angleToDutyCycle(currentAngle));
}

uint32_t GateActuator::angleToDutyCycle(int angle) {
    // Clamp angle between 0 and 90 degrees (or 180 degrees)
    if (angle < 0) angle = 0;
    if (angle > GATE_ANGLE_DANGER_FULL) angle = GATE_ANGLE_DANGER_FULL;

    // MG996R servo standard timings:
    // 0 deg   -> ~544 microseconds pulse
    // 90 deg  -> ~1500 microseconds pulse
    // 180 deg -> ~2400 microseconds pulse
    // Period = 20,000 microseconds (50 Hz)
    // 16-bit timer max = 65,535
    float pulseUs = 544.0f + ((float)angle / 90.0f) * (1500.0f - 544.0f);
    float dutyFraction = pulseUs / 20000.0f;
    uint32_t duty = (uint32_t)(dutyFraction * 65535.0f);
    return duty;
}

void GateActuator::writePwmDuty(uint32_t duty) {
    ledcWrite(LEDC_CHANNEL, duty);
}

void GateActuator::setTargetAngle(int angleDegrees) {
    if (!manualOverrideActive) {
        if (angleDegrees < 0) angleDegrees = 0;
        if (angleDegrees > GATE_ANGLE_DANGER_FULL) angleDegrees = GATE_ANGLE_DANGER_FULL;
        targetAngle = angleDegrees;
    }
}

void GateActuator::setTargetPercent(float percent) {
    if (!manualOverrideActive) {
        if (percent < 0.0f) percent = 0.0f;
        if (percent > 100.0f) percent = 100.0f;
        int angle = (int)((percent / 100.0f) * GATE_ANGLE_DANGER_FULL);
        setTargetAngle(angle);
    }
}

void GateActuator::enableManualOverride(int angleDegrees) {
    manualOverrideActive = true;
    if (angleDegrees < 0) angleDegrees = 0;
    if (angleDegrees > GATE_ANGLE_DANGER_FULL) angleDegrees = GATE_ANGLE_DANGER_FULL;
    targetAngle = angleDegrees;
}

void GateActuator::disableManualOverride() {
    manualOverrideActive = false;
}

void GateActuator::update() {
    // Smooth stepping motor control (steps 1 degree every 20ms)
    // Avoids mechanical water hammer and sudden inrush currents
    unsigned long now = millis();
    if (now - lastStepTime >= 20) {
        lastStepTime = now;

        if (currentAngle < targetAngle) {
            currentAngle++;
            writePwmDuty(angleToDutyCycle(currentAngle));
        } else if (currentAngle > targetAngle) {
            currentAngle--;
            writePwmDuty(angleToDutyCycle(currentAngle));
        }
    }
}
