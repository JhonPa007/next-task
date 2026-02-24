import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/app/actions/notifications';

// Se llamará diariamente desde un Cron Service externo o un endpoint manual
export async function GET(request: Request) {
    try {
        // Obtenemos la fecha de hoy y mañana, dando un rango muy amplio (desde ayer hasta mañana)
        // Esto previene que los desfases horarios (Timezones) escondan tareas.
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();

        // Buscar desde ayer a primera hora
        const past = new Date(y, m, d - 1, 0, 0, 0, 0);
        // Inicio de hoy para cálculos locales
        const today = new Date(y, m, d, 0, 0, 0, 0);
        // Hasta mañana a última hora
        const tomorrow = new Date(y, m, d + 1, 23, 59, 59, 999);

        // Buscar Tareas que vencen hoy o mañana y que no estén hechas
        const upcomingTasks = await prisma.task.findMany({
            where: {
                status: { not: 'DONE' },
                dueDate: {
                    gte: past,
                    lte: tomorrow
                }
            },
            include: {
                assignees: {
                    include: { user: true }
                }
            }
        });

        let notificationsSent = 0;

        // Iterar sobre las tareas y enviar push al assignee
        for (const task of upcomingTasks) {
            if (!task.dueDate) continue;

            for (const assignee of task.assignees) {
                // Formateo simple de fecha
                const isToday = task.dueDate <= new Date(today.getTime() + 86400000);
                const timeText = isToday ? 'hoy' : 'mañana';

                const title = `🚨 Tarea por vencer ${timeText}`;
                const body = `"${task.title}" debe entregarse pronto.`;

                // Enviar la notificación
                const result = await sendNotificationToUser(assignee.userId, title, body, `/my-tasks`);
                if (result.success && result.count) {
                    notificationsSent += result.count;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cron ejecutado. ${notificationsSent} notificaciones Push enviadas.`,
            tasksScaned: upcomingTasks.length
        });

    } catch (error: any) {
        console.error('Error en cron de recordatorios:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
