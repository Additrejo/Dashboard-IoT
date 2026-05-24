# IoT Dashboard — Documentación del Proyecto

## Descripción

Dashboard de escritorio para visualización y control de microcontroladores (ESP32, Arduino, STM32) en tiempo real.  
Construida con **React + Vite** (frontend), **Node.js + Express** (backend) y **SQLite** (base de datos local).  
Diseñada para escalar a aplicación web en fases posteriores.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE HARDWARE                      │
│  ESP32 DevKit V1 · Arduino · STM32 · Otros              │
│  Sensores: DHT22, ACS712, ADC, presión, etc.            │
│  Protocolos: UART, I2C, SPI, CAN, RS485, Modbus        │
└────────────┬────────────────────────────────────────────┘
             │ USB Serial (UART) · WiFi/MQTT (fase 2)
             ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE BACKEND                       │
│  Node.js + Express                                      │
│  ├── serialReader.js  → Lee puerto COM, parsea JSON     │
│  ├── database.js      → SQLite (readings, devices)      │
│  └── index.js         → REST API + WebSocket Server     │
│  Migración fase 5: SQLite → PostgreSQL                  │
└────────────┬────────────────────────────────────────────┘
             │ REST API · WebSocket
             ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE FRONTEND                      │
│  React + Vite + Recharts                                │
│  ├── SensorCard.jsx   → Tarjetas de sensores            │
│  ├── Chart.jsx        → Gráficas en tiempo real         │
│  ├── Controls.jsx     → Botones HMI (LED, Relay, Fan)   │
│  └── api.js           → axios + WebSocket hook          │
│  Deploy fase 5: Vite build + servidor cloud             │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Capa       | Tecnología                  | Propósito                        |
|------------|-----------------------------|----------------------------------|
| Hardware   | ESP32 DevKit V1             | Microcontrolador principal       |
| Hardware   | DHT22, ACS712, ADC          | Sensores de temperatura, corriente, voltaje |
| Backend    | Node.js + Express           | Servidor y API REST              |
| Backend    | serialport                  | Comunicación USB Serial          |
| Backend    | better-sqlite3              | Base de datos local              |
| Backend    | ws                          | WebSocket para tiempo real       |
| Frontend   | React + Vite                | Interfaz de usuario              |
| Frontend   | Recharts                    | Gráficas y visualizaciones       |
| Frontend   | axios                       | Peticiones HTTP a la API         |

---

## Fases del Proyecto

| Fase | Tema                        | Estado      |
|------|-----------------------------|-------------|
| 1    | Hardware + Serial + Backend | Completada  |
| 2    | Frontend — Dashboard        | Completada  |
| 3    | Control HMI                 | Completada  |
| 4    | Multi-device                | Pendiente   |
| 5    | WiFi / MQTT                 | Pendiente   |
| 6    | Migración web               | Pendiente   |

---

## Requisitos Previos

