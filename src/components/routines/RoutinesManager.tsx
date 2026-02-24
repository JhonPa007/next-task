'use client';

import React, { useState } from 'react';
import { createRoutine, resolveRoutineWithEvidence, deleteRoutine } from '@/app/actions/routines';

interface Routine {
    id: string;
    title: string;
    isCompleted: boolean;
    evidence: string | null;
    nextPingAt: Date;
    intervalMinutes: number;
}

export default function RoutinesManager({ initialRoutines }: { initialRoutines: Routine[] }) {
    const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [interval, setIntervalVal] = useState(30);
    const [loading, setLoading] = useState(false);

    // Modal state for resolving evidence
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [evidence, setEvidence] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true);

        const startTime = startDate ? new Date(startDate) : undefined;
        const res = await createRoutine(title, interval, startTime);

        if (res.success && res.data) {
            setRoutines([res.data as unknown as Routine, ...routines]);
            setTitle('');
            setStartDate('');
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    const handleResolve = async () => {
        if (!resolvingId || !evidence.trim()) {
            alert('Evidencia es obligatoria.');
            return;
        }

        setLoading(true);
        const res = await resolveRoutineWithEvidence(resolvingId, evidence);
        if (res.success && res.data) {
            setRoutines(routines.map(r => r.id === resolvingId ? res.data as unknown as Routine : r));
            setResolvingId(null);
            setEvidence('');
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        const confirm = window.confirm('¿Eliminar esta rutina persistentemente?');
        if (!confirm) return;

        setLoading(true);
        const res = await deleteRoutine(id);
        if (res.success) {
            setRoutines(routines.filter(r => r.id !== id));
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <div style={{ marginBottom: '2rem', backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⏰ Alarmas Cotidianas (Nagging Tasks)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Estas tareas te enviarán notificaciones Push <b>cada ciertos minutos</b> de forma insistente hasta que subas la evidencia.
            </p>

            {/* Formulario de creación rápida */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Ej. Enviar Balance a Contabilidad"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text)' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'gray' }}>Primer aviso (Opcional):</span>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text)' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'gray' }}>Frecuencia:</span>
                    <select
                        value={interval}
                        onChange={(e) => setIntervalVal(Number(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text)' }}
                    >
                        <option value={15}>Insistir c/ 15 min</option>
                        <option value={30}>Insistir c/ 30 min</option>
                        <option value={60}>Insistir c/ 1 hora</option>
                        <option value={120}>Insistir c/ 2 horas</option>
                    </select>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading || !title.trim()}
                    style={{ padding: '0.5rem 1rem', alignSelf: 'flex-end', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Creando...' : 'Añadir Alarma'}
                </button>
            </div>

            {/* Listado de Rutinas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {routines.map(routine => (
                    <div key={routine.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                        backgroundColor: routine.isCompleted ? 'var(--background)' : 'var(--surface)'
                    }}>
                        <div>
                            <span style={{ textDecoration: routine.isCompleted ? 'line-through' : 'none', fontWeight: 'bold' }}>
                                {routine.title}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {routine.isCompleted
                                    ? <span style={{ color: 'var(--status-ready)' }}>✅ Evidencia: {routine.evidence}</span>
                                    : <span style={{ color: 'var(--danger)' }}>🚨 Próximo aviso: {new Date(routine.nextPingAt).toLocaleString()} (c/ {routine.intervalMinutes}m)</span>
                                }
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!routine.isCompleted && (
                                <button
                                    onClick={() => setResolvingId(routine.id)}
                                    style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--status-ready)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                >
                                    Subir Evidencia
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(routine.id)}
                                style={{ padding: '0.4rem 0.8rem', color: 'gray', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {routines.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay alarmas activas.</p>}
            </div>

            {/* Modal de Resolución con Evidencia Obligatoria */}
            {resolvingId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Sube tu Evidencia Obligatoria</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Pega aquí el enlace de Drive, OneDrive, foto o texto confirmando que la tarea realmente se hizo.
                        </p>
                        <textarea
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            placeholder="Ej: https://docs.google.com/... o 'Ya lo mandé por correo'"
                            style={{ width: '100%', height: '80px', padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                                onClick={() => setResolvingId(null)}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={loading || !evidence.trim()}
                                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (!evidence.trim() || loading) ? 0.5 : 1 }}
                            >
                                {loading ? 'Guardando...' : 'Confirmar & Silenciar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
