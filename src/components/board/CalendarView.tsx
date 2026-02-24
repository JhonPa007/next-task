import React, { useState } from 'react';
import styles from './CalendarView.module.css';

interface CalendarViewProps {
    tasks: any[];
    onUpdateTask: (taskId: string, data: any) => void;
}

export default function CalendarView({ tasks, onUpdateTask }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const getDaysArray = () => {
        const days = [];
        // Fill empty slots before first day
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const today = () => {
        setCurrentDate(new Date());
    };

    const days = getDaysArray();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const isToday = (day: number | null) => {
        if (!day) return false;
        const todayDate = new Date();
        return day === todayDate.getDate() &&
            currentDate.getMonth() === todayDate.getMonth() &&
            currentDate.getFullYear() === todayDate.getFullYear();
    };

    const getTasksForDay = (day: number | null) => {
        if (!day) return [];
        const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];

        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDateMatch = task.dueDate instanceof Date
                ? task.dueDate.toISOString().split('T')[0]
                : new Date(task.dueDate).toISOString().split('T')[0];
            return taskDateMatch === dateString;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'var(--status-ready)';
            case 'IN_PROGRESS': return 'var(--status-working)';
            case 'STUCK': return 'var(--status-stuck)';
            default: return 'var(--status-default)';
        }
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                <div className={styles.monthTitle}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <div className={styles.controls}>
                    <button onClick={today} className={styles.btn}>Hoy</button>
                    <button onClick={prevMonth} className={styles.btnIcon}>&lt;</button>
                    <button onClick={nextMonth} className={styles.btnIcon}>&gt;</button>
                </div>
            </div>

            <div className={styles.grid}>
                {dayNames.map(dayName => (
                    <div key={dayName} className={styles.dayName}>{dayName}</div>
                ))}

                {days.map((day, index) => {
                    const dayTasks = getTasksForDay(day);
                    return (
                        <div key={index} className={`${styles.dayCell} ${day ? '' : styles.emptyCell} ${isToday(day) ? styles.today : ''}`}>
                            <div className={styles.dayNumber}>{day}</div>
                            <div className={styles.tasksWrapper}>
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={styles.taskPill}
                                        style={{ borderLeftColor: getStatusColor(task.status) }}
                                        title={task.title}
                                    >
                                        <span className={styles.pillText}>{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
