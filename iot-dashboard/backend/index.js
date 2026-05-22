const express             = require('express');
const cors                = require('cors');
const { WebSocketServer } = require('ws');
const http                = require('http');
const db                  = require('./database');
const { listPorts, connectPort, disconnectPort, getActivePort, sendCommand } = require('./serialReader');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/readings/latest', (req, res) => {
    res.json(db.getLatestAll.all());
});

app.get('/api/readings/:sensorType', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const rows  = db.getLatestReadings.all(req.params.sensorType, limit);
    res.json(rows.reverse());
});

app.post('/api/control', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'command is required' });

    const sent = sendCommand(command);
    if (!sent) return res.status(503).json({ error: 'No active serial port.' });

    res.json({ ok: true, command });
});

app.get('/api/ports', async (req, res) => {
    try {
        const ports = await listPorts();
        res.json({ ports, active: getActivePort() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ports/connect', (req, res) => {
    const { port } = req.body;
    if (!port) return res.status(400).json({ error: 'port is required' });

    try {
        connectPort(port, wss);
        res.json({ ok: true, port });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ports/disconnect', (req, res) => {
    const closed = disconnectPort();
    res.json({ ok: closed });
});

const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Dashboard client connected via WebSocket');
    ws.send(JSON.stringify({ type: 'port_status', active: getActivePort() }));
    ws.on('close', () => console.log('Dashboard client disconnected'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});