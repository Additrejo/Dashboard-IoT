#include <Arduino.h>
#include <DHT.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

#define PIN_DHT  4
#define DHT_TYPE DHT11

DHT dht(PIN_DHT, DHT_TYPE);

void setup() {
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
    Serial.begin(115200);
    delay(100);
    dht.begin();
    Serial.println("ESP32 lista — DHT11.");
}

void loop() {
    static unsigned long lastSend = 0;
    if (millis() - lastSend >= 2000) {
        lastSend = millis();

        float temperature = dht.readTemperature();
        float humidity    = dht.readHumidity();

        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("DHT11: error de lectura");
        } else {
            String json = "";
            json += "{\"device\":\"esp32-01\"";
            json += ",\"temp\":" + String(temperature, 1);
            json += ",\"hum\":"  + String(humidity,    1);
            json += "}";
            Serial.println(json);
            Serial.flush();
        }
    }
}