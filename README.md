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
| 3    | Control HMI                 | Pendiente   |
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

*Ultima actualización: Fase 2 completada — Visualización de datos operativa.*