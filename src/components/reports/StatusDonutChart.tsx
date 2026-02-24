'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusDonutChartProps {
    data: { name: string; value: number; rawStatus?: string }[];
}

const COLORS = {
    'DONE': 'var(--status-ready, #00c875)',
    'IN_PROGRESS': 'var(--status-working, #fdab3d)',
    'STUCK': 'var(--status-stuck, #e2445c)',
    'TODO': 'var(--status-default, #c4c4c4)',
};

export default function StatusDonutChart({ data }: StatusDonutChartProps) {
    // Solo mostrar rebanadas que tengan valor > 0
    const activeData = data.filter(d => d.value > 0);

    if (activeData.length === 0) {
        return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>No hay tareas registradas.</div>;
    }

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={activeData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {activeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.rawStatus as keyof typeof COLORS] || COLORS.TODO} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
