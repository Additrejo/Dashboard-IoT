import { useState, useEffect, useRef } from 'react';
import PortSelector from './components/PortSelector';
import SensorCard   from './components/SensorCard';
import Chart        from './components/Chart';
import Controls     from './components/Controls';
import { getLatestReadings, getReadingHistory, createWebSocket } from './services/api';

export default function App() {
    const [latest,      setLatest]      = useState([]);
    const [tempHistory, setTempHistory] = useState([]);
    const [humHistory,  setHumHistory]  = useState([]);
    const wsRef = useRef(null);

    async function loadData() {
        try {
            const [readings, temp, hum] = await Promise.all([
                getLatestReadings(),
                getReadingHistory('temperature', 30),
                getReadingHistory('humidity',    30),
            ]);
            setLatest(readings);
            setTempHistory(temp);
            setHumHistory(hum);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    useEffect(() => {
        loadData();

        wsRef.current = createWebSocket((payload) => {
            if (payload.type === 'new_reading') {
                loadData();
            }
        });

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    function getSensor(type) {
        return latest.find(r => r.sensor_type === type) || {};
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <span style={styles.title}>IoT Dashboard</span>
                <PortSelector />
            </header>

            <main style={styles.main}>
                <section style={styles.cards}>
                    <SensorCard
                        label="Temperature"
                        value={getSensor('temperature').value}
                        unit="°C"
                        timestamp={getSensor('temperature').timestamp}
                    />
                    <SensorCard
                        label="Humidity"
                        value={getSensor('humidity').value}
                        unit="%"
                        timestamp={getSensor('humidity').timestamp}
                    />
                    <SensorCard
                        label="Voltage"
                        value={getSensor('voltage').value}
                        unit="V"
                        timestamp={getSensor('voltage').timestamp}
                    />
                </section>

                <section style={styles.charts}>
                    <Chart
                        title="Temperature — °C"
                        data={tempHistory}
                        dataKey="value"
                        color="#f97316"
                        unit="°C"
                    />
                    <Chart
                        title="Humidity — %"
                        data={humHistory}
                        dataKey="value"
                        color="#3b82f6"
                        unit="%"
                    />
                </section>

                <section>
                    <Controls />
                </section>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight:  '100vh',
        background: '#0f0f1a',
        color:      '#f9fafb',
        fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    header: {
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 24px',
        borderBottom:   '1px solid #1e1e2e',
        background:     '#13131f',
        flexWrap:       'wrap',
        gap:            '12px',
    },
    title: {
        fontSize:   '15px',
        fontWeight: '600',
        color:      '#f9fafb',
        padding:    '14px 0',
    },
    main: {
        padding:       '24px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '20px',
    },
    cards: {
        display:  'flex',
        gap:      '16px',
        flexWrap: 'wrap',
    },
    charts: {
        display:  'flex',
        gap:      '16px',
        flexWrap: 'wrap',
    }
};