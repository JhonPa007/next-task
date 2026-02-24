'use client';

import React, { useState, useTransition } from 'react';
import styles from './SubtaskList.module.css';
import { createSubtask, toggleSubtaskCompletion, updateSubtaskTitle, deleteSubtask } from '@/app/actions/subtasks';

interface Subtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface SubtaskListProps {
    taskId: string;
    workspaceId: string;
    subtasks: Subtask[];
    onSubtasksChange: (taskId: string, newSubtasks: Subtask[]) => void;
}

export default function SubtaskList({ taskId, workspaceId, subtasks, onSubtasksChange }: SubtaskListProps) {
    const [newTitle, setNewTitle] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleCreate = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTitle.trim()) {
            const title = newTitle;
            setNewTitle(''); // clear early

            // optimista
            const tempId = `temp-${Date.now()}`;
            const optimisticSubtask = { id: tempId, title, isCompleted: false };
            onSubtasksChange(taskId, [...subtasks, optimisticSubtask]);

            startTransition(async () => {
                try {
                    const created = await createSubtask(taskId, workspaceId, title);
                    onSubtasksChange(taskId, [...subtasks, created]);
                } catch (err) {
                    console.error('Error creating subtask', err);
                    onSubtasksChange(taskId, subtasks); // revert
                }
            });
        }
    };

    const handleToggle = (st: Subtask) => {
        const newValue = !st.isCompleted;
        // optimista
        const updated = subtasks.map(s => s.id === st.id ? { ...s, isCompleted: newValue } : s);
        onSubtasksChange(taskId, updated);

        startTransition(async () => {
            try {
                // If it is a temp ID, we shouldn't attempt DB call yet (rare edge case)
                if (!st.id.startsWith('temp')) {
                    await toggleSubtaskCompletion(st.id, workspaceId, newValue);
                }
            } catch (err) {
                console.error(err);
                onSubtasksChange(taskId, subtasks); // revert
            }
        });
    };

    const handleDelete = (stId: string) => {
        // optimista
        const filtered = subtasks.filter(s => s.id !== stId);
        onSubtasksChange(taskId, filtered);

        startTransition(async () => {
            try {
                if (!stId.startsWith('temp')) {
                    await deleteSubtask(stId, workspaceId);
                }
            } catch (err) {
                console.error(err);
                onSubtasksChange(taskId, subtasks); // revert
            }
        });
    };

    const handleTitleBlur = (stId: string, oldTitle: string, newTitle: string) => {
        if (oldTitle === newTitle || !newTitle.trim()) return;

        // optimista
        const updated = subtasks.map(s => s.id === stId ? { ...s, title: newTitle } : s);
        onSubtasksChange(taskId, updated);

        startTransition(async () => {
            try {
                if (!stId.startsWith('temp')) {
                    await updateSubtaskTitle(stId, workspaceId, newTitle);
                }
            } catch (err) {
                console.error(err);
                onSubtasksChange(taskId, subtasks); // revert
            }
        });
    };

    return (
        <div className={styles.subtaskContainer}>
            <div className={styles.subtaskList}>
                {subtasks.map(st => (
                    <div key={st.id} className={`${styles.subtaskItem} ${st.isCompleted ? styles.completed : ''}`}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={st.isCompleted}
                            onChange={() => handleToggle(st)}
                        />
                        <input
                            type="text"
                            className={styles.subtaskInput}
                            defaultValue={st.title}
                            onBlur={(e) => handleTitleBlur(st.id, st.title, e.target.value)}
                        />
                        <button className={styles.deleteBtn} onClick={() => handleDelete(st.id)}>✕</button>
                    </div>
                ))}
            </div>

            <div className={styles.newSubtaskRow}>
                <div className={styles.iconHolder}></div>
                <input
                    type="text"
                    placeholder="Añadir subtarea (Enter)"
                    className={styles.newInput}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleCreate}
                />
            </div>
        </div>
    );
}
