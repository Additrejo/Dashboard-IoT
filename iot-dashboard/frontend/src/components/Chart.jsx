import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Chart({ title, data, dataKey, color, unit }) {
    const formatted = data.map(row => ({
        ...row,
        time: new Date(row.timestamp).toLocaleTimeString()
    }));

    return (
        <div style={styles.container}>
            <div style={styles.title}>{title}</div>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        unit={unit}
                        width={45}
                    />
                    <Tooltip
                        contentStyle={{ background: '#1e1e2e', border: '1px solid #2e2e3e', fontSize: '12px' }}
                        labelStyle={{ color: '#9ca3af' }}
                    />
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
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

const styles = {
    container: {
        background:   '#1e1e2e',
        border:       '1px solid #2e2e3e',
        borderRadius: '8px',
        padding:      '16px 20px',
        flex:         '1',
        minWidth:     '280px',
    },
    title: {
        fontSize:     '12px',
        color:        '#6b7280',
        textTransform:'uppercase',
        letterSpacing:'0.05em',
        marginBottom: '12px',
    }
};