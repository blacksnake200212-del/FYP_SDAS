#include "state_machine.h"

DamSafetyStateMachine::DamSafetyStateMachine(GateActuator &gate, SystemIndicators &indicators, GsmSim800L &gsm)
    : gateActuator(gate), systemIndicators(indicators), gsmSim800L(gsm),
      currentStage(STAGE_NORMAL), lastTransitionTime(0) {}

void DamSafetyStateMachine::begin() {
    currentStage = STAGE_NORMAL;
    systemIndicators.setStage(currentStage);
    gateActuator.setTargetAngle(GATE_ANGLE_CLOSED);
}

const char* DamSafetyStateMachine::getStageName() const {
    switch (currentStage) {
        case STAGE_NORMAL: return "NORMAL";
        case STAGE_PRE_WARNING: return "PRE-WARNING";
        case STAGE_CLEAR_AREA: return "CLEAR-AREA";
        case STAGE_DANGER: return "DANGER";
        case STAGE_SENSOR_ANOMALY: return "SENSOR-FAULT";
        default: return "UNKNOWN";
    }
}

void DamSafetyStateMachine::evaluate(const ReservoirTelemetry &telemetry) {
    // 1. Check for complete sensor hardware failure
    if (!telemetry.sensor1_valid && !telemetry.sensor2_valid) {
        if (currentStage != STAGE_SENSOR_ANOMALY) {
            currentStage = STAGE_SENSOR_ANOMALY;
            systemIndicators.setStage(currentStage);
            gsmSim800L.dispatchStagedAlert(currentStage, telemetry.capacity_pct, telemetry.water_level_cm);
        }
        return;
    }

    float cap = telemetry.capacity_pct;
    SystemAlertStage nextStage = currentStage;

    // 2. Evaluate state transitions with 3% Hysteresis Window
    switch (currentStage) {
        case STAGE_NORMAL:
            if (cap >= THRESHOLD_DANGER_PCT) {
                nextStage = STAGE_DANGER;
            } else if (cap >= THRESHOLD_CLEAR_AREA_PCT) {
                nextStage = STAGE_CLEAR_AREA;
            } else if (cap >= THRESHOLD_PRE_WARNING_PCT) {
                nextStage = STAGE_PRE_WARNING;
            }
            break;

        case STAGE_PRE_WARNING:
            if (cap >= THRESHOLD_DANGER_PCT) {
                nextStage = STAGE_DANGER;
            } else if (cap >= THRESHOLD_CLEAR_AREA_PCT) {
                nextStage = STAGE_CLEAR_AREA;
            } else if (cap < (THRESHOLD_PRE_WARNING_PCT - HYSTERESIS_PCT)) {
                // Falling below 70% - 3% = 67%
                nextStage = STAGE_NORMAL;
            }
            break;

        case STAGE_CLEAR_AREA:
            if (cap >= THRESHOLD_DANGER_PCT) {
                nextStage = STAGE_DANGER;
            } else if (cap < (THRESHOLD_CLEAR_AREA_PCT - HYSTERESIS_PCT)) {
                // Falling below 78% - 3% = 75%
                nextStage = STAGE_PRE_WARNING;
            }
            break;

        case STAGE_DANGER:
            if (cap < (THRESHOLD_DANGER_PCT - HYSTERESIS_PCT)) {
                // Falling below 85% - 3% = 82%
                nextStage = STAGE_CLEAR_AREA;
            }
            break;

        case STAGE_SENSOR_ANOMALY:
            // Recover if at least one sensor becomes healthy
            if (telemetry.sensor1_valid || telemetry.sensor2_valid) {
                nextStage = STAGE_NORMAL;
            }
            break;
    }

    // 3. Apply state transitions
    if (nextStage != currentStage) {
        currentStage = nextStage;
        lastTransitionTime = millis();

        // Update visual and acoustic warnings
        systemIndicators.setStage(currentStage);

        // Actuate MG996R gate according to stage (unless operator override is active)
        if (!gateActuator.isManualOverrideActive()) {
            switch (currentStage) {
                case STAGE_NORMAL:
                    gateActuator.setTargetAngle(GATE_ANGLE_CLOSED);
                    break;
                case STAGE_PRE_WARNING:
                    gateActuator.setTargetAngle(GATE_ANGLE_PRE_WARNING);
                    break;
                case STAGE_CLEAR_AREA:
                    gateActuator.setTargetAngle(GATE_ANGLE_CLEAR_AREA);
                    break;
                case STAGE_DANGER:
                    gateActuator.setTargetAngle(GATE_ANGLE_DANGER_FULL);
                    break;
                case STAGE_SENSOR_ANOMALY:
                    // In sensor fault, hold position or open safely to 25%
                    gateActuator.setTargetAngle(GATE_ANGLE_PRE_WARNING);
                    break;
            }
        }

        // Dispatch staged GSM SMS broadcast
        gsmSim800L.dispatchStagedAlert(currentStage, telemetry.capacity_pct, telemetry.water_level_cm);
    }
}
