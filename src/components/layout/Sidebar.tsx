'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';
import WorkspaceListClient from './WorkspaceListClient';
import PushSubscriber from '@/components/notifications/PushSubscriber';

interface SidebarProps {
    initialWorkspaces?: any[];
    isCollapsed?: boolean;
    isMobile?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ initialWorkspaces = [], isCollapsed = false, isMobile = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobile ? styles.mobile : ''}`}>
            {/* Collapse Toggle Button */}
            {onToggle && (
                <button
                    className={styles.toggleBtn}
                    onClick={onToggle}
                    title={isCollapsed ? "Mostrar Menú" : "Ocultar Menú"}
                >
                    {isCollapsed ? '》' : '《'}
                </button>
            )}

            <div className={styles.sidebarContent}>
                <div className={styles.logo}>
                    <span className={styles.icon}>⚡</span>
                    NextTask
                </div>
                <nav className={styles.nav}>
                    <ul>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <li className={pathname === '/' ? styles.active : ''}>
                                Dashboard Global
                            </li>
                        </Link>
                        <Link href="/my-tasks" style={{ textDecoration: 'none' }}>
                            <li className={pathname === '/my-tasks' ? styles.active : ''}>
                                Mis Tareas
                            </li>
                        </Link>
                        <Link href="/reports" style={{ textDecoration: 'none' }}>
                            <li className={pathname === '/reports' ? styles.active : ''}>
                                Reportes
                            </li>
                        </Link>
                    </ul>
                </nav>
                <WorkspaceListClient initialWorkspaces={initialWorkspaces} />
                <PushSubscriber />

                {/* User Profile & Logout */}
                <div className={styles.userSection}>
                    {!isCollapsed && session?.user && (
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>{session.user.name?.charAt(0).toUpperCase()}</div>
                            <span className={styles.userName}>{session.user.name}</span>
                        </div>
                    )}
                    <button
                        className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : ''}`}
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        title="Cerrar Sessión"
                    >
                        ⎋ {isCollapsed ? '' : 'Salir'}
                    </button>
                </div>
            </div>
        </aside>
    );
}
