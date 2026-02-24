'use client';

import React, { useState } from 'react';
import styles from './BoardView.module.css';
import CheckInsLog from '@/components/checkins/CheckInsLog';

interface BoardViewProps {
    tasks: any[];
    onUpdateTask: (taskId: string, data: any) => void;
    onDeleteTask: (taskId: string) => void;
}

export default function BoardView({ tasks, onUpdateTask, onDeleteTask }: BoardViewProps) {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColId, setDragOverColId] = useState<string | null>(null);
    const [openCheckInsTaskId, setOpenCheckInsTaskId] = useState<string | null>(null);

    // Agrupar tareas por status
    const statuses = [
        { id: 'TODO', label: 'Por Hacer', color: 'var(--status-default)' },
        { id: 'IN_PROGRESS', label: 'En Curso', color: 'var(--status-working)' },
        { id: 'DONE', label: 'Listo', color: 'var(--status-ready)' },
        { id: 'STUCK', label: 'Detenido', color: 'var(--status-stuck)' }
    ];

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('text/plain', taskId);
        // Optional: set a drag image or effect
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, statusId: string) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColId !== statusId) {
            setDragOverColId(statusId);
        }
    };

    const handleDragLeave = () => {
        setDragOverColId(null);
    };

    const handleDrop = (e: React.DragEvent, newStatusId: string) => {
        e.preventDefault();
        setDragOverColId(null);

        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId && draggedTaskId === taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== newStatusId) {
                // Determine if we need to auto-complete or un-complete subtasks? 
                // Currently, we just let the main status change. The automated subtask sync
                // in TableView relies on onSubtasksChange. Here we are doing a direct status update.
                onUpdateTask(taskId, { status: newStatusId });
            }
        }
        setDraggedTaskId(null);
    };

    return (
        <div className={styles.boardContainer}>
            <h2 className={styles.boardTitle}>Tablero de Tareas</h2>
            <div className={styles.boardScroll}>
                <div className={styles.columnsWrapper}>
                    {statuses.map(statusCol => {
                        const colTasks = tasks.filter(t => t.status === statusCol.id);
                        return (
                            <div
                                key={statusCol.id}
                                className={`${styles.column} ${dragOverColId === statusCol.id ? styles.dragOver : ''}`}
                                onDragOver={(e) => handleDragOver(e, statusCol.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, statusCol.id)}
                            >
                                <div
                                    className={styles.columnHeader}
                                    style={{ backgroundColor: statusCol.color }}
                                >
                                    {statusCol.label} / {colTasks.length}
                                </div>
                                <div className={styles.columnBody}>
                                    {colTasks.map(task => {
                                        const subtasks = task.subtasks || [];
                                        const completedSub = subtasks.filter((s: any) => s.isCompleted).length;
                                        const hasSubtasks = subtasks.length > 0;
                                        const assignee = task.assignees?.[0]?.user;

                                        return (
                                            <div
                                                key={task.id}
                                                className={`${styles.card} ${draggedTaskId === task.id ? styles.dragging : ''}`}
                                                draggable={true}
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                            >
                                                <div className={styles.cardHeader}>
                                                    {task.priority !== 'LOW' && (
                                                        <span className={styles.priorityBadge}>
                                                            {task.priority === 'URGENT' ? '🔥🔥🔥' : task.priority === 'HIGH' ? '⭐⭐⭐' : '⭐⭐'}
                                                        </span>
                                                    )}
                                                    {assignee && (
                                                        <span className={styles.assigneeAvatar} title={assignee.name || assignee.email}>
                                                            {assignee.name ? assignee.name.charAt(0).toUpperCase() : '👤'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={styles.cardTitle}>{task.title}</div>

                                                <div className={styles.cardFooter}>
                                                    {hasSubtasks ? (
                                                        <div className={styles.subtaskBadge} title="Subtareas completadas">
                                                            <span>📋</span> {completedSub}/{subtasks.length}
                                                        </div>
                                                    ) : <div></div> /* Empty div to keep space between for flex */}

                                                    <div className={styles.cardActions}>
                                                        <button
                                                            onClick={() => setOpenCheckInsTaskId(task.id)}
                                                            className={styles.iconBtn}
                                                            title="Reportes de Progreso"
                                                        >📝</button>
                                                        <button
                                                            onClick={() => onDeleteTask(task.id)}
                                                            className={styles.iconBtn}
                                                            title="Borrar Tarea"
                                                        >🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Check-ins Modal */}
            {openCheckInsTaskId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <CheckInsLog
                            taskId={openCheckInsTaskId}
                            onClose={() => setOpenCheckInsTaskId(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
