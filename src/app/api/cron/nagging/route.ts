import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/app/actions/notifications';

// Este endpoint debería ser invocado periódicamente (ej: cada 15 min)
export async function GET(request: Request) {
    try {
        const now = new Date();

        // 1. Buscar rutinas que no están completas y cuya hora de siguiente aviso (nextPingAt) ya pasó
        const dueRoutines = await prisma.routine.findMany({
            where: {
                isCompleted: false,
                nextPingAt: {
                    lte: now
                }
            }
        });

        let notificationsSent = 0;

        // 2. Iterar las rutinas vencidas
        for (const routine of dueRoutines) {

            // a) Disparar Alarma Push
            const title = `⚠️ R E C O R D A T O R I O`;
            const body = `"${routine.title}" requiere evidencia para marcarse completada.`;
            const result = await sendNotificationToUser(routine.userId, title, body, `/my-tasks`);

            if (result.success && result.count) {
                notificationsSent += result.count;
            }

            // b) "Patear" la alarma hacia el futuro sumando intervalMinutes
            const nextTime = new Date(now.getTime() + (routine.intervalMinutes * 60000));

            await prisma.routine.update({
                where: { id: routine.id },
                data: { nextPingAt: nextTime }
            });
        }

        return NextResponse.json({
            success: true,
            message: `Nagging Cron ejecutado. ${notificationsSent} notificaciones Push enviadas.`,
            routinesTriggered: dueRoutines.length
        });

    } catch (error: any) {
        console.error('Error en cron de nagging:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
