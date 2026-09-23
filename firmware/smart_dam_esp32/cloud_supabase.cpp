#include "cloud_supabase.h"

CloudSupabase::CloudSupabase() 
    : lastTelemetryPublish(0), lastOverrideCheck(0), lastWifiAttempt(0) {}

void CloudSupabase::begin() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    lastWifiAttempt = millis();
}

void CloudSupabase::reconnectWiFi() {
    if (WiFi.status() != WL_CONNECTED && millis() - lastWifiAttempt > 15000) {
        lastWifiAttempt = millis();
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASS);
    }
}

bool CloudSupabase::publishTelemetry(const ReservoirTelemetry &telemetry, const DamSafetyStateMachine &stateMachine, const GateActuator &gate) {
    if (WiFi.status() != WL_CONNECTED) {
        reconnectWiFi();
        return false;
    }

    HTTPClient http;
    String endpoint = String(SUPABASE_URL) + SUPABASE_REST_PATH;
    http.begin(endpoint);

    // Supabase REST headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Prefer", "return=minimal");

    // Construct telemetry JSON payload
    char jsonBuffer[384];
    snprintf(jsonBuffer, sizeof(jsonBuffer),
        "{\"water_level_cm\":%.2f,"
        "\"capacity_pct\":%.2f,"
        "\"sensor_1_cm\":%.2f,"
        "\"sensor_2_cm\":%.2f,"
        "\"temperature_c\":%.2f,"
        "\"humidity_pct\":%.2f,"
        "\"sound_speed_mps\":%.2f,"
        "\"gate_angle_deg\":%d,"
        "\"gate_opening_pct\":%.1f,"
        "\"system_state\":\"%s\","
        "\"is_manual_override\":%s,"
        "\"sensor_discrepancy\":%s}",
        telemetry.water_level_cm,
        telemetry.capacity_pct,
        telemetry.distance1_cm,
        telemetry.distance2_cm,
        telemetry.temperature_c,
        telemetry.humidity_pct,
        telemetry.sound_speed_mps,
        gate.getCurrentAngle(),
        gate.getCurrentPercent(),
        stateMachine.getStageName(),
        gate.isManualOverrideActive() ? "true" : "false",
        telemetry.sensor_discrepancy ? "true" : "false"
    );

    int httpCode = http.POST(jsonBuffer);
    http.end();

    return (httpCode >= 200 && httpCode < 300);
}

bool CloudSupabase::checkRemoteOverride(GateActuator &gate) {
    if (WiFi.status() != WL_CONNECTED) return false;

    // Check remote gate override commands from Supabase
    HTTPClient http;
    String endpoint = String(SUPABASE_URL) + "/rest/v1/system_config?select=operator_override_active,override_gate_angle&limit=1";
    http.begin(endpoint);
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);

    int httpCode = http.GET();
    if (httpCode == 200) {
        String payload = http.getString();
        if (payload.indexOf("\"operator_override_active\":true") != -1) {
            int angleIdx = payload.indexOf("\"override_gate_angle\":");
            if (angleIdx != -1) {
                int endIdx = payload.indexOf(",", angleIdx);
                if (endIdx == -1) endIdx = payload.indexOf("}", angleIdx);
                String angleStr = payload.substring(angleIdx + 22, endIdx);
                int angle = angleStr.toInt();
                gate.enableManualOverride(angle);
            }
        } else if (payload.indexOf("\"operator_override_active\":false") != -1) {
            if (gate.isManualOverrideActive()) {
                gate.disableManualOverride();
            }
        }
    }
    http.end();
    return true;
}
