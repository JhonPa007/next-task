'use client';

import React, { useState } from 'react';
import styles from './GoalList.module.css';
import { createGoal, updateGoal, deleteGoal, createKeyResult, updateKeyResult, deleteKeyResult } from '@/app/actions/goals';
import OKRHealthDetail from './OKRHealthDetail';

interface KeyResult {
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    unit?: string | null;
}

interface Goal {
    id: string;
    title: string;
    type: string;
    status: string;
    keyResults: KeyResult[];
}

interface GoalListProps {
    workspaceId: string;
    initialGoals: any[];
}

export default function GoalList({ workspaceId, initialGoals }: GoalListProps) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [isExpanded, setIsExpanded] = useState(true);

    // Goal State
    const [newTitle, setNewTitle] = useState('');
    const [isCreatingGoal, setIsCreatingGoal] = useState(false);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editGoalTitle, setEditGoalTitle] = useState('');

    // KR State
    const [creatingKrForGoalId, setCreatingKrForGoalId] = useState<string | null>(null);
    const [newKrTitle, setNewKrTitle] = useState('');
    const [newKrTarget, setNewKrTarget] = useState<number | ''>('');
    const [newKrUnit, setNewKrUnit] = useState('');

    const [editingKrId, setEditingKrId] = useState<string | null>(null);
    const [editKrTitle, setEditKrTitle] = useState('');
    const [editKrCurrent, setEditKrCurrent] = useState<number>(0);
    const [editKrTarget, setEditKrTarget] = useState<number>(0);
    const [editKrUnit, setEditKrUnit] = useState('');

    // Analytics Modal State
    const [healthModalGoal, setHealthModalGoal] = useState<{ id: string, title: string } | null>(null);

    // --- GOAL ACTIONS ---
    const handleCreateGoal = async () => {
        if (!newTitle.trim()) return;
        try {
            const g = await createGoal({ workspaceId, title: newTitle });
            setGoals([{ ...g, keyResults: [] }, ...goals]);
            setNewTitle('');
            setIsCreatingGoal(false);
        } catch (e) {
            alert('Error creando el objetivo');
        }
    };

    const handleSaveGoalEdit = async () => {
        if (!editGoalTitle.trim() || !editingGoalId) return;
        try {
            const updated = await updateGoal(editingGoalId, editGoalTitle, workspaceId);
            setGoals(prev => prev.map(g => g.id === editingGoalId ? { ...g, title: updated.title } : g));
            setEditingGoalId(null);
        } catch (error) {
            alert('Error al actualizar el objetivo');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este objetivo y todos sus resultados clave?')) return;
        try {
            await deleteGoal(id, workspaceId);
            setGoals(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            alert('Error al eliminar el objetivo');
        }
    };

    // --- KR ACTIONS ---
    const handleStartCreateKr = (goalId: string) => {
        setCreatingKrForGoalId(goalId);
        setNewKrTitle('');
        setNewKrTarget('');
        setNewKrUnit('');
    };

    const handleCreateKr = async (goalId: string) => {
        if (!newKrTitle.trim() || !newKrTarget) return;
        try {
            const kr = await createKeyResult({
                goalId,
                title: newKrTitle,
                targetValue: Number(newKrTarget),
                unit: newKrUnit
            });
            setGoals(prev => prev.map(g => {
                if (g.id === goalId) return { ...g, keyResults: [...g.keyResults, kr] };
                return g;
            }));
            setCreatingKrForGoalId(null);
        } catch (error) {
            alert('Error al crear Key Result');
        }
    };

    const handleStartEditKr = (kr: KeyResult) => {
        setEditingKrId(kr.id);
        setEditKrTitle(kr.title);
        setEditKrCurrent(kr.currentValue);
        setEditKrTarget(kr.targetValue);
        setEditKrUnit(kr.unit || '');
    };

    const handleSaveKrEdit = async (goalId: string) => {
        if (!editKrTitle.trim() || !editingKrId) return;
        try {
            const updated = await updateKeyResult(editingKrId, {
                title: editKrTitle,
                currentValue: editKrCurrent,
                targetValue: editKrTarget,
                unit: editKrUnit
            });

            setGoals(prev => prev.map(g => {
                if (g.id === goalId) {
                    return {
                        ...g,
                        keyResults: g.keyResults.map(kr => kr.id === editingKrId ? updated : kr)
                    };
                }
                return g;
            }));
            setEditingKrId(null);
        } catch (error) {
            alert('Error al actualizar KR');
        }
    };

    const handleDeleteKr = async (krId: string, goalId: string) => {
        if (!confirm('¿Eliminar este Key Result?')) return;
        try {
            await deleteKeyResult(krId);
            setGoals(prev => prev.map(g => {
                if (g.id === goalId) {
                    return { ...g, keyResults: g.keyResults.filter(kr => kr.id !== krId) };
                }
                return g;
            }));
        } catch (error) {
            alert('Error al eliminar KR');
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return 'var(--status-ready)';
            case 'AT_RISK': return 'var(--status-working)';
            case 'OFF_TRACK': return 'var(--status-stuck)';
            default: return 'var(--status-default)';
        }
    };

    return (
        <div className={styles.container}>
            {/* Cabecera Principal Colapsable */}
            <h2
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    marginBottom: isExpanded ? '1rem' : '0',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none'
                }}
            >
                <span style={{
                    marginRight: '0.5rem',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                    color: 'var(--primary)',
                    fontSize: '1rem',
                    display: 'inline-block'
                }}>
                    ▼
                </span>
                Gestión de Metas (OKRs & SMART)
            </h2>

            {isExpanded && (
                <>
                    <div className={styles.headerRow}>
                        <h3>Objetivos Estratégicos</h3>
                        <button onClick={() => setIsCreatingGoal(!isCreatingGoal)} className={styles.btnPrimary}>
                            + Nuevo Objetivo
                        </button>
                    </div>

                    {isCreatingGoal && (
                        <div className={styles.createCard}>
                            <input
                                type="text"
                                placeholder="Ej: Aumentar las menciones positivas en medios..."
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className={styles.input}
                            />
                            <button onClick={handleCreateGoal} className={styles.btnSave}>Guardar Objetivo</button>
                        </div>
                    )}

                    <div className={styles.goalGrid}>
                        {goals.map(goal => (
                            <div key={goal.id} className={styles.goalCard}>
                                {/* GOAL HEADER CAROUSEL */}
                                <div className={styles.goalTitleRow}>
                                    {editingGoalId === goal.id ? (
                                        <div style={{ display: 'flex', gap: '5px', flex: 1, paddingRight: '1rem' }}>
                                            <input
                                                type="text"
                                                value={editGoalTitle}
                                                onChange={(e) => setEditGoalTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoalEdit()}
                                                className={styles.input}
                                                autoFocus
                                            />
                                            <button onClick={handleSaveGoalEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                                            <button onClick={() => setEditingGoalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                        </div>
                                    ) : (
                                        <div className={styles.goalTitleSection}>
                                            <h4>{goal.title}</h4>
                                            <div className={styles.goalActions}>
                                                <button onClick={() => { setEditingGoalId(goal.id); setEditGoalTitle(goal.title); }} title="Renombrar">✏️</button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} title="Eliminar">🗑️</button>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            className={styles.healthBadge}
                                            onClick={() => setHealthModalGoal({ id: goal.id, title: goal.title })}
                                            title="Ver Análisis Predictivo"
                                        >
                                            🩺 Analizar
                                        </button>
                                        <span className={styles.badge} style={{ backgroundColor: statusColor(goal.status) }}>
                                            {goal.status}
                                        </span>
                                    </div>
                                </div>

                                {/* KR SECTION */}
                                <div className={styles.keyResults}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <p className={styles.krLabel} style={{ margin: 0 }}>Key Results (Resultados Clave):</p>
                                        <button onClick={() => handleStartCreateKr(goal.id)} className={styles.btnSecondary} style={{ fontSize: '0.8rem', padding: '2px 8px' }}>
                                            + Añadir KR
                                        </button>
                                    </div>

                                    <ul className={styles.krList}>
                                        {goal.keyResults.length === 0 && creatingKrForGoalId !== goal.id && (
                                            <p className={styles.emptyKr} onClick={() => handleStartCreateKr(goal.id)} style={{ cursor: 'pointer' }}>
                                                Sin Key Results. (Haz click para añadir métricas SMART).
                                            </p>
                                        )}

                                        {goal.keyResults.map(kr => (
                                            <li key={kr.id} className={styles.krListItem}>
                                                {editingKrId === kr.id ? (
                                                    <div className={styles.krEditForm}>
                                                        <input type="text" value={editKrTitle} onChange={e => setEditKrTitle(e.target.value)} placeholder="Título KR" className={styles.input} style={{ flex: 2 }} />
                                                        <input type="number" value={editKrCurrent} onChange={e => setEditKrCurrent(Number(e.target.value))} placeholder="Actual" className={styles.input} style={{ width: '60px' }} title="Valor actual" />
                                                        <span>/</span>
                                                        <input type="number" value={editKrTarget} onChange={e => setEditKrTarget(Number(e.target.value))} placeholder="Meta" className={styles.input} style={{ width: '60px' }} title="Meta final" />
                                                        <input type="text" value={editKrUnit} onChange={e => setEditKrUnit(e.target.value)} placeholder="Unidad (ej. %)" className={styles.input} style={{ width: '70px' }} />
                                                        <button onClick={() => handleSaveKrEdit(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                                                        <button onClick={() => setEditingKrId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                                    </div>
                                                ) : (
                                                    <div className={styles.krItemDisplay}>
                                                        <span style={{ flex: 1 }}>{kr.title}</span>
                                                        <div className={styles.krProgressContainer}>
                                                            {/* Progresión básica e iconos de acción en hover */}
                                                            <span className={styles.krNumbers}>
                                                                <strong>{kr.currentValue} / {kr.targetValue}</strong> {kr.unit}
                                                            </span>
                                                            <div className={styles.krActions}>
                                                                <button onClick={() => handleStartEditKr(kr)} title="Editar KR">✏️</button>
                                                                <button onClick={() => handleDeleteKr(kr.id, goal.id)} title="Eliminar KR">🗑️</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}

                                        {/* Inline Create KR Form */}
                                        {creatingKrForGoalId === goal.id && (
                                            <li className={styles.krEditForm} style={{ marginTop: '0.5rem' }}>
                                                <input type="text" value={newKrTitle} onChange={e => setNewKrTitle(e.target.value)} placeholder="Título de la métrica..." className={styles.input} style={{ flex: 2 }} autoFocus />
                                                <input type="number" value={newKrTarget} onChange={e => setNewKrTarget(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Meta (Nro)" className={styles.input} style={{ width: '80px' }} />
                                                <input type="text" value={newKrUnit} onChange={e => setNewKrUnit(e.target.value)} placeholder="Unidad" className={styles.input} style={{ width: '70px' }} />
                                                <button onClick={() => handleCreateKr(goal.id)} className={styles.btnSave} style={{ padding: '4px 8px' }}>Guardar</button>
                                                <button onClick={() => setCreatingKrForGoalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Health Analytics Modal */}
            {healthModalGoal && (
                <OKRHealthDetail
                    goalId={healthModalGoal.id}
                    goalTitle={healthModalGoal.title}
                    onClose={() => setHealthModalGoal(null)}
                />
            )}
        </div>
    );
}
