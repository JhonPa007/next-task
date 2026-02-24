import React from 'react';
import Header from '@/components/layout/Header';
import { getGlobalTaskStats, getWorkloadStats, getGoalHealthStats } from '@/app/actions/reports';
import StatusDonutChart from '@/components/reports/StatusDonutChart';
import WorkloadBar from '@/components/reports/WorkloadBar';
import GoalHealthWidget from '@/components/reports/GoalHealthWidget';
import styles from '@/app/page.module.css'; // Reusando los estilos de tarjetas del dashboard global

export default async function ReportsPage() {
    // 1. Cargar todas las analíticas en paralelo
    const [taskStats, workloadStats, healthStats] = await Promise.all([
        getGlobalTaskStats(),
        getWorkloadStats(),
        getGoalHealthStats(),
    ]);

    // Calcular KPIs rápidos para la cabecera
    const totalTasks = taskStats.reduce((acc, curr) => acc + curr.value, 0);
    const completedTasks = taskStats.find(s => s.name === 'Listo')?.value || 0;
    const stuckTasks = taskStats.find(s => s.name === 'Detenido')?.value || 0;

    return (
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--background)' }}>
            <Header title="Dashboard Analítico" />

            <div style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Resumen General</h2>

                {/* 1. KPIs Rápidos (Reusando cards de page.module.css) */}
                <div className={styles.kpiGrid}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue} style={{ color: 'var(--foreground)' }}>{totalTasks}</div>
                        <div className={styles.kpiLabel}>Tareas Totales</div>
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue} style={{ color: 'var(--status-ready)' }}>{completedTasks}</div>
                        <div className={styles.kpiLabel}>Tareas Completadas</div>
                    </div>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiValue} style={{ color: 'var(--status-stuck)' }}>{stuckTasks}</div>
                        <div className={styles.kpiLabel}>Tareas Detenidas (Riesgo)</div>
                    </div>
                </div>

                {/* 2. Grid de Gráficos Complejos */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '2rem',
                    marginTop: '3rem'
                }}>

                    {/* Gráfico de Dona */}
                    <div style={{
                        backgroundColor: 'var(--card-bg, #fff)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--foreground)', textAlign: 'center' }}>Distribución de Tareas</h3>
                        <StatusDonutChart data={taskStats} />
                    </div>

                    {/* Gráfico de Barras */}
                    <div style={{
                        backgroundColor: 'var(--card-bg, #fff)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--foreground)', textAlign: 'center' }}>Carga de Trabajo por Miembro</h3>
                        <WorkloadBar data={workloadStats} />
                    </div>
                </div>

                {/* 3. Salud de OKRs (Fila Completa) */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>Salud de OKRs (Objetivos y Resultados Clave)</h3>
                    <GoalHealthWidget data={healthStats} />
                </div>

            </div>
        </main>
    );
}
