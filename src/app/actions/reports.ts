'use server';

import { prisma } from '@/lib/prisma';

// 1. Estadísticas Globales de Tareas por Estado (Para el Donut Chart)
export async function getGlobalTaskStats() {
    try {
        const stats = await prisma.task.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        });

        // Formatear para Recharts: [{ name: 'Por Hacer', value: 10 }, ...]
        const formattedData = stats.map(s => {
            let label = s.status;
            switch (s.status) {
                case 'TODO': label = 'Por Hacer'; break;
                case 'IN_PROGRESS': label = 'En Curso'; break;
                case 'DONE': label = 'Listo'; break;
                case 'STUCK': label = 'Detenido'; break;
            }
            return {
                name: label,
                value: s._count._all,
                rawStatus: s.status
            };
        });

        // Asegurar que devolvemos todos los estados incluso si están en cero, para que el gráfico no cambie de colores abruptamente
        const allStatuses = ['Por Hacer', 'En Curso', 'Listo', 'Detenido'];
        const finalData = allStatuses.map(statusName => {
            const found = formattedData.find(f => f.name === statusName);
            return found || { name: statusName, value: 0 };
        });

        return finalData;
    } catch (error) {
        console.error('Error fetching global task stats:', error);
        return [];
    }
}

// 2. Ranking de Carga de Trabajo por Miembro (Para el Bar Chart)
export async function getWorkloadStats() {
    try {
        // Encontramos todos los usuarios que tienen tareas incompletas
        const workload = await prisma.user.findMany({
            include: {
                tasks: {
                    include: {
                        task: true
                    }
                }
            }
        });

        const formattedData = workload.map(user => {
            // Contamos solo tareas activas (TODO, IN_PROGRESS, STUCK)
            const activeTasks = user.tasks.filter((at: any) => at.task.status !== 'DONE').length;
            const completedTasks = user.tasks.filter((at: any) => at.task.status === 'DONE').length;

            return {
                name: user.name || user.email.split('@')[0],
                active: activeTasks,
                completed: completedTasks,
                total: activeTasks + completedTasks
            };
        }).filter(u => u.total > 0) // Excluir usuarios fantasmas sin tareas
            .sort((a, b) => b.active - a.active); // Ordenar por más ocupados primero

        return formattedData;
    } catch (error) {
        console.error('Error fetching workload stats:', error);
        return [];
    }
}

// 3. Progreso General de los OKRs (Para Widget de Salud)
export async function getGoalHealthStats() {
    try {
        const goals = await prisma.goal.findMany({
            include: {
                keyResults: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Mostrar los últimos 10 para no saturar
        });

        const healthData = goals.map(goal => {
            const krs = goal.keyResults || [];
            if (krs.length === 0) {
                return {
                    id: goal.id,
                    title: goal.title,
                    progress: 0,
                    health: 'UNKNOWN',
                    type: goal.type
                };
            }

            let totalProgress = 0;
            krs.forEach(kr => {
                const percent = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
                totalProgress += Math.min(percent, 100); // Caps a 100%
            });
            const avgProgress = Math.round(totalProgress / krs.length);

            // Calcular 'Salud'
            let health = 'ON_TRACK';
            if (avgProgress < 30) health = 'AT_RISK';
            else if (avgProgress < 70) health = 'NEEDS_ATTENTION';

            return {
                id: goal.id,
                title: goal.title,
                progress: avgProgress,
                health: health,
                type: goal.type
            };
        });

        return healthData;
    } catch (error) {
        console.error('Error fetching goal health:', error);
        return [];
    }
}