- Windows 10/11
- [Node.js LTS](https://nodejs.org) (v20.x o superior)
- [Git](https://git-scm.com)
- [Python 3.x](https://python.org) (ya instalado)
- [Arduino IDE](https://www.arduino.cc/en/software) (ya instalado)
- [VS Code](https://code.visualstudio.com)
- Driver CP210x para ESP32: [Silicon Labs CP210x](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)

---

## Estructura del Proyecto

```
iot-dashboard/
├── backend/
│   ├── index.js           ← Servidor principal (Express + WebSocket)
│   ├── database.js        ← Configuración y queries SQLite
│   ├── serialReader.js    ← Lectura y parseo del puerto serial
│   ├── .env               ← Variables de entorno (puerto COM, baudrate)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── SensorCard.jsx
    │   │   ├── Chart.jsx
    │   │   └── Controls.jsx
    │   └── services/
    │       └── api.js
    ├── vite.config.js
    └── package.json
```

---

## Protocolo de Comunicación ESP32 → Backend

La ESP32 envía datos en formato JSON por UART cada 2 segundos:

```json
{"device":"esp32-01","temp":23.5,"hum":60.2,"volt":3.30,"current":0.42}
```

Campos soportados:

| Campo      | Sensor         | Unidad |
|------------|----------------|--------|
| `temp`     | DHT22          | °C     |
| `hum`      | DHT22          | %      |
| `volt`     | ADC            | V      |
| `current`  | ACS712         | A      |
| `pressure` | BMP280         | hPa    |

---

## Variables de Entorno (backend/.env)

```env
SERIAL_PORT=COM3       # Puerto COM de la ESP32
BAUD_RATE=115200       # Velocidad de comunicación
DB_PATH=./iot_data.db  # Ruta de la base de datos
PORT=3001              # Puerto del servidor backend
```

---

## Endpoints de la API REST

| Método | Ruta                        | Descripción                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/readings/latest`      | Último valor de todos los sensores   |
| GET    | `/api/readings/:sensorType` | Historial de un sensor (query: limit)|
| POST   | `/api/control`              | Enviar comando HMI a la ESP32        |

---

## Cómo Iniciar el Proyecto

### Backend
```bash
cd iot-dashboard/backend
node index.js
```

### Frontend
```bash
cd iot-dashboard/frontend
npm run dev
```

Abre el navegador en `http://localhost:5173`

---

## Protocolos Soportados (hoja de ruta)

| Protocolo | Hardware compatible        | Fase |
|-----------|---------------------------|------|
| UART      | ESP32, Arduino, STM32     | 1    |
| I2C       | ESP32, Arduino, STM32     | 3    |
| SPI       | ESP32, STM32              | 3    |
| CAN bus   | STM32, adaptadores USB    | 5    |
| RS485     | Adaptadores USB           | 5    |
| Modbus    | Dispositivos industriales | 5    |
| WiFi/MQTT | ESP32                     | 2    |

---

---

## Fase 1 — Instalación y comunicación serial

### Dependencias instaladas

**Backend:**

```bash
cd iot-dashboard/backend
npm install express serialport @serialport/parser-readline better-sqlite3 cors ws dotenv
```

**Frontend:**

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios recharts
```

### Driver USB-Serial

La ESP32 DevKit V1 utiliza el chip CP2102. El driver requerido es el **CP210x Universal Windows Driver** disponible en:

https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

Una vez instalado, el dispositivo aparece en:

```
Administrador de dispositivos > Puertos (COM y LPT) > CP210x USB to UART Bridge (COMx)
```

### Archivos del backend

#### `backend/.env`

```env
SERIAL_PORT=COM3
BAUD_RATE=115200
DB_PATH=./iot_data.db
PORT=3001
```

#### `backend/database.js`

Inicializa la base de datos SQLite y expone sentencias preparadas para insertar y consultar lecturas.

Tablas:

- `readings`: almacena cada lectura individual (device_id, sensor_type, value, unit, timestamp).
- `devices`: registra los dispositivos conectados y su última actividad.

#### `backend/serialReader.js`

Abre el puerto serial configurado en `.env`, parsea cada línea como JSON y guarda los valores en la base de datos. Difunde cada lectura a los clientes WebSocket conectados.

Formato JSON esperado desde la ESP32:

```json
{"device":"esp32-01","temp":23.5,"hum":60.2,"volt":3.30}
```

Mapa de campos soportados:

| Campo JSON | Tipo en BD     | Unidad |
|------------|----------------|--------|
| temp       | temperature    | C      |
| hum        | humidity       | %      |
| volt       | voltage        | V      |
| current    | current        | A      |
| pressure   | pressure       | hPa    |

#### `backend/index.js`

Servidor principal. Expone la API REST y el servidor WebSocket sobre el mismo puerto HTTP.

### Sketch de verificación para ESP32

Sketch mínimo sin dependencias externas para verificar la comunicación serial. Los valores son generados aleatoriamente en torno a valores nominales.

```cpp
void setup() {
    Serial.begin(115200);
}

void loop() {
    float temperature = 23.5 + (random(-20, 20) * 0.1);
    float humidity    = 60.0 + (random(-50, 50) * 0.1);
    float voltage     = 3.30 + (random(-5, 5)   * 0.01);

    Serial.print("{\"device\":\"esp32-01\"");
    Serial.print(",\"temp\":");    Serial.print(temperature, 1);
    Serial.print(",\"hum\":");     Serial.print(humidity,    1);
    Serial.print(",\"volt\":");    Serial.print(voltage,     2);
    Serial.println("}");

    delay(2000);
}
```

### Verificación

Iniciar el backend:

```bash
cd iot-dashboard/backend
node index.js
```

Salida esperada:

```
Backend running on http://localhost:3001
Serial port open: COM3
```

Verificar la API en el navegador:

```
http://localhost:3001/api/readings/latest
```

La respuesta debe ser un array JSON con las últimas lecturas por tipo de sensor.

---

## Notas de instalación — Problemas resueltos

### Incompatibilidad de versiones

`create-vite@9.0.6` requiere Node.js `v20.19.0` o superior. La versión inicial instalada era `v20.10.0`. Se actualizó Node.js a `v24.15.0`.

Después de la actualización, `better-sqlite3` quedó compilado contra la versión anterior. Se recompiló con:

```bash
npm rebuild better-sqlite3
```

### Puerto serial dinámico

En lugar de fijar el puerto en `.env`, se implementó selección manual desde el dashboard mediante tres endpoints adicionales en la API y el componente `PortSelector.jsx` en el frontend.

Endpoints agregados:

| Método | Ruta                   | Descripción                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/ports`           | Lista los puertos seriales disponibles |
| POST   | `/api/ports/connect`   | Abre el puerto seleccionado        |
| POST   | `/api/ports/disconnect`| Cierra el puerto activo            |

El archivo `.env` ya no requiere `SERIAL_PORT`. La variable se eliminó.

### Componentes del frontend creados

| Archivo                              | Descripción                              |
|--------------------------------------|------------------------------------------|
| `frontend/src/components/PortSelector.jsx` | Selector de puerto serial con Connect / Disconnect |
| `frontend/src/App.jsx`               | Componente raíz, integra PortSelector    |

---

## Fase 2 — Frontend Dashboard

### Objetivo

Construir la interfaz principal del dashboard: tarjetas de sensores, gráficas en tiempo real y estado de conexión, consumiendo los datos del backend vía REST API y WebSocket.

### Verificación de datos — API REST

Antes de construir el frontend se confirmó que el backend recibe y almacena correctamente los datos de la ESP32. La respuesta de `GET /api/readings/latest` con el sketch de verificación cargado es:

```json
[
  {"sensor_type":"humidity",    "value":58.5, "unit":"%", "timestamp":"2026-05-12 05:35:43"},
  {"sensor_type":"temperature", "value":24.3, "unit":"C", "timestamp":"2026-05-12 05:35:43"},
  {"sensor_type":"voltage",     "value":3.34, "unit":"V", "timestamp":"2026-05-12 05:35:43"}
]
```

Nota: el monitor serie de Arduino IDE debe estar cerrado mientras el backend lee el puerto. Ambos compiten por el mismo recurso COM.

### Estructura de archivos completada

```
frontend/src/
├── components/
│   ├── PortSelector.jsx    — Selector de puerto serial
│   ├── SensorCard.jsx      — Tarjeta individual de sensor
│   └── Chart.jsx           — Gráfica de historial con Recharts
├── services/
│   └── api.js              — Funciones REST y WebSocket
└── App.jsx                 — Componente raíz del dashboard
```

### Descripción de cada archivo

#### `frontend/src/services/api.js`

Centraliza las llamadas al backend. Expone tres funciones:

- `getLatestReadings()` — obtiene el último valor de cada sensor.
- `getReadingHistory(sensorType, limit)` — obtiene el historial de un sensor.
- `createWebSocket(onMessage)` — abre una conexión WebSocket y ejecuta un callback por cada mensaje recibido.

#### `frontend/src/components/SensorCard.jsx`

Muestra el valor actual de un sensor con su unidad y la hora de la última lectura. Recibe las props `label`, `value`, `unit` y `timestamp`.

#### `frontend/src/components/Chart.jsx`

Gráfica de línea con Recharts que muestra el historial de un sensor. Recibe `title`, `data`, `dataKey`, `color` y `unit`. La animación está desactivada para evitar parpadeos en actualizaciones frecuentes.

#### `frontend/src/App.jsx`

Componente raíz. Al montar:

1. Carga las últimas lecturas y el historial de temperatura y humedad vía REST.
2. Abre una conexión WebSocket que recarga los datos cada vez que llega una nueva lectura.
3. Renderiza el header con `PortSelector`, las tarjetas de sensores y las gráficas.

### Comportamiento en tiempo real

El dashboard se actualiza automáticamente cada vez que la ESP32 envía una lectura. El flujo es:

```
ESP32 → Serial UART → serialReader.js → SQLite → WebSocket broadcast → App.jsx → re-fetch → UI
```

No se requiere recargar la página manualmente.

---

## Fase 3 — Control HMI

### Objetivo

Enviar comandos desde el dashboard hacia la ESP32 para controlar salidas digitales en tiempo real.

### Flujo de control

```
Dashboard (botón) → POST /api/control → serialReader.js → Serial UART → ESP32 → GPIO
```

### Salidas configuradas

| Control  | GPIO | Descripción          |
|----------|------|----------------------|
| LED      | 2    | LED externo          |
| Output 1 | 4    | Salida digital libre |
| Output 2 | 5    | Salida digital libre |

### Protocolo de comandos

Los comandos se envían como texto plano terminado en `\n` por el puerto serial:

```
LED:ON
LED:OFF
OUT1:ON
OUT1:OFF
OUT2:ON
OUT2:OFF
```

### Cambios en el backend

Se agregó la función `sendCommand` en `serialReader.js` y se actualizó el endpoint `POST /api/control` en `index.js` para escribir el comando al puerto serial activo.

### Componente Controls.jsx

Componente React con tres botones de toggle. Cada botón envía el comando correspondiente al backend y actualiza su estado visual de forma independiente.

### Firmware — `firmware/src/main.cpp`

El firmware maneja simultáneamente:

- Lectura de comandos entrantes por serial (sin usar `delay()`)
- Envío de lecturas de sensores cada 2 segundos con `millis()`
- Restauración del estado de las salidas en cada ciclo para garantizar consistencia

Se deshabilita el brownout detector con `WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0)` para evitar reinicios por caídas de voltaje en el puerto USB.

### Notas de hardware

- El LED externo se conecta entre GPIO2 y GND con una resistencia de 220Ω en serie.
- El puerto USB debe entregar corriente suficiente. Puertos con alimentación limitada o cables de baja calidad causan que el brownout detector se active continuamente y la ESP32 reinicie en loop.
- PlatformIO se integró en VS Code para compilar y cargar el firmware sin salir del entorno de desarrollo.

### Flujo de trabajo para cargar firmware

El puerto serial solo puede ser usado por un proceso a la vez. El procedimiento correcto es:

```
1. Disconnect en el dashboard
2. Detener el backend (Ctrl + C)
3. Cargar firmware con PlatformIO
4. Iniciar el backend (node index.js)
5. Connect en el dashboard
```

---

---

## Correcciones y mejoras — Post Fase 3

### Overflow en valores simulados del firmware

El cálculo original de valores simulados usaba `millis()` que devuelve `unsigned long`. La resta producía underflow cuando el resultado era negativo, generando valores como `429496736.00` en el dashboard.

Solución aplicada — cast explícito a `long` antes de la resta:

```cpp
float temperature = 23.5 + (((long)(millis() % 40)  - 20) * 0.1f);
float humidity    = 60.0 + (((long)(millis() % 100) - 50) * 0.1f);
float voltage     = 3.30 + (((long)(millis() % 10)  -  5) * 0.01f);
```

### Color del selector de puerto serial

El dropdown del selector de puerto heredaba el fondo oscuro del sistema operativo, haciendo el texto invisible.

Corrección en `PortSelector.jsx`:

```jsx
select: {
    fontSize:   '13px',
    padding:    '5px 8px',
    border:     '1px solid #d1d5db',
    borderRadius: '4px',
    background: '#fff',
    color:      '#111827',
    minWidth:   '220px'
}
```

Corrección global en `frontend/src/index.css`:

```css
select option {
    background-color: #ffffff;
    color: #111827;
}
```

### Estado actual del proyecto

| Componente         | Estado      |
|--------------------|-------------|
| Backend serial     | Operativo   |
| Base de datos      | Operativa   |
| Dashboard          | Operativo   |
| Control HMI        | Operativo   |
| PlatformIO         | Integrado   |
| Sensores físicos   | Operativo   |
| WiFi / MQTT        | Pendiente   |
| Multi-device       | Pendiente   |
| Migración web      | Pendiente   |

---

## Integración de sensor físico DHT11

### Sensor utilizado

Módulo DHT11 de Keyes con resistencia pull-up integrada en la placa.

### Conexiones

| Sensor | ESP32  |
|--------|--------|
| GND    | GND    |
| VCC    | 3.3V   |
| SEÑAL  | GPIO4  |

### Librerías agregadas en `platformio.ini`

```ini
lib_deps =
    adafruit/DHT sensor library @ ^1.4.6
    adafruit/Adafruit Unified Sensor @ ^1.1.14
```

### Estructura de entornos en PlatformIO

Se configuraron dos entornos independientes en `platformio.ini` para mantener el firmware HMI y el firmware DHT11 sin conflictos:

| Entorno | Archivo fuente  | Descripción                        |
|---------|-----------------|------------------------------------|
| `hmi`   | `main_hmi.cpp`  | Control HMI con LED y salidas      |
| `dht`   | `main_dht.cpp`  | Lectura de sensor DHT11 real       |

Para cargar cada entorno:

```bash
pio run --target upload --environment hmi
pio run --target upload --environment dht
```

### Firmware DHT11 — `firmware/src/main_dht.cpp`

Lee temperatura y humedad del sensor cada 1 segundo. El JSON se construye como `String` completo antes de enviarlo por serial para evitar fragmentación en el parser del backend.

```cpp
String json = "";
json += "{\"device\":\"esp32-01\"";
json += ",\"temp\":" + String(temperature, 1);
json += ",\"hum\":"  + String(humidity,    1);
json += "}";
Serial.println(json);
Serial.flush();
```

`Serial.flush()` garantiza que el buffer se vacía completamente antes de continuar.

### Valores reales obtenidos

| Sensor      | Valor típico | Unidad |
|-------------|--------------|--------|
| Temperatura | 27.6         | °C     |
| Humedad     | 47.0         | %      |

### Problemas resueltos durante la integración

**JSON fragmentado:** El backend recibía el JSON partido en múltiples líneas. Se resolvió construyendo el `String` completo antes de llamar a `Serial.println`.

**Datos históricos en la gráfica:** Al cambiar de datos simulados a reales, la base de datos contenía miles de registros antiguos que distorsionaban las gráficas. Solución: eliminar `iot_data.db` y reiniciar el backend para comenzar desde cero.

```bash
del iot_data.db
node index.js
```

---

## Mejoras en la gráfica — `frontend/src/components/Chart.jsx`

Se actualizó el componente `Line` de Recharts para mejorar la fluidez visual:

```jsx
<Line
    type="natural"
    dataKey="value"
    stroke={color}
    strokeWidth={1.5}
    dot={false}
    isAnimationActive={true}
    animationDuration={800}
    animationEasing="ease-in-out"
/>
```

Cambios aplicados:

- `type="natural"` — suaviza la curva entre puntos con interpolación natural
- `isAnimationActive={true}` — activa la animación de transición
- `animationDuration={800}` — duración de 800ms por transición
- `animationEasing="ease-in-out"` — curva de aceleración suave

El intervalo de envío del firmware se redujo de 2000ms a 1000ms para aprovechar el límite máximo del DHT11 y duplicar la frecuencia de actualización en el dashboard.

---

*Ultima actualización: Sensor DHT11 integrado — Lecturas reales operativas.*