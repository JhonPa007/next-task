'use server';

import { prisma } from '@/lib/prisma';

export async function getOrCreateChatSession(workspaceId: string | null) {
    try {
        if (!workspaceId) {
            // Un modo global sin workspace. Simplemente creamos una sesión anónima (o podríamos buscar una sin workspaceId)
            const globalSession = await prisma.chatSession.findFirst({
                where: { workspaceId: null }
            });
            if (globalSession) return globalSession;
            return await prisma.chatSession.create({ data: {} });
        }

        // Buscar sesión activa para el workspace
        let session = await prisma.chatSession.findFirst({
            where: { workspaceId }
        });

        // Si no existe, crearla
        if (!session) {
            session = await prisma.chatSession.create({
                data: { workspaceId }
            });
        }

        return session;
    } catch (error) {
        console.error('Error getting/creating chat session:', error);
        throw new Error('No se pudo obtener la sesión de chat');
    }
}

export async function getChatHistory(sessionId: string) {
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { chatSessionId: sessionId },
            orderBy: { createdAt: 'asc' }
        });
        return messages;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}

export async function saveChatMessage(sessionId: string, role: string, text: string) {
    try {
        const message = await prisma.chatMessage.create({
            data: {
                chatSessionId: sessionId,
                role,
                text
            }
        });
        return message;
    } catch (error) {
        console.error('Error saving chat message:', error);
        throw new Error('No se pudo guardar el mensaje');
    }
}

export async function clearChatHistory(sessionId: string) {
    try {
        await prisma.chatMessage.deleteMany({
            where: { chatSessionId: sessionId }
        });
        return true;
    } catch (error) {
        console.error('Error clearing chat history:', error);
        throw new Error('No se pudo limpiar el historial');
    }
}
