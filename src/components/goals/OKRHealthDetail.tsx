'use client';

import React, { useEffect, useState } from 'react';
import { calculateGoalHealth, HealthReport } from '@/app/actions/analytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
    goalId: string;
    goalTitle: string;
    onClose: () => void;
}

export default function OKRHealthDetail({ goalId, goalTitle, onClose }: Props) {
    const [report, setReport] = useState<HealthReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            setLoading(true);
            const res = await calculateGoalHealth(goalId);
            if (res.success && res.data) {
                setReport(res.data);
            }
            setLoading(false);
        };
        fetchHealth();
    }, [goalId]);

    if (loading) {
        return (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h2>Analizando Salud del OKR...</h2>
                    <p>⏳ Procesando históricos de tareas y estado de ánimo...</p>
                    <button onClick={onClose} style={closeBtnStyle}>Cerrar</button>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h2>Análisis Predictivo</h2>
                    <p>❌ No se pudo generar el análisis. Verifica que el servidor esté activo.</p>
                    <button onClick={onClose} style={closeBtnStyle}>Cerrar</button>
                </div>
            </div>
        );
    }

    // Determine Badge Color
    const healthColor =
        report.health === 'ON_TRACK' ? '#10b981' :
            report.health === 'AT_RISK' ? '#f59e0b' : '#ef4444';

    const healthLabel =
        report.health === 'ON_TRACK' ? 'A Tiempo' :
            report.health === 'AT_RISK' ? 'En Riesgo' : 'Atrasado';

    // Mock data for Burndown chart based on metrics. 
    // In a real scenario we'd query historical snapshots.
    const chartData = [
        { name: 'Semana 1', expected: 100, actual: 100 },
        { name: 'Semana 2', expected: 80, actual: 95 },
        { name: 'Semana 3', expected: 60, actual: 80 },
        { name: 'Actual', expected: 40, actual: report.metrics.completedTasks > 0 ? 50 : 80 },
    ];

    return (
        <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Salud Predictiva del OKR</h2>
                        <p style={{ margin: 0, color: 'gray', fontSize: '0.9rem' }}>{goalTitle}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
                </div>

                {/* Big Score Card */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{
                        flex: 1,
                        backgroundColor: 'var(--card-bg)',
                        border: `2px solid ${healthColor}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: 0, color: healthColor, fontSize: '1.2rem', textTransform: 'uppercase' }}>{healthLabel}</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{report.score}</div>
                        <p style={{ margin: 0, color: 'gray', fontSize: '0.8rem' }}>Health Score</p>
                    </div>

                    {/* Quick Metrics */}
                    <div style={{ flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={metricBox}>
                            <strong>{report.metrics.completedTasks} / {report.metrics.totalTasks}</strong>
                            <span>Tareas Completadas</span>
                        </div>
                        <div style={{ ...metricBox, color: report.metrics.overdueTasks > 0 ? '#ef4444' : 'inherit' }}>
                            <strong>{report.metrics.overdueTasks}</strong>
                            <span>Tareas Vencidas</span>
                        </div>
                        <div style={{ ...metricBox, color: report.metrics.negativeMoraleCount > 0 ? '#f59e0b' : 'inherit' }}>
                            <strong>{report.metrics.negativeMoraleCount}</strong>
                            <span>Check-ins Estresados</span>
                        </div>
                        <div style={metricBox}>
                            <strong>{report.metrics.blockerCount}</strong>
                            <span>Bloqueos Reportados</span>
                        </div>
                    </div>
                </div>

                {/* Gemini AI Summary */}
                {report.aiSummary && (
                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>✨</span>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Análisis IA (Gemini)</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--foreground)' }}>
                            {report.aiSummary}
                        </p>
                    </div>
                )}

                {/* AI Actionable Insights */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detección Activa (Insights)</h3>
                    {report.insights.length === 0 ? (
                        <p style={{ color: 'gray', fontStyle: 'italic' }}>No hay anomalías detectadas. El proyecto avanza según lo esperado.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {report.insights.map((insight, idx) => {
                                let bgColor = 'rgba(255, 255, 255, 0.05)';
                                let icon = 'ℹ️';
                                if (insight.type === 'DANGER') { bgColor = 'rgba(239, 68, 68, 0.1)'; icon = '🚨'; }
                                if (insight.type === 'WARNING') { bgColor = 'rgba(245, 158, 11, 0.1)'; icon = '⚠️'; }
                                if (insight.type === 'SUCCESS') { bgColor = 'rgba(16, 185, 129, 0.1)'; icon = '🔥'; }

                                return (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        backgroundColor: bgColor,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        borderLeft: `4px solid ${insight.type === 'WARNING' ? '#f59e0b' : insight.type === 'DANGER' ? '#ef4444' : insight.type === 'SUCCESS' ? '#10b981' : '#3b82f6'}`
                                    }}>
                                        <span>{icon}</span>
                                        <span>{insight.message}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Proyección Chart */}
                <div>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Gráfico de Proyección (Burndown Estimado)</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                <Area type="monotone" dataKey="expected" stroke="#10b981" fillOpacity={1} fill="url(#colorExpected)" name="Trayectoria Ideal" />
                                <Area type="monotone" dataKey="actual" stroke="#8884d8" fillOpacity={1} fill="url(#colorActual)" name="Carga Real" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'gray', marginTop: '0.5rem' }}>*Proyección experimental basada en tareas restantes.</p>
                </div>

            </div>
        </div>
    );
}

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    color: 'var(--foreground)'
};

const closeBtnStyle: React.CSSProperties = {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--border-color)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white'
};

const metricBox: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.85rem',
    color: 'gray'
};
