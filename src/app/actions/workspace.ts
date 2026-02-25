'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch all workspaces for the Sidebar
export async function getWorkspaces() {
    try {
        const workspaces = await prisma.workspace.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return workspaces;
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return [];
    }
}

// Create a new Workspace
export async function createWorkspace(name: string) {
    try {
        const ws = await prisma.workspace.create({
            data: {
                name,
                // Mocking a user connection since there is no Auth yet
                // members: { create: { userId: 'mock-user-id', role: 'ADMIN' } }
            }
        });

        revalidatePath('/');
        return ws;
    } catch (error) {
        console.error('Error creating workspace:', error);
        throw new Error('Could not create workspace');
    }
}

// Update Workspace Name
export async function updateWorkspace(id: string, name: string) {
    try {
        const ws = await prisma.workspace.update({
            where: { id },
            data: { name }
        });
        revalidatePath('/');
        return ws;
    } catch (error) {
        console.error('Error updating workspace:', error);
        throw new Error('Could not update workspace');
    }
}

// Delete Workspace
export async function deleteWorkspace(id: string) {
    try {
        await prisma.workspace.delete({
            where: { id }
        });
        revalidatePath('/');
        return true;
    } catch (error) {
        console.error('Error deleting workspace:', error);
        throw new Error('Could not delete workspace');
    }
}

// Get Workspace Members
export async function getWorkspaceMembers(workspaceId: string) {
    try {
        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: { user: true }
        });

        const { getCurrentUser } = await import('@/app/actions/user');
        const currentUser = await getCurrentUser();

        let users = members.map(m => m.user);

        // Include current user implicitly so they can assign themselves.
        if (currentUser && !users.find(u => u.id === currentUser.id)) {
            users.push(currentUser);
        }

        return users;
    } catch (error) {
        console.error('Error fetching workspace members:', error);
        return [];
    }
}

// Join Workspace (via Invite Link)
export async function joinWorkspace(workspaceId: string) {
    try {
        const { getCurrentUser } = await import('@/app/actions/user');
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return { error: 'No autorizado' };
        }

        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: currentUser.id,
                    workspaceId: workspaceId
                }
            }
        });

        if (!existingMember) {
            await prisma.workspaceMember.create({
                data: {
                    userId: currentUser.id,
                    workspaceId,
                    role: 'MEMBER'
                }
            });
            revalidatePath(`/workspace/${workspaceId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error joining workspace:', error);
        return { error: 'Error al unirse al proyecto' };
    }
}

// Invite User to Workspace
export async function inviteUserToWorkspace(workspaceId: string, email: string) {
    try {
        const lowerEmail = email.toLowerCase().trim();
        if (!lowerEmail) {
            return { error: 'El email no puede estar vacío.' };
        }

        // 1. Buscar si el usuario existe
        let user = await prisma.user.findUnique({
            where: { email: lowerEmail }
        });

        // 2. Si no existe, lo creamos on-the-fly (ghost user base)
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: lowerEmail,
                    name: lowerEmail.split('@')[0], // Nombre genérico basado en el email
                }
            });
        }

        // 3. Verificar si ya es miembro de este workspace
        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId: workspaceId
                }
            }
        });

        if (existingMember) {
            return { error: 'Este usuario ya es miembro del Workspace.' };
        }

        // 4. Añadir como miembro
        await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role: 'MEMBER'
            }
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: true, message: `Usuario ${lowerEmail} añadido correctamente.` };

    } catch (error) {
        console.error('Error in inviteUserToWorkspace:', error);
        return { error: 'Hubo un error inesperado al invitar al usuario.' };
    }
}

