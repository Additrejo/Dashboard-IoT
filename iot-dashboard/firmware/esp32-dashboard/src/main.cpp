#include <Arduino.h>

#define PIN_LED  2
#define PIN_OUT1 4
#define PIN_OUT2 5

String inputBuffer = "";

bool stateLED  = false;
bool stateOUT1 = false;
bool stateOUT2 = false;

void processCommand(String cmd) {
    cmd.trim();
    if (cmd == "LED:ON") {
        stateLED = true;
        digitalWrite(PIN_LED, HIGH);
        Serial.println("LED encendido");
    } else if (cmd == "LED:OFF") {
        stateLED = false;
        digitalWrite(PIN_LED, LOW);
        Serial.println("LED apagado");
    } else if (cmd == "OUT1:ON") {
        stateOUT1 = true;
        digitalWrite(PIN_OUT1, HIGH);
        Serial.println("OUT1 encendido");
    } else if (cmd == "OUT1:OFF") {
        stateOUT1 = false;
        digitalWrite(PIN_OUT1, LOW);
        Serial.println("OUT1 apagado");
    } else if (cmd == "OUT2:ON") {
        stateOUT2 = true;
        digitalWrite(PIN_OUT2, HIGH);
        Serial.println("OUT2 encendido");
    } else if (cmd == "OUT2:OFF") {
        stateOUT2 = false;
        digitalWrite(PIN_OUT2, LOW);
        Serial.println("OUT2 apagado");
    } else {
        Serial.print("Comando no reconocido: ");
        Serial.println(cmd);
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(PIN_LED,  OUTPUT);
    pinMode(PIN_OUT1, OUTPUT);
    pinMode(PIN_OUT2, OUTPUT);
    digitalWrite(PIN_LED,  LOW);
    digitalWrite(PIN_OUT1, LOW);
    digitalWrite(PIN_OUT2, LOW);
    Serial.println("ESP32 lista.");
}

void loop() {
    while (Serial.available()) {
        char c = Serial.read();
        if (c == '\n') {
            processCommand(inputBuffer);
            inputBuffer = "";
        } else {
            inputBuffer += c;
        }
    }

    static unsigned long lastSend = 0;
    if (millis() - lastSend >= 2000) {
        lastSend = millis();

        float temperature = 23.5 + ((millis() % 40  - 20) * 0.1);
        float humidity    = 60.0 + ((millis() % 100 - 50) * 0.1);
        float voltage     = 3.30 + ((millis() % 10  -  5) * 0.01);

        Serial.print("{\"device\":\"esp32-01\"");
        Serial.print(",\"temp\":");  Serial.print(temperature, 1);
        Serial.print(",\"hum\":");   Serial.print(humidity,    1);
        Serial.print(",\"volt\":"); Serial.print(voltage,     2);
        Serial.println("}");

        digitalWrite(PIN_LED,  stateLED  ? HIGH : LOW);
        digitalWrite(PIN_OUT1, stateOUT1 ? HIGH : LOW);
        digitalWrite(PIN_OUT2, stateOUT2 ? HIGH : LOW);
    }
}