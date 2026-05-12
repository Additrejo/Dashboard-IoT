import axios from 'axios';

const BASE = 'http://localhost:3001';

export async function getLatestReadings() {
    const { data } = await axios.get(`${BASE}/api/readings/latest`);
    return data;
}

export async function getReadingHistory(sensorType, limit = 30) {
    const { data } = await axios.get(`${BASE}/api/readings/${sensorType}?limit=${limit}`);
    return data;
}

export function createWebSocket(onMessage) {
    const ws = new WebSocket(`ws://localhost:3001`);
    ws.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            onMessage(payload);
        } catch {
            // mensaje no JSON, ignorar
        }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    return ws;
}