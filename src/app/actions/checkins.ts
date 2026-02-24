'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/user';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new weekly 1-on-1 Check-in report for a Task
 */
export async function createCheckIn(taskId: string, accomplishments: string, blockers: string | null, morale: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        if (!accomplishments || accomplishments.trim() === '') {
            return { success: false, error: 'Se requieren ingresar al menos los logros.' };
        }

        const checkIn = await prisma.checkIn.create({
            data: {
                accomplishments,
                blockers,
                morale,
                task: { connect: { id: taskId } },
                user: { connect: { id: user.id } }
            }
        });

        // revalidatePath no es mandatoria aquí si el cliente recarga optimistamente la vista de la tarea, 
        // pero la dejamos sin fallar usando un `findUnique` de la tarea para revalidar su workspace si hace falta.

        return { success: true, data: checkIn };
    } catch (error: any) {
        console.error('Error creating checkin:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves all Check-ins submitted within a given Task
 */
export async function getTaskCheckIns(taskId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const checkIns = await prisma.checkIn.findMany({
            where: { taskId },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 30 // Keep the log reasonably sized
        });

        return { success: true, data: checkIns };
    } catch (error: any) {
        console.error('Error in getWorkspaceCheckIns:', error);
        return { success: false, error: error.message };
    }
}
