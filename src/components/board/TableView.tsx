'use client';

import React, { useState } from 'react';
import styles from './TableView.module.css';
import SubtaskList from './SubtaskList';
import CheckInsLog from '@/components/checkins/CheckInsLog';

interface TableViewProps {
    tasks: any[];
    members: any[];
    onCreateTask: (title: string, priority: string) => void;
    onUpdateTask: (taskId: string, data: any) => void;
    onDeleteTask: (taskId: string) => void;
}

export default function TableView({ tasks, members, onCreateTask, onUpdateTask, onDeleteTask }: TableViewProps) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
    const [openCheckInsTaskId, setOpenCheckInsTaskId] = useState<string | null>(null);

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const formatDate = (dateString: string | Date | null) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'var(--status-ready)';
            case 'IN_PROGRESS': return 'var(--status-working)';
            case 'STUCK': return 'var(--status-stuck)';
            default: return 'var(--status-default)'; // TODO
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DONE': return 'Listo';
            case 'IN_PROGRESS': return 'En curso';
            case 'STUCK': return 'Detenido';
            default: return 'Por Hacer';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'var(--status-stuck)'; // Rojo
            case 'HIGH': return 'var(--status-working)'; // Naranja
            case 'MEDIUM': return 'var(--status-blue)'; // Azul
            default: return 'var(--status-default)'; // Gris
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'Crítica';
            case 'HIGH': return 'Alta';
            case 'MEDIUM': return 'Media';
            default: return 'Baja';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTaskTitle.trim()) {
            onCreateTask(newTaskTitle, 'MEDIUM');
            setNewTaskTitle('');
        }
    };

    // Agrupamos bajo "Todas las tareas" por defecto (simulando monday.com group)
    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <div className={styles.group}>
                    <div className={styles.groupHeader}>
                        <div className={styles.groupTitle} style={{ color: 'var(--primary)' }}>
                            <span className={styles.expandIcon}>▼</span> Tareas del Proyecto
                        </div>
                        <div className={styles.columns}>
                            <span>Dueño</span>
                            <span>Estado</span>
                            <span>Cronograma</span>
                            <span>Prioridad</span>
                            <span>+</span>
                        </div>
                    </div>

                    <div className={styles.taskList}>
                        {tasks.map((task) => {
                            const isExpanded = !!expandedTasks[task.id];
                            const totalSubtasks = task.subtasks?.length || 0;
                            const completedSubtasks = task.subtasks?.filter((s: any) => s.isCompleted).length || 0;

                            return (
                                <React.Fragment key={task.id}>
                                    <div className={styles.taskRow}>
                                        <div className={styles.indicator} style={{ backgroundColor: 'var(--primary)' }}></div>

                                        <div className={styles.taskTitle}>
                                            <button
                                                onClick={() => toggleExpand(task.id)}
                                                className={styles.rowExpandBtn}
                                                title={isExpanded ? 'Colapsar subtareas' : 'Expandir subtareas'}
                                            >
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                            <input
                                                type="text"
                                                defaultValue={task.title}
                                                onBlur={(e) => {
                                                    if (e.target.value !== task.title) {
                                                        onUpdateTask(task.id, { title: e.target.value });
                                                    }
                                                }}
                                                className={styles.editableInput}
                                            />
                                            {totalSubtasks > 0 && (
                                                <span className={styles.progressCounter} title="Subtareas completadas">
                                                    {completedSubtasks}/{totalSubtasks}
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.owner}>
                                            <select
                                                className={styles.assigneeSelect}
                                                value={task.assignees?.[0]?.user?.id || ''}
                                                onChange={(e) => onUpdateTask(task.id, { assigneeId: e.target.value || null })}
                                            >
                                                <option value="">Sin Asignar</option>
                                                {members.map((m: any) => (
                                                    <option key={m.id} value={m.id}>{m.name || m.email}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div
                                            className={styles.status}
                                            style={{ backgroundColor: getStatusColor(task.status) }}
                                            onClick={() => {
                                                // Ciclo de estados simple
                                                const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS'
                                                    : task.status === 'IN_PROGRESS' ? 'DONE'
                                                        : task.status === 'DONE' ? 'STUCK'
                                                            : 'TODO';
                                                onUpdateTask(task.id, { status: nextStatus });
                                            }}
                                            title="Click para cambiar"
                                        >
                                            {getStatusText(task.status)}
                                        </div>

                                        <div className={styles.timeline}>
                                            <input
                                                type="date"
                                                className={styles.dateInput}
                                                defaultValue={formatDate(task.startDate)}
                                                onChange={(e) => onUpdateTask(task.id, { startDate: e.target.value ? new Date(e.target.value) : null })}
                                                title="Fecha de inicio"
                                            />
                                            <span>-</span>
                                            <input
                                                type="date"
                                                className={styles.dateInput}
                                                defaultValue={formatDate(task.dueDate)}
                                                onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value) : null })}
                                                title="Fecha de entrega"
                                            />
                                        </div>

                                        <div className={styles.priority}
                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                            onClick={() => {
                                                const nextPrio = task.priority === 'LOW' ? 'MEDIUM'
                                                    : task.priority === 'MEDIUM' ? 'HIGH'
                                                        : task.priority === 'HIGH' ? 'URGENT'
                                                            : 'LOW';
                                                onUpdateTask(task.id, { priority: nextPrio });
                                            }}
                                            title="Click para cambiar"
                                        >
                                            {getPriorityText(task.priority)}
                                        </div>

                                        <div className={styles.addCol}>
                                            <button onClick={() => setOpenCheckInsTaskId(task.id)} className={styles.deleteBtn} title="Reporte de Progreso">📝</button>
                                            <button onClick={() => onDeleteTask(task.id)} className={styles.deleteBtn}>🗑️</button>
                                        </div>
                                    </div>

                                    {/* Fila colapsable de Subtareas */}
                                    {isExpanded && (
                                        <SubtaskList
                                            taskId={task.id}
                                            workspaceId={task.workspaces?.[0]?.workspaceId || ''}
                                            subtasks={task.subtasks || []}
                                            onSubtasksChange={(taskId, newSubtasks) => {
                                                const updatePayload: any = { subtasks: newSubtasks };

                                                // Automatización de Estados
                                                if (newSubtasks.length > 0) {
                                                    const completed = newSubtasks.filter(s => s.isCompleted).length;
                                                    if (completed === newSubtasks.length && task.status !== 'DONE') {
                                                        updatePayload.status = 'DONE';
                                                    } else if (completed > 0 && completed < newSubtasks.length && task.status === 'TODO') {
                                                        updatePayload.status = 'IN_PROGRESS';
                                                    } else if (completed === 0 && task.status === 'DONE') {
                                                        updatePayload.status = 'TODO';
                                                    }
                                                }

                                                onUpdateTask(taskId, updatePayload);
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <div className={styles.taskRow}>
                            <div className={styles.indicator} style={{ backgroundColor: 'transparent' }}></div>
                            <div className={styles.taskTitle}>
                                <input
                                    type="text"
                                    placeholder="+ Añadir tarea (Enter para guardar)"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={styles.newTaskInput}
                                />
                            </div>
                            <div className={styles.owner}></div>
                            <div className={styles.status}></div>
                            <div className={styles.timeline}></div>
                            <div className={styles.priority}></div>
                        </div>
                    </div>
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
