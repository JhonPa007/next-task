'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Obtener metas por workspace
export async function getGoalsByWorkspace(workspaceId: string) {
    try {
        const goals = await prisma.goal.findMany({
            where: { workspaceId },
            include: {
                keyResults: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return goals;
    } catch (error) {
        console.error('Error fetching goals:', error);
        return [];
    }
}

// Crear una nueva Meta (Objetivo)
export async function createGoal(data: {
    workspaceId: string;
    title: string;
    type?: 'QUALITATIVE' | 'QUANTITATIVE' | 'HABIT';
}) {
    try {
        const goal = await prisma.goal.create({
            data: {
                workspaceId: data.workspaceId,
                title: data.title,
                type: data.type || 'QUALITATIVE',
                status: 'ON_TRACK'
            }
        });

        revalidatePath(`/workspace/${data.workspaceId}`);
        return goal;
    } catch (error) {
        console.error('Error creating goal:', error);
        throw new Error('No se pudo crear el objetivo');
    }
}

// Crear un Key Result (SMART)
export async function createKeyResult(data: {
    goalId: string;
    title: string;
    targetValue: number;
    unit?: string;
}) {
    try {
        const kr = await prisma.keyResult.create({
            data: {
                goalId: data.goalId,
                title: data.title,
                targetValue: data.targetValue,
                unit: data.unit,
                currentValue: 0
            }
        });

        revalidatePath('/');
        return kr;
    } catch (error) {
        console.error('Error creating KR:', error);
        throw new Error('No se pudo crear el key result');
    }
}

// Actualizar nombre de una meta
export async function updateGoal(id: string, title: string, workspaceId: string) {
    try {
        const goal = await prisma.goal.update({
            where: { id },
            data: { title }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return goal;
    } catch (error) {
        console.error('Error updating goal:', error);
        throw new Error('No se pudo actualizar el objetivo');
    }
}

// Eliminar un objetivo (Goals en Prisma con onDelete: Cascade eliminará sus KRs automagicamente si en el schema está así, de lo contrario lo forzamos)
export async function deleteGoal(id: string, workspaceId: string) {
    try {
        await prisma.goal.delete({
            where: { id }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return true;
    } catch (error) {
        console.error('Error deleting goal:', error);
        throw new Error('No se pudo eliminar el objetivo');
    }
}

// Actualizar un Key Result
export async function updateKeyResult(id: string, data: {
    title?: string;
    currentValue?: number;
    targetValue?: number;
    unit?: string;
}) {
    try {
        const kr = await prisma.keyResult.update({
            where: { id },
            data
        });
        revalidatePath('/'); // Simplificado, ideal revalidar workspace path si pasamos el id
        return kr;
    } catch (error) {
        console.error('Error updating key result:', error);
        throw new Error('No se pudo actualizar el resultado clave');
    }
}

// Eliminar un Key Result
export async function deleteKeyResult(id: string) {
    try {
        await prisma.keyResult.delete({
            where: { id }
        });
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('Error deleting key result:', error);
        throw new Error('No se pudo eliminar el resultado clave');
    }
}
