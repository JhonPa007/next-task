'use client';

import React, { useState, useEffect } from 'react';
import { createCheckIn, getTaskCheckIns } from '@/app/actions/checkins';

interface CheckIn {
    id: string;
    accomplishments: string;
    blockers: string | null;
    morale: string;
    createdAt: Date;
    user: { name: string | null; email: string };
}

export default function CheckInsLog({ taskId, onClose }: { taskId: string, onClose?: () => void }) {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const fetchCheckIns = async () => {
            setIsLoadingData(true);
            const res = await getTaskCheckIns(taskId);
            if (res.success && res.data) {
                setCheckIns(res.data);
            }
            setIsLoadingData(false);
        };
        fetchCheckIns();
    }, [taskId]);

    // Formulario
    const [accomplishments, setAccomplishments] = useState('');
    const [blockers, setBlockers] = useState('');
    const [morale, setMorale] = useState('NORMAL');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!accomplishments.trim()) return;

        setLoading(true);
        const res = await createCheckIn(taskId, accomplishments, blockers.trim() || null, morale);

        if (res.success && res.data) {
            // Optimistic Update
            const newEntry: CheckIn = {
                id: res.data.id,
                accomplishments: res.data.accomplishments,
                blockers: res.data.blockers,
                morale: res.data.morale,
                createdAt: res.data.createdAt,
                user: { name: 'Yo', email: '' } // Refresh needed for real name
            };

            setCheckIns([newEntry, ...checkIns]);
            setIsModalOpen(false);
            setAccomplishments('');
            setBlockers('');
            setMorale('NORMAL');
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    const getMoraleEmoji = (status: string) => {
        if (status === 'EXCELENTE') return '🤩 Excelente';
        if (status === 'ESTRESADO') return '🥵 Estresado';
        return '🙂 Normal';
    };

    return (
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ✕
                </button>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: onClose ? '1rem' : '0' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>Log de Progreso (Tarea)</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    📝 Añadir Reporte
                </button>
            </div>

            {/* Listado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {checkIns.map(ci => (
                    <div key={ci.id} style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${ci.morale === 'ESTRESADO' ? 'var(--danger)' : ci.morale === 'EXCELENTE' ? 'var(--status-ready)' : 'gray'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                            <strong style={{ color: 'var(--primary)' }}>{ci.user.name || ci.user.email}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isMounted ? new Date(ci.createdAt).toLocaleDateString() : ''}</span>
                        </div>

                        <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <strong>✅ Logros: </strong> <span style={{ color: 'var(--text)' }}>{ci.accomplishments}</span>
                        </div>

                        {ci.blockers && (
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <strong>🚧 Bloqueos: </strong> <span style={{ color: 'var(--text)' }}>{ci.blockers}</span>
                            </div>
                        )}

                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                            Motivación: {getMoraleEmoji(ci.morale)}
                        </div>
                    </div>
                ))}

                {isLoadingData && checkIns.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Cargando historial...</p>
                )}

                {!isLoadingData && checkIns.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Aún no hay reportes de progreso en esta tarea.</p>
                )}
            </div>

            {/* Modal de Nuevo Check-in */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Escribe tu Check-In</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'gray', fontWeight: 'bold' }}>¿Qué lograste avanzar hoy/esta semana? *</label>
                                <textarea
                                    value={accomplishments}
                                    onChange={(e) => setAccomplishments(e.target.value)}
                                    style={{ width: '100%', height: '80px', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'gray', fontWeight: 'bold' }}>¿Hay algo bloqueando tu trabajo? (Opcional)</label>
                                <textarea
                                    value={blockers}
                                    onChange={(e) => setBlockers(e.target.value)}
                                    placeholder="Obstáculos, falta de recursos..."
                                    style={{ width: '100%', height: '60px', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'gray', fontWeight: 'bold' }}>¿Cuál es tu estado de ánimo?</label>
                                <select
                                    value={morale}
                                    onChange={(e) => setMorale(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="EXCELENTE">🤩 Excelente, muy motivado</option>
                                    <option value="NORMAL">🙂 Bien, normal</option>
                                    <option value="ESTRESADO">🥵 Estresado o frustrado</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !accomplishments.trim()}
                                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {loading ? 'Enviando...' : 'Enviar Reporte'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
