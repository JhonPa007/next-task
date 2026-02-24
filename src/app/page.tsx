import React from 'react';
import Header from '@/components/layout/Header';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export default async function DashboardMain() {
    // Fetch platform global stats
    const workspacesCount = await prisma.workspace.count();
    const goalsCount = await prisma.goal.count();
    const tasksCount = await prisma.task.count();

    // Obtenemos los últimos proyectos / goals para mostrar en el feed
    const recentGoals = await prisma.goal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { workspace: true }
    });

    return (
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--background)' }}>
            <Header title="Dashboard Maestro" />

            <div style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Rendimiento Global de la Plataforma</h2>

                <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue}>{workspacesCount}</div>
                        <div className={styles.kpiLabel}>Espacios Activos</div>
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue} style={{ color: 'var(--status-working)' }}>{goalsCount}</div>
                        <div className={styles.kpiLabel}>Objetivos Estratégicos</div>
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue} style={{ color: 'var(--status-ready)' }}>{tasksCount}</div>
                        <div className={styles.kpiLabel}>Tareas Registradas</div>
                    </div>
                </div>

                <h3 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Actividad Reciente (OKRs)</h3>
                {recentGoals.length === 0 ? (
                    <p style={{ color: 'gray' }}>No hay objetivos registrados en la plataforma aún.</p>
                ) : (
                    <div className={styles.feedList}>
                        {recentGoals.map(g => (
                            <div key={g.id} className={styles.feedItem}>
                                <div>
                                    <strong>{g.title}</strong>
                                    <div style={{ fontSize: '0.85rem', color: 'gray', marginTop: '4px' }}>
                                        Espacio: {g.workspace.name} | Tipo: {g.type}
                                    </div>
                                </div>
                                <span className={styles.feedBadge}>
                                    {g.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
