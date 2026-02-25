'use client';

import React, { useState, useEffect } from 'react';
import { savePushSubscription } from '@/app/actions/notifications';

export default function PushSubscriber() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            let registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                const sub = await registration.pushManager.getSubscription();
                setSubscription(sub);
            }
        } catch (e) {
            console.error("Error checking sub", e);
        }
    };

    const subscribeToPush = async () => {
        setIsSubscribing(true);
        setMessage('1/5: Verificando permisos...');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setMessage('Error: Permiso denegado por el usuario.');
                setIsSubscribing(false);
                return;
            }

            setMessage('2/5: Obteniendo Service Worker...');
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setMessage('2/5: Registrando Service Worker...');
                await navigator.serviceWorker.register('/sw.js');
            }

            setMessage('3/5: Esperando que el Service Worker esté listo...');
            registration = await navigator.serviceWorker.ready;

            setMessage('4/5: Obteniendo claves VAPID...');

            // Llaves públicas de nuestro .env embebidas por Next.js
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!publicVapidKey) {
                const errMsg = 'Error: NEXT_PUBLIC_VAPID_PUBLIC_KEY no está definida. Si la añadiste a Railway, debes re-desplegar la aplicación.';
                setMessage(errMsg);
                alert(errMsg);
                setIsSubscribing(false);
                return;
            }

            setMessage('5/6: Generando suscripción Push...');
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Parsear para enviar a Prisma
            const subStr = JSON.stringify(sub);
            const subObj = JSON.parse(subStr);

            setMessage('6/6: Guardando en la base de datos...');
            const result = await savePushSubscription(subObj);

            if (result.success) {
                setSubscription(sub);
                setMessage('¡Notificaciones Activadas!');
                alert('¡Suscripción exitosa!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(`Error en BD: ${result.error}`);
                alert(`Error guardando en BD: ${result.error}`);
            }

        } catch (error: any) {
            console.error('Error in subscribeToPush:', error);
            setMessage(`Denegado / Error: ${error.message}`);
            alert(`Error al suscribir: ${error.message}`);
        }
        setIsSubscribing(false);
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
