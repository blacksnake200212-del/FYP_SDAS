# Hardware Pinout and Wiring Specification

This document details the exact hardware wiring, power distribution network, pin mapping, and component connections for the **Smart Dam Alert System (SDAS)** as configured on the prototype board.

---

## 1. Power Distribution Network Topology

```
                   ┌───────────────────────────────────────────────┐
                   │    12V DC Power Adapter (3A or Higher)       │
                   └──────────────────────┬────────────────────────┘
                                          │
                                   [SPST Switch]
                                          │
                                          ├─── [C1: 1000 µF 25V Input Filter]
                                          │
               ┌──────────────────────────┴──────────────────────────┐
               │                                                     │
               ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  Buck Converter #1 (XL4015)  │              │  Buck Converter #2 (XL4015)  │
│         12V to 5.0V          │              │         12V to 4.0V          │
│   (For MG996 Servo & 5V I/O) │              │      (For SIM800L GSM)       │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
      [C2: 1000 µF 16V]                             [C3: 1000 µF 16V]
               │                                             │
               ├── +5V Rail                                  └── +4.0V Rail
               │   ├── ESP32 VIN pin                             └── SIM800L VCC
               │   ├── MG996 Servo VCC (Red)
               │   ├── 5V Active Buzzer (+)
               │   ├── Logic Level Converter HV
               │   └── JSN-SR04T Sensor 1 & 2 VCC
               │
               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    ESP32 DevKit V1 (30-pin Microcontroller)                │
│                         3.3V Regulated Output Rail                         │
│   ├── DHT22 Temp & Humidity Sensor VCC                                     │
│   ├── 10kΩ Pull-Up Resistor (R1) for DHT22 DATA                            │
│   ├── Logic Level Converter LV Pin                                         │
│   └── RGB LED Module Common Anode (VCC)                                    │
└────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Ground Rule:** All component GND pins (ESP32, Buck #1, Buck #2, Servo, Sensors, Buzzer, SIM800L, Level Converter) **must be connected to a single common Ground plane**.

---

## 2. Complete ESP32 DevKit V1 Pin Assignment

| Peripheral / Module | Pin / Signal | ESP32 GPIO | Direction | Operating Voltage | Connection Details |
|---|---|---|---|---|---|
| **Ultrasonic Sensor 1** (JSN-SR04T) | TRIG | **GPIO5** | Output | 3.3V LV (5V HV) | Through Logic Level Converter Ch 1 (LV1 <-> HV1) |
| **Ultrasonic Sensor 1** (JSN-SR04T) | ECHO | **GPIO19** | Input | 3.3V LV (5V HV) | Through Logic Level Converter Ch 2 (LV2 <-> HV2) |
| **Ultrasonic Sensor 2** (JSN-SR04T) | TRIG | **GPIO18** | Output | 3.3V LV (5V HV) | Through Logic Level Converter Ch 3 (LV3 <-> HV3) |
| **Ultrasonic Sensor 2** (JSN-SR04T) | ECHO | **GPIO21** | Input | 3.3V LV (5V HV) | Through Logic Level Converter Ch 4 (LV4 <-> HV4) |
| **Temperature & Humidity** (DHT22) | DATA | **GPIO4** | Bidirectional | 3.3V | External 10kΩ pull-up resistor to 3.3V |
| **Gate Actuator** (MG996R Servo) | Signal | **GPIO25** | Output (PWM) | 3.3V PWM | Orange wire to GPIO25 (50Hz LEDC PWM) |
| **Emergency Siren** (Active Buzzer) | Positive | **GPIO27** | Output | 3.3V Switching | 1N4007 flyback diode connected across terminals |
| **Status RGB LED** (Common Anode) | Red | **GPIO32** | Output (Active LOW) | 3.3V | Through 220Ω series resistor (R2) |
| **Status RGB LED** (Common Anode) | Green | **GPIO33** | Output (Active LOW) | 3.3V | Through 220Ω series resistor (R3) |
| **Status RGB LED** (Common Anode) | Blue | **GPIO13** | Output (Active LOW) | 3.3V | Through 220Ω series resistor (R4) |
| **Cellular Modem** (SIM800L GSM) | TXD | **GPIO17** | Input (UART RX2) | 3.3V Logic | SIM800L TXD -> ESP32 RX2 (GPIO17) |
| **Cellular Modem** (SIM800L GSM) | RXD | **GPIO16** | Output (UART TX2) | 3.3V Logic | ESP32 TX2 (GPIO16) -> SIM800L RXD |

---

## 3. Power Rail Summary Table

| Voltage Rail | Nominal Voltage | Sourced By | Fed Components | Critical Notes |
|---|---|---|---|---|
| **12V Input** | 12.0 V DC | 12V 3A+ Adapter | Buck 1 & Buck 2 inputs | Filtered by C1 (1000 µF 25V) |
| **5V Rail** | 5.0 V DC | Buck #1 (XL4015) | ESP32 VIN, MG996 Servo, Buzzer, Level Converter HV, JSN-SR04T VCC | Filtered by C2 (1000 µF 16V) to absorb servo spikes |
| **4V Rail** | 4.0 V DC | Buck #2 (XL4015) | SIM800L GSM Module VCC | Filtered by C3 (1000 µF 16V) to absorb 2A transmission pulses |
| **3.3V Rail** | 3.3 V DC | ESP32 Onboard LDO | DHT22 VCC, Level Converter LV, RGB LED Anode (VCC) | Low-noise reference rail |

---

## 4. Hardware Assembly Rules and Safety Precautions

1. **Servo Power Isolation:** Never connect the MG996R servo motor VCC pin to the ESP32 onboard 5V or 3.3V pins. The servo motor stall current can exceed 1.8A, which will instantly destroy the onboard regulator or cause cyclic brownout loops.
2. **SIM800L Voltage Window:** The SIM800L requires between 3.7V and 4.2V. Supplying 5V directly will destroy the GSM chip; supplying 3.3V will cause network dropouts during cellular registration. Keep the XL4015 Buck #2 potentiometer adjusted to precisely 4.0V.
3. **Capacitor Placement:** Solder or wire C2 and C3 as close as physically possible to the servo power terminals and the SIM800L module pins to decouple high-frequency transient drops.
4. **Common Ground:** Ensure the 12V supply ground, both buck converter output grounds, ESP32 GND, and all sensor grounds are securely bonded.
5. **Logic Level Converter:** The JSN-SR04T ultrasonic module returns a 5V echo pulse. The ML2029 logic level converter safely shifts this to 3.3V to protect the ESP32 GPIO inputs.
