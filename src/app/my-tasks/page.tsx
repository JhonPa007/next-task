import React from 'react';
import Header from '@/components/layout/Header';
import TaskManager from '@/components/board/TaskManager';
import { getCurrentUser } from '@/app/actions/user';
import { getPersonalTasks, createPersonalTask, updatePersonalTask, deletePersonalTask } from '@/app/actions/tasks';
import { getUserRoutines } from '@/app/actions/routines';
import { redirect } from 'next/navigation';
import RoutinesManager from '@/components/routines/RoutinesManager';

export default async function MyTasksPage() {
    // 1. Obtener identidad actual
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        // Fallback en caso de que la BD o la creación del usuario Mock de error crítico
        return <div style={{ padding: '2rem' }}>Error de Autenticación. Por favor revisa la base de datos.</div>;
    }

    // 2. Fetch de datos personales y alarmas
    const personalTasks = await getPersonalTasks(currentUser.id);
    const routinesRes = await getUserRoutines();

    // Fallback empty array if routines fetch fails
    const routines = routinesRes.success && routinesRes.data ? routinesRes.data : [];

    // 3. Crear el array de `members` que el TaskManager necesita para el select de "Responsable"
    // En la vista personal, solo tú existes en este contexto cerrado a menos que queramos invitar a otros
    const singleMemberArray = [currentUser];

    // 4. Wrappers de las server actions inyectando el userId
    const handleCreateTask = async (title: string, priority: string) => {
        'use server';
        return await createPersonalTask(currentUser.id, { title, priority });
    };

    const handleUpdateTask = async (taskId: string, data: any) => {
        'use server';
        return await updatePersonalTask(taskId, data);
    };

    const handleDeleteTask = async (taskId: string) => {
        'use server';
        return await deletePersonalTask(taskId);
    };

    return (
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--background)' }}>
            <Header title="Mis Tareas" />

            <div style={{ padding: '2rem', flex: 1 }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Bienvenido, <strong>{currentUser.name || currentUser.email}</strong>. Estas son tus responsabilidades globales, incluyendo tareas vinculadas a proyectos y tareas sueltas.
                </p>
                <RoutinesManager initialRoutines={routines as any} />

                <TaskManager
                    initialTasks={personalTasks}
                    members={singleMemberArray}
                    customCreateTask={handleCreateTask}
                    customUpdateTask={handleUpdateTask}
                    customDeleteTask={handleDeleteTask}
                />
            </div>
        </main>
    );
}
