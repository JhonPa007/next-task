'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { createWorkspace, updateWorkspace, deleteWorkspace } from '@/app/actions/workspace';

interface WorkspaceListClientProps {
    initialWorkspaces: any[];
}

export default function WorkspaceListClient({ initialWorkspaces }: WorkspaceListClientProps) {
    const [workspaces, setWorkspaces] = useState(initialWorkspaces);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    // Edit state
    const [editingWsId, setEditingWsId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const pathname = usePathname();
    const router = useRouter();

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            const ws = await createWorkspace(newName);
            setWorkspaces(prev => [ws, ...prev]);
            setNewName('');
            setIsCreating(false);
        } catch (e) {
            alert("Error creando el espacio de trabajo. ¿Está conectada la BD?");
        }
    };

    const handleStartEdit = (ws: any, e: React.MouseEvent) => {
        e.preventDefault();
        setEditingWsId(ws.id);
        setEditName(ws.name);
    };

    const handleSaveEdit = async (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editingWsId) return;

        try {
            const updated = await updateWorkspace(editingWsId, editName);
            setWorkspaces(prev => prev.map(w => w.id === editingWsId ? updated : w));
            setEditingWsId(null);
            setEditName('');
        } catch (error) {
            alert('Error al actualizar el workspace');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm('¿Estás seguro de eliminar este espacio de trabajo? Se borrarán todas sus metas.')) return;

        try {
            await deleteWorkspace(id);
            setWorkspaces(prev => prev.filter(w => w.id !== id));
            if (pathname === `/workspace/${id}`) {
                router.push('/');
            }
        } catch (error) {
            alert('Error al eliminar el espacio de trabajo');
        }
    };

    return (
        <div className={styles.workspaceSelector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tus Espacios 👇</span>
                <button onClick={() => setIsCreating(!isCreating)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--primary)' }}>
                    +
                </button>
            </div>

            {isCreating && (
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre..."
                        style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button onClick={handleCreate} style={{ padding: '4px 8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                </div>
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {workspaces.length === 0 ? (
                    <li>Sin espacios</li>
                ) : (
                    workspaces.map((ws) => {
                        const isActive = pathname === `/workspace/${ws.id}`;
                        const isEditing = editingWsId === ws.id;

                        if (isEditing) {
                            return (
                                <li key={ws.id} className={styles.editingItem} style={{ display: 'flex', gap: '5px', padding: '0.5rem 0' }}>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(e)}
                                        style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                                    <button onClick={() => setEditingWsId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                </li>
                            );
                        }

                        return (
                            <li key={ws.id} className={`${isActive ? styles.activeWs : ''} ${styles.wsListItem}`}>
                                <Link href={`/workspace/${ws.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textDecoration: 'none', color: 'inherit' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                                    <div className={styles.wsActions}>
                                        <button onClick={(e) => handleStartEdit(ws, e)} title="Renombrar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                                        <button onClick={(e) => handleDelete(ws.id, e)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                                    </div>
                                </Link>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
}
