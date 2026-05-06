const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './iot_data.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS readings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id   TEXT    NOT NULL,
        sensor_type TEXT    NOT NULL,
        value       REAL    NOT NULL,
        unit        TEXT,
        timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
        id        TEXT PRIMARY KEY,
        name      TEXT,
        type      TEXT,
        last_seen DATETIME
    );
`);

module.exports = {
    insertReading: db.prepare(`
        INSERT INTO readings (device_id, sensor_type, value, unit)
        VALUES (@device_id, @sensor_type, @value, @unit)
    `),

    getLatestReadings: db.prepare(`
        SELECT * FROM readings
        WHERE sensor_type = ?
        ORDER BY timestamp DESC
        LIMIT ?
    `),

    getLatestAll: db.prepare(`
        SELECT sensor_type, value, unit, MAX(timestamp) AS timestamp
        FROM readings
        GROUP BY sensor_type
    `),

    upsertDevice: db.prepare(`
        INSERT INTO devices (id, name, type, last_seen)
        VALUES (@id, @name, @type, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP
    `)
};