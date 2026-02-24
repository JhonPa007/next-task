'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Obtiene el usuario real logueado a través de NextAuth
export async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        return user;
    } catch (error) {
        console.error('Error fetching current user session:', error);
        return null;
    }
}

// Función para registrar nuevos usuarios
export async function registerUser(email: string, passwordRaw: string, name?: string) {
    try {
        // Validación básica
        if (!email || !passwordRaw) {
            return { success: false, message: 'El correo y la contraseña son obligatorios.' };
        }

        // Revisar si ya existe
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, message: 'Ya existe una cuenta con este correo.' };
        }

        // Crear hash de la contraseña
        const hashedPassword = await bcrypt.hash(passwordRaw, 10);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                password: hashedPassword
            }
        });

        return { success: true, message: 'Usuario creado exitosamente.' };
    } catch (error: any) {
        console.error('Error registrando usuario:', error);
        return { success: false, message: error.message || 'Error desconocido creando el usuario.' };
    }
}
