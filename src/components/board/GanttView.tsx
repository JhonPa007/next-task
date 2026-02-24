import React, { useMemo } from 'react';
import styles from './GanttView.module.css';

interface GanttViewProps {
    tasks: any[];
}

export default function GanttView({ tasks }: GanttViewProps) {
    // Definir el rango del Gantt (ej. 30 días a partir de hoy)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Configuración del rango (vamos a mostrar 60 días: 15 antes, 45 después)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 15);

    const daysToShow = 60;

    const dateHeaders = useMemo(() => {
        const headers = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            headers.push(d);
        }
        return headers;
    }, [startDate]);

    // Filtrar solo tareas que tienen fechas
    const scheduledTasks = tasks.filter(t => t.startDate && t.dueDate).sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'var(--status-ready)';
            case 'IN_PROGRESS': return 'var(--status-working)';
            case 'STUCK': return 'var(--status-stuck)';
            default: return 'var(--primary)';
        }
    };

    return (
        <div className={styles.ganttContainer}>
            <div className={styles.ganttScrollable}>
                <div className={styles.ganttHeader}>
                    <div className={styles.taskLabelHeader}>Tarea</div>
                    <div className={styles.timelineHeader}>
                        {dateHeaders.map((d, i) => {
                            const isToday = d.getTime() === today.getTime();
                            return (
                                <div key={i} className={`${styles.dayHeader} ${isToday ? styles.todayHeader : ''}`}>
                                    <span>{d.getDate()}</span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{d.toLocaleDateString('es', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.ganttBody}>
                    {/* Linea de Hoy */}
                    <div
                        className={styles.todayLine}
                        style={{ left: `calc(250px + ${15 * 40}px + 20px)` }}
                    />

                    {scheduledTasks.length === 0 ? (
                        <div style={{ padding: '2rem', color: '#888' }}>
                            No hay tareas con fechas de inicio y fin asignadas para mostrar en el diagrama de Gantt.
                        </div>
                    ) : (
                        scheduledTasks.map(task => {
                            const taskStart = new Date(task.startDate);
                            taskStart.setHours(0, 0, 0, 0);
                            const taskEnd = new Date(task.dueDate);
                            taskEnd.setHours(0, 0, 0, 0);

                            // Calcular posición (cada columna es de 40px)
                            const daysFromStart = Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            const duration = Math.max(1, Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

                            return (
                                <div key={task.id} className={styles.ganttRow}>
                                    <div className={styles.taskLabel} title={task.title}>
                                        {task.title}
                                    </div>
                                    <div className={styles.timelineRow}>
                                        {daysFromStart >= 0 && daysFromStart < daysToShow && (
                                            <div
                                                className={styles.ganttBar}
                                                style={{
                                                    left: `${daysFromStart * 40}px`,
                                                    width: `${duration * 40 - 4}px`, // -4 para margen
                                                    backgroundColor: getStatusColor(task.status)
                                                }}
                                                title={`${task.title} (${taskStart.toLocaleDateString()} - ${taskEnd.toLocaleDateString()})`}
                                            >
                                                <span className={styles.barProgressText}>{task.status === 'DONE' ? '100%' : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
