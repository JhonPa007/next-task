'use client';

import React from 'react';

interface GoalHealthProps {
    data: { id: string; title: string; progress: number; health: string; type: string }[];
}

export default function GoalHealthWidget({ data }: GoalHealthProps) {
    if (data.length === 0) {
        return <div style={{ color: 'gray' }}>No hay OKRs registrados recientemente.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.map(goal => {
                let colorClass = 'var(--status-ready)';
                let badgeText = 'A Tiempo';

                if (goal.health === 'AT_RISK') {
                    colorClass = 'var(--status-stuck)';
                    badgeText = 'En Riesgo';
                } else if (goal.health === 'NEEDS_ATTENTION') {
                    colorClass = 'var(--status-working)';
                    badgeText = 'Atención';
                }

                return (
                    <div key={goal.id} style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--background)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{goal.title}</strong>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: colorClass,
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {badgeText}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.8rem' }}>
                            <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${goal.progress}%`,
                                    backgroundColor: colorClass,
                                    height: '100%',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                {goal.progress}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
