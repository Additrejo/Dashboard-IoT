export default function SensorCard({ label, value, unit, timestamp }) {
    const formatted = value !== null && value !== undefined
        ? parseFloat(value).toFixed(2)
        : '—';

    const time = timestamp
        ? new Date(timestamp).toLocaleTimeString()
        : '—';

    return (
        <div style={styles.card}>
            <div style={styles.label}>{label}</div>
            <div style={styles.value}>
                {formatted}
                <span style={styles.unit}> {unit}</span>
            </div>
            <div style={styles.timestamp}>Last update: {time}</div>
        </div>
    );
}

const styles = {
    card: {
        background:   '#1e1e2e',
        border:       '1px solid #2e2e3e',
        borderRadius: '8px',
        padding:      '20px 24px',
        minWidth:     '180px',
        flex:         '1',
    },
    label: {
        fontSize:     '12px',
        color:        '#6b7280',
        textTransform:'uppercase',
        letterSpacing:'0.05em',
        marginBottom: '8px',
    },
    value: {
        fontSize:  '32px',
        fontWeight:'600',
        color:     '#f9fafb',
        lineHeight:'1',
    },
    unit: {
        fontSize:  '16px',
        color:     '#9ca3af',
        fontWeight:'400',
    },
    timestamp: {
        fontSize:   '11px',
        color:      '#4b5563',
        marginTop:  '10px',
    }
};