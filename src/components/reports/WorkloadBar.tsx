'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WorkloadBarProps {
    data: { name: string; active: number; completed: number; total: number }[];
}

export default function WorkloadBar({ data }: WorkloadBarProps) {
    if (data.length === 0) {
        return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>No hay carga de trabajo registrada.</div>;
    }

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Legend />
                    <Bar dataKey="active" name="Tareas Activas" stackId="a" fill="var(--status-stuck, #e2445c)" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="completed" name="Tareas Completadas" stackId="a" fill="var(--status-ready, #00c875)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
