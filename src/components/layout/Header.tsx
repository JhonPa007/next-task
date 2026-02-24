'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './Header.module.css';
import InviteModal from '../workspace/InviteModal';
import { useTheme } from '@/components/theme/ThemeProvider';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const params = useParams();
    const workspaceId = params.id as string;
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>{title}</h1>
            </div>
            <div className={styles.controls}>
                {workspaceId && (
                    <button
                        className={styles.inviteBtn}
                        onClick={() => setIsInviteOpen(true)}
                        title="Invitar miembro"
                    >
                        👤 <span className={styles.btnText}>Invitar</span>
                    </button>
                )}
                <button className={styles.btnIcon}>Integraciones</button>
                <button className={styles.btnIcon}>Automatiza / 2</button>
                <button
                    className={styles.btnIcon}
                    onClick={toggleTheme}
                    title="Cambiar Tema"
                    style={{ fontSize: '1.2rem', padding: '0 0.5rem' }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>

            {/* Invite Modal */}
            {workspaceId && (
                <InviteModal
                    workspaceId={workspaceId}
                    isOpen={isInviteOpen}
                    onClose={() => setIsInviteOpen(false)}
                />
            )}
        </header>
    );
}
