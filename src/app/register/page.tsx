'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/app/actions/user';
import { signIn } from 'next-auth/react';
import styles from '../login/auth.module.css'; // Reusamos los estilos de login

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Registrar usuario en la base de datos a través del Server Action
            const result = await registerUser(email, password, name);

            if (!result.success) {
                setError(result.message);
                setIsLoading(false);
                return;
            }

            // 2. Autologuear al usuario si el registro fue exitoso
            const signInRes = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (signInRes?.error) {
                setError('Cuenta creada, pero hubo un error ingresando. Intenta iniciar sesión manualmente.');
                setIsLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }

        } catch (err: any) {
            setError('Error de conectividad. Intenta de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>NextTask</h1>
                <p className={styles.subtitle}>Crea tu cuenta de colaborador para empezar.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="name">Nombre Completo</label>
                        <input
                            id="name"
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@empresa.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">Contraseña Segura</label>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className={styles.footer}>
                    ¿Ya tienes una cuenta? <Link href="/login" className={styles.link}>Inicia Sesión aquí</Link>
                </div>
            </div>
        </main>
    );
}
