'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/user';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new persistent alarm (Routine) for the logged-in user.
 */
export async function createRoutine(title: string, intervalMinutes: number, startTime?: Date) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        // Default: Start nagging immediately if no start time is provided
        const nextPingAt = startTime || new Date();

        const routine = await prisma.routine.create({
            data: {
                title,
                intervalMinutes,
                nextPingAt,
                userId: user.id
            }
        });

        revalidatePath('/my-tasks');
        return { success: true, data: routine };
    } catch (error: any) {
        console.error('Error in createRoutine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all active and completed routines for the logged-in user.
 */
export async function getUserRoutines() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const routines = await prisma.routine.findMany({
            where: {
                userId: user.id
            },
            orderBy: [
                { isCompleted: 'asc' }, // Pending first
                { nextPingAt: 'asc' }   // Soonest first
            ]
        });

        return { success: true, data: routines };
    } catch (error: any) {
        console.error('Error in getUserRoutines:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Resolves a nagging task by providing mandatory evidence.
 */
export async function resolveRoutineWithEvidence(routineId: string, evidence: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        if (!evidence || evidence.trim() === '') {
            return { success: false, error: 'Evidence is mandatory to resolve this routine.' };
        }

        const routine = await prisma.routine.findUnique({ where: { id: routineId } });
        if (!routine) return { success: false, error: 'Routine not found' };

        if (routine.userId !== user.id) return { success: false, error: 'Forbidden' };

        const updated = await prisma.routine.update({
            where: { id: routineId },
            data: {
                isCompleted: true,
                evidence
            }
        });

        revalidatePath('/my-tasks');
        return { success: true, data: updated };
    } catch (error: any) {
        console.error('Error in resolveRoutine:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deletes a routine permanently.
 */
export async function deleteRoutine(routineId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const routine = await prisma.routine.findUnique({ where: { id: routineId } });
        if (!routine) return { success: false, error: 'Routine not found' };
        if (routine.userId !== user.id) return { success: false, error: 'Forbidden' };

        await prisma.routine.delete({ where: { id: routineId } });

        revalidatePath('/my-tasks');
        return { success: true };
    } catch (error: any) {
        console.error('Error in deleteRoutine:', error);
        return { success: false, error: error.message };
    }
}
