import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001';

const OUTPUTS = [
    { id: 'LED',  label: 'LED',      description: 'GPIO 2 — LED integrado' },
    { id: 'OUT1', label: 'Output 1', description: 'GPIO 4' },
    { id: 'OUT2', label: 'Output 2', description: 'GPIO 5' },
];

export default function Controls() {
    const [states,  setStates]  = useState({ LED: false, OUT1: false, OUT2: false });
    const [loading, setLoading] = useState({});
    const [error,   setError]   = useState(null);

    async function toggle(id) {
        const newState = !states[id];
        const command  = `${id}:${newState ? 'ON' : 'OFF'}`;

        setLoading(prev => ({ ...prev, [id]: true }));
        setError(null);

        try {
            await axios.post(`${API}/api/control`, { command });
            setStates(prev => ({ ...prev, [id]: newState }));
        } catch (err) {
            setError(err.response?.data?.error || 'Command failed.');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.sectionTitle}>HMI Controls</div>
            <div style={styles.grid}>
                {OUTPUTS.map(output => {
                    const active = states[output.id];
                    const busy   = loading[output.id];
                    return (
                        <div key={output.id} style={styles.card}>
                            <div style={styles.outputLabel}>{output.label}</div>
                            <div style={styles.outputDesc}>{output.description}</div>
                            <button
                                onClick={() => toggle(output.id)}
                                disabled={busy}
                                style={{
                                    ...styles.btn,
                                    background: active ? '#16a34a' : '#1e1e2e',
                                    borderColor: active ? '#16a34a' : '#374151',
                                }}
                            >
                                {busy ? 'Sending...' : active ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    );
                })}
            </div>
            {error && <div style={styles.error}>{error}</div>}
        </div>
    );
}

const styles = {
    container: {
        background:   '#1e1e2e',
        border:       '1px solid #2e2e3e',
        borderRadius: '8px',
        padding:      '20px 24px',
    },
    sectionTitle: {
        fontSize:      '12px',
        color:         '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom:  '16px',
    },
    grid: {
        display:  'flex',
        gap:      '16px',
        flexWrap: 'wrap',
    },
    card: {
        background:   '#13131f',
        border:       '1px solid #2e2e3e',
        borderRadius: '6px',
        padding:      '16px 20px',
        minWidth:     '150px',
        display:      'flex',
        flexDirection:'column',
        gap:          '6px',
    },
    outputLabel: {
        fontSize:   '14px',
        fontWeight: '500',
        color:      '#f9fafb',
    },
    outputDesc: {
        fontSize: '11px',
        color:    '#4b5563',
    },
    btn: {
        marginTop:    '10px',
        padding:      '8px 0',
        border:       '1px solid',
        borderRadius: '4px',
        color:        '#f9fafb',
        fontSize:     '13px',
        fontWeight:   '500',
        cursor:       'pointer',
        transition:   'all 0.15s',
    },
    error: {
        marginTop: '12px',
        fontSize:  '12px',
        color:     '#ef4444',
    }
};