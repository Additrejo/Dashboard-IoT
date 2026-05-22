const { SerialPort }      = require('serialport');
const { ReadlineParser }  = require('@serialport/parser-readline');
const db                  = require('./database');
require('dotenv').config();

const SENSOR_MAP = {
    temp:     { type: 'temperature', unit: 'C'   },
    hum:      { type: 'humidity',    unit: '%'   },
    volt:     { type: 'voltage',     unit: 'V'   },
    current:  { type: 'current',     unit: 'A'   },
    pressure: { type: 'pressure',    unit: 'hPa' }
};

let activePort = null;

async function listPorts() {
    const ports = await SerialPort.list();
    return ports.map(p => ({
        path:         p.path,
        manufacturer: p.manufacturer || null,
        friendlyName: p.friendlyName || null,
        serialNumber: p.serialNumber || null
    }));
}

function connectPort(portPath, wss) {
    if (activePort && activePort.isOpen) {
        activePort.close();
        activePort = null;
    }

    const port   = new SerialPort({ path: portPath, baudRate: parseInt(process.env.BAUD_RATE) || 115200 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.on('open', () => {
        console.log(`Serial port open: ${portPath}`);
        activePort = port;
    });

    port.on('error', (err) => {
        console.error(`Serial port error: ${err.message}`);
        activePort = null;
    });

    port.on('close', () => {
        console.log(`Serial port closed: ${portPath}`);
        activePort = null;
    });

    parser.on('data', (line) => {
        try {
            const data      = JSON.parse(line.trim());
            const device_id = data.device || 'esp32-01';

            db.upsertDevice.run({ id: device_id, name: device_id, type: 'ESP32' });

            for (const [key, meta] of Object.entries(SENSOR_MAP)) {
                if (data[key] !== undefined) {
                    db.insertReading.run({
                        device_id,
                        sensor_type: meta.type,
                        value:       parseFloat(data[key]),
                        unit:        meta.unit
                    });
                }
            }

            if (wss) {
                const message = JSON.stringify({ type: 'new_reading', data });
                wss.clients.forEach(client => {
                    if (client.readyState === 1) client.send(message);
                });
            }

        } catch {
            if (line.trim()) console.log(`Serial (non-JSON): ${line.trim()}`);
        }
    });
}

function disconnectPort() {
    if (activePort && activePort.isOpen) {
        activePort.close();
        activePort = null;
        return true;
    }
    return false;
}

function getActivePort() {
    return activePort ? activePort.path : null;
}

function sendCommand(command) {
    if (activePort && activePort.isOpen) {
        activePort.write(command + '\n', (err) => {
            if (err) console.error(`Command write error: ${err.message}`);
            else     console.log(`Command sent: ${command}`);
        });
        return true;
    }
    console.error('Command ignored: no active serial port.');
    return false;
}

module.exports = { listPorts, connectPort, disconnectPort, getActivePort, sendCommand };