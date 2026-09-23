#ifndef SENSORS_DUAL_ULTRASONIC_H
#define SENSORS_DUAL_ULTRASONIC_H

#include <Arduino.h>
#include "config.h"

struct ReservoirTelemetry {
    float distance1_cm;
    float distance2_cm;
    float filtered_distance_cm;
    float water_level_cm;
    float capacity_pct;
    float temperature_c;
    float humidity_pct;
    float sound_speed_mps;
    bool sensor_discrepancy;
    bool sensor1_valid;
    bool sensor2_valid;
};

class DualUltrasonicSensors {
public:
    DualUltrasonicSensors();
    void begin();
    ReservoirTelemetry readSensors();

private:
    float pingSensor(uint8_t trigPin, uint8_t echoPin);
    float getMedianFilteredDistance(uint8_t trigPin, uint8_t echoPin);
    float calculateSoundSpeed(float tempC);
    void readDHT(float &tempC, float &humidityPct);

    // Filter buffer size
    static const uint8_t FILTER_SAMPLES = 5;
};

#endif // SENSORS_DUAL_ULTRASONIC_H
