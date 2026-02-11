# Wiring Diagram

## Components

1.  **NodeMCU v1.0** (ESP8266)
2.  **MFRC522** RFID Reader module
3.  **16x2 LCD** with I2C Backpack

## Connection Table

| Signal | NodeMCU Pin | GPIO | Device Pin |
| :--- | :--- | :--- | :--- |
| **SPI SS (SDA)** | D8 | 15 | RC522 SDA |
| **SPI SCK** | D5 | 14 | RC522 SCK |
| **SPI MOSI** | D7 | 13 | RC522 MOSI |
| **SPI MISO** | D6 | 12 | RC522 MISO |
| **RST** | D3 | 0 | RC522 RST |
| **Power** | 3.3V | - | RC522 3.3V |
| **Ground** | GND | - | RC522 GND |
| | | | |
| **I2C SCL** | D1 | 5 | LCD SCL |
| **I2C SDA** | D2 | 4 | LCD SDA |
| **Power** | Vin (5V) | - | LCD VCC |
| **Ground** | GND | - | LCD GND |

## Diagram

```mermaid
graph LR
    subgraph NodeMCU
        D1[D1 / GPIO5]
        D2[D2 / GPIO4]
        D3[D3 / GPIO0]
        D5[D5 / GPIO14]
        D6[D6 / GPIO12]
        D7[D7 / GPIO13]
        D8[D8 / GPIO15]
        GND
        V3[3.3V]
        Vin[Vin / 5V]
    end

    subgraph RC522_RFID
        SDA
        SCK
        MOSI
        MISO
        RST
        RFID_GND[GND]
        RFID_3V3[3.3V]
    end

    subgraph LCD_I2C
        L_SCL[SCL]
        L_SDA[SDA]
        L_VCC[VCC]
        L_GND[GND]
    end

    %% Connections
    D8 --> SDA
    D5 --> SCK
    D7 --> MOSI
    D6 --> MISO
    D3 --> RST
    GND --> RFID_GND
    V3 --> RFID_3V3

    D1 --> L_SCL
    D2 --> L_SDA
    GND --> L_GND
    Vin --> L_VCC
```
