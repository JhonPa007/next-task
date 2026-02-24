'use client';

import React, { useState, useTransition } from 'react';
import { inviteUserToWorkspace } from '@/app/actions/workspace';
import styles from './InviteModal.module.css';

interface InviteModalProps {
    workspaceId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ workspaceId, isOpen, onClose }: InviteModalProps) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!email.trim() || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Por favor, introduce un correo electrónico válido.' });
            return;
        }

        startTransition(async () => {
            const result = await inviteUserToWorkspace(workspaceId, email);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: result.message || 'Miembro añadido.' });
                setEmail(''); // reset
                // Cierra el modal automáticamente después de un segundo si hay éxito
                setTimeout(() => {
                    onClose();
                    setMessage(null);
                }, 1500);
            }
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <h3 className={styles.modalTitle}>Invitar al Workspace</h3>
                <p className={styles.modalDesc}>
                    Escribe el correo electrónico de tu colaborador. Si no tiene cuenta, le crearemos una temporal para que puedas asignarle tareas inmediatamente.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        placeholder="ejemplo@equipo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        disabled={isPending}
                        autoFocus
                    />
                    {message && (
                        <div className={`${styles.message} ${message.type === 'error' ? styles.errorMsg : styles.successMsg}`}>
                            {message.text}
                        </div>
                    )}
                    <button type="submit" className={styles.submitBtn} disabled={isPending}>
                        {isPending ? 'Enviando...' : 'Añadir Miembro'}
                    </button>
                </form>
            </div>
        </div>
    );
}
