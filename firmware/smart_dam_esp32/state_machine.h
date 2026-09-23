#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include <Arduino.h>
#include "config.h"
#include "sensors_dual_ultrasonic.h"
#include "gate_actuator.h"
#include "indicators.h"
#include "gsm_sim800l.h"

class DamSafetyStateMachine {
public:
    DamSafetyStateMachine(GateActuator &gate, SystemIndicators &indicators, GsmSim800L &gsm);
    void begin();

    // Process new telemetry frame with deterministic 3% hysteresis logic
    void evaluate(const ReservoirTelemetry &telemetry);

    // Get current active safety stage
    SystemAlertStage getCurrentStage() const { return currentStage; }
    const char* getStageName() const;

private:
    GateActuator &gateActuator;
    SystemIndicators &systemIndicators;
    GsmSim800L &gsmSim800L;

    SystemAlertStage currentStage;
    unsigned long lastTransitionTime;
};

#endif // STATE_MACHINE_H
