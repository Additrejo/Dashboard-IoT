import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001';

export default function PortSelector() {
    const [ports,    setPorts]    = useState([]);
    const [selected, setSelected] = useState('');
    const [active,   setActive]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);

    async function fetchPorts() {
        try {
            const { data } = await axios.get(`${API}/api/ports`);
            setPorts(data.ports);
            setActive(data.active);
            if (data.active) setSelected(data.active);
        } catch {
            setError('Could not reach backend.');
        }
    }

    useEffect(() => {
        fetchPorts();
    }, []);

    async function handleConnect() {
        if (!selected) return;
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API}/api/ports/connect`, { port: selected });
            setActive(selected);
        } catch (err) {
            setError(err.response?.data?.error || 'Connection failed.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDisconnect() {
        setLoading(true);
        try {
            await axios.post(`${API}/api/ports/disconnect`);
            setActive(null);
        } catch {
            setError('Disconnect failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <span style={styles.label}>Serial port</span>

            <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                style={styles.select}
                disabled={!!active || loading}
            >
                <option value=''>-- Select port --</option>
                {ports.map(p => (
                    <option key={p.path} value={p.path}>
                        {p.path}{p.manufacturer ? ` — ${p.manufacturer}` : ''}
                    </option>
                ))}
            </select>

            <button onClick={fetchPorts} style={styles.btnSecondary} disabled={loading}>
                Refresh
            </button>

            {active ? (
                <button onClick={handleDisconnect} style={styles.btnDanger} disabled={loading}>
                    Disconnect
                </button>
            ) : (
                <button onClick={handleConnect} style={styles.btnPrimary} disabled={!selected || loading}>
                    Connect
                </button>
            )}

            <span style={{ ...styles.status, color: active ? '#16a34a' : '#6b7280' }}>
                {active ? `Connected: ${active}` : 'Not connected'}
            </span>

            {error && <span style={styles.error}>{error}</span>}
        </div>
    );
}

const styles = {
    container:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                    background: '#f9fafb', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
    label:        { fontSize: '13px', fontWeight: '500', color: '#374151' },
    select:       { fontSize: '13px', padding: '5px 8px', border: '1px solid #d1d5db',
                    borderRadius: '4px', background: '#fff', minWidth: '220px' },
    btnPrimary:   { fontSize: '13px', padding: '5px 14px', background: '#1d4ed8', color: '#fff',
                    border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnSecondary: { fontSize: '13px', padding: '5px 14px', background: '#fff', color: '#374151',
                    border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' },
    btnDanger:    { fontSize: '13px', padding: '5px 14px', background: '#dc2626', color: '#fff',
                    border: 'none', borderRadius: '4px', cursor: 'pointer' },
    status:       { fontSize: '12px' },
    error:        { fontSize: '12px', color: '#dc2626' }
};