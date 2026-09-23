#ifndef INDICATORS_H
#define INDICATORS_H

#include <Arduino.h>
#include "config.h"

enum SystemAlertStage {
    STAGE_NORMAL = 0,
    STAGE_PRE_WARNING = 1,
    STAGE_CLEAR_AREA = 2,
    STAGE_DANGER = 3,
    STAGE_SENSOR_ANOMALY = 4
};

class SystemIndicators {
public:
    SystemIndicators();
    void begin();
    
    // Set the overall alarm state
    void setStage(SystemAlertStage stage);

    // Call regularly in loop() for non-blocking buzzer & LED blinking patterns
    void update();

    // Helper functions for raw color control (Common Anode: LOW = ON, HIGH = OFF)
    void setColorRGB(bool redOn, bool greenOn, bool blueOn);
    void setBuzzer(bool state);

private:
    SystemAlertStage currentStage;
    unsigned long lastPatternUpdate;
    bool buzzerState;
    uint8_t patternStep;
};

#endif // INDICATORS_H
