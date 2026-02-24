import React, { useMemo } from 'react';
import styles from './WorkloadView.module.css';

interface WorkloadViewProps {
    tasks: any[];
    members: any[];
}

export default function WorkloadView({ tasks, members }: WorkloadViewProps) {
    // Definir rango de fechas (4 semanas: 1 atrás, 3 adelante)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - 7); // Inicio de semana anterior

    const daysToShow = 28; // 4 semanas

    const dateHeaders = useMemo(() => {
        const headers = [];
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            headers.push(d);
        }
        return headers;
    }, [startDate]);

    // Función auxiliar para saber si una tarea cae en un día específico
    const isTaskActiveOnDate = (task: any, date: Date) => {
        if (!task.startDate || !task.dueDate) return false;
        const start = new Date(task.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(task.dueDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    };

    // Preparar filas: una por miembro + "Sin Asignar"
    const rows = [
        ...members.map(m => ({ id: m.id, name: m.name || m.email, isUnassigned: false })),
        { id: 'unassigned', name: 'Sin Asignar', isUnassigned: true }
    ];

    const getWorkloadIntensityColor = (taskCount: number) => {
        if (taskCount === 0) return 'transparent';
        if (taskCount === 1) return 'var(--primary)'; // Normal
        if (taskCount === 2) return '#f59e0b'; // Medium/Warning (Orange)
        return '#ef4444'; // Heavy/Critical (Red)
    };

    return (
        <div className={styles.workloadContainer}>
            <div className={styles.workloadScrollable}>
                <div className={styles.headerRow}>
                    <div className={styles.memberHeader}>Miembro del Equipo</div>
                    <div className={styles.timelineHeader}>
                        {dateHeaders.map((d, i) => {
                            const isToday = d.getTime() === today.getTime();
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                                <div key={i} className={`${styles.dayHeader} ${isToday ? styles.today : ''} ${isWeekend ? styles.weekend : ''}`}>
                                    <span className={styles.dayNum}>{d.getDate()}</span>
                                    <span className={styles.dayWeek}>{d.toLocaleDateString('es', { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.body}>
                    {rows.map(row => {
                        return (
                            <div key={row.id} className={styles.memberRow}>
                                <div className={styles.memberInfo}>
                                    <div className={styles.avatar}>
                                        {row.isUnassigned ? '?' : row.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={styles.memberName}>{row.name}</span>
                                </div>
                                <div className={styles.timelineRow}>
                                    {dateHeaders.map((date, i) => {
                                        let activeTasksCount = 0;
                                        let activeTasksTitles: string[] = [];

                                        tasks.forEach(task => {
                                            const isAssignee = row.isUnassigned
                                                ? (!task.assignees || task.assignees.length === 0)
                                                : (task.assignees?.some((a: any) => a.user.id === row.id));

                                            if (isAssignee && task.status !== 'DONE' && isTaskActiveOnDate(task, date)) {
                                                activeTasksCount++;
                                                activeTasksTitles.push(task.title);
                                            }
                                        });

                                        const bgColor = getWorkloadIntensityColor(activeTasksCount);
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                        return (
                                            <div key={i} className={`${styles.cell} ${isWeekend ? styles.weekendCell : ''}`}>
                                                {activeTasksCount > 0 && (
                                                    <div
                                                        className={styles.bubble}
                                                        style={{ backgroundColor: bgColor }}
                                                        title={activeTasksTitles.join('\n')}
                                                    >
                                                        {activeTasksCount}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.legend}>
                <span><strong>Leyenda (Tareas activas por día):</strong></span>
                <span className={styles.legendItem}><span className={styles.dot} style={{ background: 'var(--primary)' }}></span> 1 Tarea (Óptimo)</span>
                <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#f59e0b' }}></span> 2 Tareas (Alerta)</span>
                <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#ef4444' }}></span> 3+ Tareas (Sobrecarga)</span>
            </div>
        </div>
    );
}
