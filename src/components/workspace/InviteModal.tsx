'use client';

import React, { useState, useEffect } from 'react';
import styles from './InviteModal.module.css';

interface InviteModalProps {
    workspaceId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ workspaceId, isOpen, onClose }: InviteModalProps) {
    const [inviteUrl, setInviteUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setInviteUrl(`${window.location.origin}/invite/${workspaceId}`);
        }
    }, [workspaceId]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`¡Hola! Te invito a colaborar en este proyecto. Haz clic aquí para unirte: ${inviteUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <h3 className={styles.modalTitle}>Invitar al Workspace</h3>
                <p className={styles.modalDesc}>
                    Comparte el enlace a continuación. Si tu compañero no tiene cuenta, se le pedirá registrarse antes de unirse al proyecto automáticamente.
                </p>

                <div className={styles.linkContainer}>
                    <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className={styles.inputLink}
                    />
                    <button onClick={handleCopy} className={styles.copyBtn}>
                        {copied ? '¡Copiado!' : 'Copiar'}
                    </button>
                </div>

                <button onClick={handleWhatsApp} className={styles.waBtn}>
                    Enviar por WhatsApp
                </button>
            </div>
        </div>
    );
}
