'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import styles from './SidebarLayout.module.css';

interface SidebarLayoutProps {
    children: React.ReactNode;
    initialWorkspaces: any[];
}

export default function SidebarLayout({ children, initialWorkspaces }: SidebarLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Auto collapse on mobile initially
            if (mobile) setIsCollapsed(true);
            else setIsCollapsed(false);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className={styles.layout}>
            {/* Mobile Backdrop */}
            {isMounted && isMobile && !isCollapsed && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            <Sidebar
                initialWorkspaces={initialWorkspaces}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                onToggle={toggleSidebar}
            />

            {/* Main Content Area */}
            <div
                className={`${styles.mainContent} ${isCollapsed ? styles.contentCollapsed : ''} ${isMobile ? styles.contentMobile : ''}`}
            >
                {/* Mobile Hamburger (Only visible when totally collapsed on mobile) */}
                {isMounted && isMobile && isCollapsed && (
                    <button
                        className={styles.mobileToggleBtn}
                        onClick={toggleSidebar}
                        title="Abrir Menú"
                    >
                        ☰
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
