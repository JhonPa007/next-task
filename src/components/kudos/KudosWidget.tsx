'use client';

import React, { useState, useEffect } from 'react';
import { createKudo } from '@/app/actions/kudos';

interface UserData {
    id: string;
    name?: string | null;
    email: string;
}

interface Kudo {
    id: string;
    message: string;
    points: number;
    createdAt: Date;
    sender: { name: string | null; email: string };
    receiver: { name: string | null; email: string };
}

export default function KudosWidget({ workspaceId, initialKudos, members }: { workspaceId: string, initialKudos: Kudo[], members: UserData[] }) {
    const [kudos, setKudos] = useState<Kudo[]>(initialKudos);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Form state
    const [receiverId, setReceiverId] = useState(members[0]?.id || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendKudo = async () => {
        if (!receiverId || !message.trim()) return;

        setLoading(true);
        const res = await createKudo(receiverId, workspaceId, message);

        if (res.success && res.data) {
            // Optimistic update fetching correct names for the view
            const senderInfo = members.find(m => m.id === res.data!.senderId) || { name: 'Tú', email: '' };
            const receiverInfo = members.find(m => m.id === receiverId) || { name: 'Compañero', email: '' };

            const newKudo: Kudo = {
                id: res.data.id,
                message: res.data.message,
                points: res.data.points,
                createdAt: res.data.createdAt,
                sender: { name: senderInfo.name || null, email: senderInfo.email },
                receiver: { name: receiverInfo.name || null, email: receiverInfo.email }
            };

            setKudos([newKudo, ...kudos].slice(0, 10)); // Keep only max 10 local
            setIsModalOpen(false);
            setMessage('');

            // Efecto casero:
            alert('🎉 ¡Kudo enviado correctamente! +10 puntos para ' + (receiverInfo.name || receiverInfo.email));
        } else {
            alert('Error: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <div style={{ marginBottom: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ffdb58' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isExpanded ? '1rem' : '0' }}>
                <h2
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ fontSize: '1.2rem', color: '#ffd700', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
                >
                    <span style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s',
                        fontSize: '1rem',
                        display: 'inline-block'
                    }}>
                        ▼
                    </span>
                    🏆 Muro de Reconocimiento
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffd700', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    👏 Dar un Kudo
                </button>
            </div>

            {isExpanded && (
                <>
                    {/* Listado de Kudos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {kudos.map(k => (
                            <div key={k.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #ffd700' }}>
                                <div style={{ fontSize: '2rem' }}>🎉</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                                        <strong style={{ color: 'var(--primary)' }}>{k.sender.name || k.sender.email}</strong> aplaudió a <strong>{k.receiver.name || k.receiver.email}</strong> <span style={{ color: '#ffd700', fontWeight: 'bold' }}>(+{k.points} pts)</span>
                                    </div>
                                    <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--text)' }}>
                                        "{k.message}"
                                    </p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                        {isMounted ? new Date(k.createdAt).toLocaleString() : ''}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {kudos.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                Aún no hay reconocimientos en este proyecto. ¡Sé el primero en agradecer a alguien! 🌟
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal de Enviar Kudo */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', width: '400px', maxWidth: '90%', border: '2px solid #ffd700' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#ffd700' }}>👏 Reconocer a un compañero</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'gray' }}>¿A quién quieres reconocer?</label>
                                <select
                                    value={receiverId}
                                    onChange={(e) => setReceiverId(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                                >
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name || m.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'gray' }}>Mensaje (apreciativo y específico)</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ej: Gracias por quedarte hasta tarde ayudando a reparar el bug en producción. ¡Gran trabajo en equipo!"
                                    style={{ width: '100%', height: '100px', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border-color)' }}
                                />
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
                                onClick={handleSendKudo}
                                disabled={loading || !message.trim()}
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {loading ? 'Enviando...' : 'Enviar Kudo 🎉'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
