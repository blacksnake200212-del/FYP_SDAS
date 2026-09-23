#include "gsm_sim800l.h"

// Use HardwareSerial 2 on ESP32 (GPIO16 TX2, GPIO17 RX2)
HardwareSerial SerialGSM(2);

GsmSim800L::GsmSim800L() 
    : initialized(false), lastSentStage(STAGE_NORMAL), lastSmsDispatchTime(0) {}

void GsmSim800L::begin() {
    // Note: ESP32 Serial2.begin(baud, config, rxPin, txPin)
    // Circuit schematic shows:
    // ESP32 GPIO16 (TX2) connects to SIM800L RXD
    // ESP32 GPIO17 (RX2) connects to SIM800L TXD
    SerialGSM.begin(GSM_BAUD_RATE, SERIAL_8N1, PIN_GSM_RX, PIN_GSM_TX);
    delay(1000);

    // Synchronize baud rate with AT handshake
    for (int i = 0; i < 5; i++) {
        if (sendATCommand("AT", "OK", 1000)) {
            initialized = true;
            break;
        }
        delay(500);
    }

    if (initialized) {
        sendATCommand("ATE0", "OK", 1000);         // Disable local echo
        sendATCommand("AT+CMGF=1", "OK", 1000);     // Set SMS text mode
        sendATCommand("AT+CNMI=0,0,0,0,0", "OK");  // Do not automatically show incoming SMS
    }
}

bool GsmSim800L::sendATCommand(const char* cmd, const char* expectedReply, unsigned long timeoutMs) {
    while (SerialGSM.available()) SerialGSM.read(); // Clear buffer

    SerialGSM.println(cmd);
    unsigned long start = millis();
    String resp = "";

    while (millis() - start < timeoutMs) {
        while (SerialGSM.available()) {
            char c = (char)SerialGSM.read();
            resp += c;
            if (resp.indexOf(expectedReply) != -1) {
                return true;
            }
        }
        delay(10);
    }
    return false;
}

String GsmSim800L::readResponse(unsigned long timeoutMs) {
    unsigned long start = millis();
    String resp = "";
    while (millis() - start < timeoutMs) {
        while (SerialGSM.available()) {
            resp += (char)SerialGSM.read();
        }
        delay(10);
    }
    return resp;
}

bool GsmSim800L::sendSMS(const char* phoneNumber, const char* message) {
    if (!initialized) {
        // Try re-initializing once
        begin();
        if (!initialized) return false;
    }

    while (SerialGSM.available()) SerialGSM.read();

    char cmd[40];
    snprintf(cmd, sizeof(cmd), "AT+CMGS=\"%s\"", phoneNumber);
    SerialGSM.println(cmd);

    // Wait for '>' prompt from SIM800L
    unsigned long start = millis();
    bool promptReceived = false;
    while (millis() - start < 3000) {
        if (SerialGSM.available()) {
            char c = SerialGSM.read();
            if (c == '>') {
                promptReceived = true;
                break;
            }
        }
        delay(10);
    }

    if (!promptReceived) {
        SerialGSM.write(27); // Send ESC to abort command
        return false;
    }

    // Write SMS message payload followed by ASCII 26 (Ctrl+Z)
    SerialGSM.print(message);
    SerialGSM.write(26);

    // Wait up to 10 seconds for confirmation ("+CMGS:")
    start = millis();
    String resp = "";
    while (millis() - start < 10000) {
        while (SerialGSM.available()) {
            resp += (char)SerialGSM.read();
            if (resp.indexOf("+CMGS:") != -1 || resp.indexOf("OK") != -1) {
                return true;
            }
        }
        delay(20);
    }
    return false;
}

void GsmSim800L::dispatchStagedAlert(SystemAlertStage stage, float capacityPct, float waterLevelCm) {
    unsigned long now = millis();

    // Prevent spamming: only dispatch if stage changed OR if in DANGER for > 15 minutes
    if (stage == lastSentStage && (now - lastSmsDispatchTime < 900000)) {
        return;
    }

    char smsBody[160];

    switch (stage) {
        case STAGE_PRE_WARNING:
            snprintf(smsBody, sizeof(smsBody),
                "[SDAS PRE-WARNING] Puttalam Dam capacity at %.1f%% (%.1fcm). Spillway opening 25%%. Downstream caution advised.",
                capacityPct, waterLevelCm);
            sendSMS(PHONE_OPERATOR_1, smsBody);
            sendSMS(PHONE_DISASTER_CTR, smsBody);
            lastSentStage = stage;
            lastSmsDispatchTime = now;
            break;

        case STAGE_CLEAR_AREA:
            snprintf(smsBody, sizeof(smsBody),
                "[SDAS CLEAR AREA] URGENT! Water capacity %.1f%%. Spillway discharging at 60%%. Evacuate riverbeds & flood zones now!",
                capacityPct);
            sendSMS(PHONE_OPERATOR_1, smsBody);
            sendSMS(PHONE_POLICE_HQ, smsBody);
            sendSMS(PHONE_DISASTER_CTR, smsBody);
            lastSentStage = stage;
            lastSmsDispatchTime = now;
            break;

        case STAGE_DANGER:
            snprintf(smsBody, sizeof(smsBody),
                "[SDAS DANGER ALERT] EMERGENCY! Dam capacity reached %.1f%%! Spillway gates 100%% FULL OPEN. Immediate flash flood risk!",
                capacityPct);
            sendSMS(PHONE_OPERATOR_1, smsBody);
            sendSMS(PHONE_POLICE_HQ, smsBody);
            sendSMS(PHONE_DISASTER_CTR, smsBody);
            lastSentStage = stage;
            lastSmsDispatchTime = now;
            break;

        case STAGE_NORMAL:
            if (lastSentStage != STAGE_NORMAL && lastSentStage != STAGE_SENSOR_ANOMALY) {
                snprintf(smsBody, sizeof(smsBody),
                    "[SDAS NOTICE] Reservoir status normalized below 67%% (current: %.1f%%). Spillway gates safely closed.",
                    capacityPct);
                sendSMS(PHONE_OPERATOR_1, smsBody);
            }
            lastSentStage = STAGE_NORMAL;
            lastSmsDispatchTime = now;
            break;

        case STAGE_SENSOR_ANOMALY:
            snprintf(smsBody, sizeof(smsBody),
                "[SDAS SENSOR FAULT] Telemetry disagreement detected between Sensor 1 & 2. Please inspect physical transducers.",
                capacityPct);
            sendSMS(PHONE_OPERATOR_1, smsBody);
            lastSentStage = stage;
            lastSmsDispatchTime = now;
            break;
    }
}

int GsmSim800L::getSignalQuality() {
    while (SerialGSM.available()) SerialGSM.read();
    SerialGSM.println("AT+CSQ");
    String resp = readResponse(1000);
    int idx = resp.indexOf("+CSQ: ");
    if (idx != -1) {
        int commaIdx = resp.indexOf(',', idx);
        if (commaIdx != -1) {
            String rssiStr = resp.substring(idx + 6, commaIdx);
            return rssiStr.toInt();
        }
    }
    return 0;
}

bool GsmSim800L::isModuleReady() {
    return initialized;
}

void GsmSim800L::update() {
    // Background polling for SIM800L status
}
