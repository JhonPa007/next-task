'use client';

import React, { useState, useTransition, useEffect } from 'react';
import TableView from './TableView';
import BoardView from './BoardView';
import CalendarView from './CalendarView';
import GanttView from './GanttView';
import WorkloadView from './WorkloadView';
import { createTask, updateTask, deleteTask } from '@/app/actions/tasks';
import styles from './TaskManager.module.css';

export default function TaskManager({
    initialTasks,
    workspaceId,
    members,
    customCreateTask,
    customUpdateTask,
    customDeleteTask,
    initialCheckIns
}: {
    initialTasks: any[],
    workspaceId?: string,
    members: any[],
    customCreateTask?: (title: string, priority: string) => Promise<any>,
    customUpdateTask?: (taskId: string, data: any) => Promise<any>,
    customDeleteTask?: (taskId: string) => Promise<any>,
    initialCheckIns?: any[]
}) {
    const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar' | 'gantt' | 'workload' | 'checkins'>('table');
    const [tasks, setTasks] = useState(initialTasks);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleCreateTask = async (title: string, priority: string = 'MEDIUM') => {
        if (!title.trim()) return;

        // Optimistic UI
        const optimisticTask = {
            id: `temp-${Date.now()}`,
            title,
            status: 'TODO',
            priority,
            dueDate: null,
            assignees: []
        };
        setTasks(prev => [optimisticTask, ...prev]);

        startTransition(async () => {
            try {
                if (customCreateTask) {
                    const newTask = await customCreateTask(title, priority);
                } else if (workspaceId) {
                    const newTask = await createTask({ workspaceId, title, priority });
                }
                // no revert needed unless error since useEffect will pick up real server task via revalidatePath
            } catch (e) {
                console.error(e);
                setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
            }
        });
    };

    const handleUpdateTask = async (taskId: string, data: any) => {
        // Optimistic UI
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const updated = { ...t, ...data };
                if (data.assigneeId !== undefined) {
                    if (data.assigneeId) {
                        const m = members.find(mbr => mbr.id === data.assigneeId);
                        updated.assignees = [{ user: { id: data.assigneeId, name: m?.name, email: m?.email } }];
                    } else {
                        updated.assignees = [];
                    }
                }
                return updated;
            }
            return t;
        }));

        startTransition(async () => {
            try {
                if (customUpdateTask) {
                    await customUpdateTask(taskId, data);
                } else if (workspaceId) {
                    await updateTask(taskId, workspaceId, data);
                }
            } catch (e) {
                console.error("Failed to update task", e);
            }
        });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('¿Seguro que quieres borrar esta tarea?')) return;

        // Optimistic UI
        setTasks(prev => prev.filter(t => t.id !== taskId));

        startTransition(async () => {
            try {
                if (customDeleteTask) {
                    await customDeleteTask(taskId);
                } else if (workspaceId) {
                    await deleteTask(taskId, workspaceId);
                }
            } catch (e) {
                console.error("Failed to delete task", e);
            }
        });
    };

    return (
        <div className={styles.taskManager}>
            <div className={styles.toolbar}>
                <div className={styles.viewToggles}>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.active : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        Tabla
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'kanban' ? styles.active : ''}`}
                        onClick={() => setViewMode('kanban')}
                    >
                        Kanban
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'calendar' ? styles.active : ''}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        Calendario
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'gantt' ? styles.active : ''}`}
                        onClick={() => setViewMode('gantt')}
                    >
                        Gantt
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'workload' ? styles.active : ''}`}
                        onClick={() => setViewMode('workload')}
                    >
                        Carga de Trabajo
                    </button>
                </div>
            </div>

            {viewMode === 'table' && (
                <TableView
                    tasks={tasks}
                    members={members}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}
            {viewMode === 'kanban' && (
                <BoardView
                    tasks={tasks}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                />
            )}
            {viewMode === 'calendar' && (
                <CalendarView
                    tasks={tasks}
                    onUpdateTask={handleUpdateTask}
                />
            )}
            {viewMode === 'gantt' && (
                <GanttView tasks={tasks} />
            )}
            {viewMode === 'workload' && (
                <WorkloadView tasks={tasks} members={members} />
            )}
        </div>
    );
}
