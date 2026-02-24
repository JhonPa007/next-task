'use client';

import React, { useState, useEffect } from 'react';
import { savePushSubscription } from '@/app/actions/notifications';

export default function PushSubscriber() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    };

    const subscribeToPush = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Llaves públicas de nuestro .env embebidas por Next.js
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!publicVapidKey) {
                setMessage('Error: VAPID keys missing');
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Parsear para enviar a Prisma
            const subStr = JSON.stringify(sub);
            const subObj = JSON.parse(subStr);

            const result = await savePushSubscription(subObj);

            if (result.success) {
                setSubscription(sub);
                setMessage('¡Notificaciones Activadas!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error al guardar suscripción en BD');
            }

        } catch (error) {
            console.error('Error in subscribeToPush:', error);
            setMessage('Permiso de notificaciones denegado.');
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
            {subscription ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--status-ready)' }}>
                    ✅ Notificaciones Activadas
                </div>
            ) : (
                <button
                    onClick={subscribeToPush}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                    }}
                >
                    Activar Alertas (Push)
                </button>
            )}
            {message && <div style={{ fontSize: '0.75rem', color: 'gray', marginTop: '0.5rem' }}>{message}</div>}
        </div>
    );
}

// Utility para transformar Base64 VAPID
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
