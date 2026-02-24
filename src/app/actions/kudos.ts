'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/user';
import { revalidatePath } from 'next/cache';
import { sendNotificationToUser } from '@/app/actions/notifications';

/**
 * Otorgar un Kudo a un integrante del proyecto
 */
export async function createKudo(receiverId: string, workspaceId: string | undefined, message: string) {
    try {
        const sender = await getCurrentUser();
        if (!sender) return { success: false, error: 'Unauthorized' };

        if (!message || message.trim() === '') {
            return { success: false, error: 'El mensaje no puede estar vacío' };
        }

        if (sender.id === receiverId) {
            return { success: false, error: 'No te puedes dar Kudos a ti mismo' };
        }

        const kudo = await prisma.kudo.create({
            data: {
                message,
                points: 10,
                senderId: sender.id,
                receiverId,
                workspaceId
            }
        });

        // 🏆 Notificación Push Animada al Receptor
        const title = `🌟 Kudo Recibido!`;
        const body = `"${sender.name || sender.email}" te ha reconocido: ${message}`;
        const url = workspaceId ? `/workspace/${workspaceId}` : '/my-tasks';

        await sendNotificationToUser(receiverId, title, body, url);

        if (workspaceId) {
            revalidatePath(`/workspace/${workspaceId}`);
        }
        revalidatePath('/'); // Global dashboard

        return { success: true, data: kudo };
    } catch (error: any) {
        console.error('Error creating kudo:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener todos los Kudos otorgados dentro de un Workspace específico
 */
export async function getWorkspaceKudos(workspaceId: string) {
    try {
        const kudos = await prisma.kudo.findMany({
            where: { workspaceId },
            include: {
                sender: { select: { name: true, email: true } },
                receiver: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Mostrar solo los últimos 10 de forma ágil
        });

        return { success: true, data: kudos };
    } catch (error: any) {
        console.error('Error in getWorkspaceKudos:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener los Kudos globales de toda la empresa
 */
export async function getGlobalKudos() {
    try {
        const kudos = await prisma.kudo.findMany({
            include: {
                sender: { select: { name: true, email: true } },
                receiver: { select: { name: true, email: true } },
                workspace: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return { success: true, data: kudos };
    } catch (error: any) {
        console.error('Error in getGlobalKudos:', error);
        return { success: false, error: error.message };
    }
}
