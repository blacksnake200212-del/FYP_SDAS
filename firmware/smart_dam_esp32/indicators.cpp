#include "indicators.h"

SystemIndicators::SystemIndicators() 
    : currentStage(STAGE_NORMAL), lastPatternUpdate(0), buzzerState(false), patternStep(0) {}

void SystemIndicators::begin() {
    // Configure RGB LED pins as outputs
    pinMode(PIN_RGB_RED, OUTPUT);
    pinMode(PIN_RGB_GREEN, OUTPUT);
    pinMode(PIN_RGB_BLUE, OUTPUT);

    // Configure Active Buzzer pin as output
    pinMode(PIN_BUZZER, OUTPUT);

    // Initial state: Normal (Green LED, Buzzer OFF)
    setStage(STAGE_NORMAL);
}

void SystemIndicators::setColorRGB(bool redOn, bool greenOn, bool blueOn) {
    // Note: Common Anode module -> LOW = LED ON, HIGH = LED OFF
    digitalWrite(PIN_RGB_RED, redOn ? LOW : HIGH);
    digitalWrite(PIN_RGB_GREEN, greenOn ? LOW : HIGH);
    digitalWrite(PIN_RGB_BLUE, blueOn ? LOW : HIGH);
}

void SystemIndicators::setBuzzer(bool state) {
    digitalWrite(PIN_BUZZER, state ? HIGH : LOW);
    buzzerState = state;
}

void SystemIndicators::setStage(SystemAlertStage stage) {
    currentStage = stage;
    patternStep = 0;
    lastPatternUpdate = millis();

    switch (currentStage) {
        case STAGE_NORMAL:
            // Pure Green
            setColorRGB(false, true, false);
            setBuzzer(false);
            break;

        case STAGE_PRE_WARNING:
            // Yellow (Red + Green)
            setColorRGB(true, true, false);
            break;

        case STAGE_CLEAR_AREA:
            // Orange (Strong Red + pulsed Green or Yellow-Orange)
            setColorRGB(true, true, false);
            break;

        case STAGE_DANGER:
            // Urgent Pure Red
            setColorRGB(true, false, false);
            break;

        case STAGE_SENSOR_ANOMALY:
            // Magenta / Purple (Red + Blue)
            setColorRGB(true, false, true);
            break;
    }
}

void SystemIndicators::update() {
    unsigned long now = millis();

    switch (currentStage) {
        case STAGE_NORMAL:
            // Always Green, Silent
            setColorRGB(false, true, false);
            setBuzzer(false);
            break;

        case STAGE_PRE_WARNING:
            // Chirp 100ms every 3 seconds
            if (now - lastPatternUpdate >= 3000) {
                lastPatternUpdate = now;
                setBuzzer(true);
            } else if (now - lastPatternUpdate >= 100 && buzzerState) {
                setBuzzer(false);
            }
            break;

        case STAGE_CLEAR_AREA:
            // Double chirp pattern every 1.5 seconds
            if (now - lastPatternUpdate < 100) {
                setBuzzer(true);
            } else if (now - lastPatternUpdate < 200) {
                setBuzzer(false);
            } else if (now - lastPatternUpdate < 300) {
                setBuzzer(true);
            } else if (now - lastPatternUpdate < 1500) {
                setBuzzer(false);
            } else {
                lastPatternUpdate = now;
            }
            break;

        case STAGE_DANGER:
            // Continuous alarm warble (250ms ON, 100ms OFF)
            if (now - lastPatternUpdate >= 350) {
                lastPatternUpdate = now;
                setBuzzer(true);
                // Flash Red/White rapidly
                setColorRGB(true, false, false);
            } else if (now - lastPatternUpdate >= 250) {
                setBuzzer(false);
                setColorRGB(true, true, true); // Flash white
            }
            break;

        case STAGE_SENSOR_ANOMALY:
            // Slow pulse (1s ON, 1s OFF)
            if (now - lastPatternUpdate >= 2000) {
                lastPatternUpdate = now;
                setColorRGB(true, false, true);
            } else if (now - lastPatternUpdate >= 1000) {
                setColorRGB(false, false, false);
            }
            setBuzzer(false);
            break;
    }
}
