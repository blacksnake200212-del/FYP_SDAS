#ifndef CLOUD_SUPABASE_H
#define CLOUD_SUPABASE_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"
#include "sensors_dual_ultrasonic.h"
#include "gate_actuator.h"
#include "state_machine.h"

class CloudSupabase {
public:
    CloudSupabase();
    void begin();
    
    // Transmit telemetry to Supabase REST database
    bool publishTelemetry(const ReservoirTelemetry &telemetry, const DamSafetyStateMachine &stateMachine, const GateActuator &gate);
    
    // Check for operator remote manual override commands
    bool checkRemoteOverride(GateActuator &gate);

    bool isConnected() const { return WiFi.status() == WL_CONNECTED; }
    void reconnectWiFi();

private:
    unsigned long lastTelemetryPublish;
    unsigned long lastOverrideCheck;
    unsigned long lastWifiAttempt;
};

#endif // CLOUD_SUPABASE_H
