#ifndef GSM_SIM800L_H
#define GSM_SIM800L_H

#include <Arduino.h>
#include "config.h"
#include "indicators.h"

class GsmSim800L {
public:
    GsmSim800L();
    void begin();
    
    // Core SMS transmission interface
    bool sendSMS(const char* phoneNumber, const char* message);
    
    // Automated staged alert dispatcher
    void dispatchStagedAlert(SystemAlertStage stage, float capacityPct, float waterLevelCm);

    // Diagnostics & status
    bool isModuleReady();
    int getSignalQuality(); // Returns RSSI (0-31)
    
    // Periodic processing
    void update();

private:
    bool initialized;
    SystemAlertStage lastSentStage;
    unsigned long lastSmsDispatchTime;
    
    bool sendATCommand(const char* cmd, const char* expectedReply, unsigned long timeoutMs = 2000);
    String readResponse(unsigned long timeoutMs = 2000);
};

#endif // GSM_SIM800L_H
