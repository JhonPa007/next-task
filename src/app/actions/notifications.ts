'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/user';
import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Configurar con las llaves VAPID solo si existen (evita que el build crashee en Railway)
if (publicKey && privateKey) {
    webpush.setVapidDetails(
        'mailto:test@example.com',
        publicKey,
        privateKey
    );
} else {
    console.warn("VAPID keys are not set. Push notifications will be disabled.");
}

/**
 * Guarda o actualiza la suscripción Push del navegador del dispositivo actual de este usuario.
 */
export async function savePushSubscription(subscription: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Usuario no autenticado' };

        // upsert: Si el endpoint ya existe, actualizamos las llaves, si no, lo creamos.
        // Esto previene duplicados si el usuario desuscribe y vuelve a suscribir.
        await prisma.pushSubscription.upsert({
            where: {
                endpoint: subscription.endpoint,
            },
            create: {
                userId: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            update: {
                userId: user.id, // Re-asociar por si acaso
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error saving push subscription:', error);
        return { success: false, error: 'DB Error' };
    }
}

/**
 * Función utilitaria para disparar una notificación a un usuario específico.
 */
export async function sendNotificationToUser(userId: string, title: string, body: string, url: string = '/') {
    try {
        if (!publicKey || !privateKey) {
            console.warn("Cannot send push notification because VAPID keys are not configured.");
            return { success: false, message: 'VAPID keys missing' };
        }

        // Encontrar todas las suscripciones activas del usuario (puede tener PC, iPhone, etc)
        const subs = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subs.length === 0) return { success: false, message: 'No subscriptions found' };

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: '/icons/icon-192x192.png', // Necesitaremos agregar un icono en public/
            badge: '/icons/icon-192x192.png'
        });

        // Enviar a todos sus dispositivos
        const sendPromises = subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            try {
                await webpush.sendNotification(pushConfig, payload);
            } catch (err: any) {
                // Si el dispositivo rechazó la notificación permanentemente (ej: desinstaló PWA o revocó permiso)
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log('Subscription has expired or is no longer valid. Deleting from DB...');
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error('Error sending notification to endpoint:', err);
                }
            }
        });

        await Promise.all(sendPromises);

        return { success: true, count: subs.length };
    } catch (error) {
        console.error('Error in sendNotificationToUser:', error);
        return { success: false, error: 'Push Error' };
    }
}
