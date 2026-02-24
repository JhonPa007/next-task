'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSubtask(taskId: string, workspaceId: string, title: string) {
    try {
        const subtask = await prisma.subtask.create({
            data: {
                taskId,
                title,
                isCompleted: false
            }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return subtask;
    } catch (error) {
        console.error('Error creating subtask:', error);
        throw new Error('No se pudo crear la subtarea');
    }
}

export async function toggleSubtaskCompletion(subtaskId: string, workspaceId: string, isCompleted: boolean) {
    try {
        const subtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: { isCompleted }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return subtask;
    } catch (error) {
        console.error('Error toggling subtask:', error);
        throw new Error('No se pudo actualizar la subtarea');
    }
}

export async function updateSubtaskTitle(subtaskId: string, workspaceId: string, title: string) {
    try {
        const subtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: { title }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return subtask;
    } catch (error) {
        console.error('Error updating subtask title:', error);
        throw new Error('No se pudo actualizar el título de la subtarea');
    }
}

export async function deleteSubtask(subtaskId: string, workspaceId: string) {
    try {
        await prisma.subtask.delete({
            where: { id: subtaskId }
        });
        revalidatePath(`/workspace/${workspaceId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting subtask:', error);
        throw new Error('No se pudo eliminar la subtarea');
    }
}
