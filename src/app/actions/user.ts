'use server';

import { prisma } from '@/lib/prisma';

// Mock Auth: Returns the first user in the database or creates one if none exists.
export async function getCurrentUser() {
    try {
        let user = await prisma.user.findFirst();

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'admin@nexttask.com',
                    name: 'Admin User'
                }
            });
        }

        return user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null; // En caso de fallo crítico de base de datos
    }
}
