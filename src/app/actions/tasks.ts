'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTasksByWorkspace(workspaceId: string) {
    try {
        // Obtenemos todas las tareas que están relacionadas a este workspace a través de TaskWorkspace
        const workspaceTasks = await prisma.taskWorkspace.findMany({
            where: { workspaceId },
            include: {
                task: {
                    include: {
                        assignees: {
                            include: { user: true }
                        },
                        subtasks: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            },
            orderBy: { task: { createdAt: 'desc' } }
        });

        // Extraemos solo la entidad 'task' plana para facilitar su uso en el frontend
        return workspaceTasks.map(tw => tw.task);
    } catch (error) {
        console.error('Error fetching tasks by workspace:', error);
        return [];
    }
}

export async function createTask(data: {
    workspaceId: string;
    title: string;
    status?: string;
    priority?: string;
    startDate?: Date | null;
    dueDate?: Date | null;
}) {
    try {
        // En Prisma, creamos la Task y creamos su relación con el Workspace en la tabla pivot (TaskWorkspace) al mismo tiempo.
        const newTask = await prisma.task.create({
            data: {
                title: data.title,
                status: data.status || 'TODO',
                priority: data.priority || 'MEDIUM',
                startDate: data.startDate,
                dueDate: data.dueDate,
                workspaces: {
                    create: {
                        workspaceId: data.workspaceId
                    }
                }
            }
        });

        revalidatePath(`/workspace/${data.workspaceId}`);
        // Volver a buscar la tarea incluyendo posibles joins (assignees)
        const fullTask = await prisma.task.findUnique({
            where: { id: newTask.id },
            include: {
                assignees: { include: { user: true } },
                subtasks: { orderBy: { createdAt: 'asc' } }
            }
        });
        return fullTask;
    } catch (error) {
        console.error('Error creating task:', error);
        throw new Error('No se pudo crear la tarea');
    }
}

export async function updateTask(
    taskId: string,
    workspaceId: string,
    data: {
        title?: string;
        status?: string;
        priority?: string;
        startDate?: Date | null;
        dueDate?: Date | null;
        assigneeId?: string | null;
    }
) {
    try {
        const updateData: any = { ...data };
        const newAssigneeId = updateData.assigneeId;
        delete updateData.assigneeId;
        delete updateData.subtasks; // Eliminar el arr de subtareas si nos lo envían accidentalmente

        // Si se nos envía explicitamente el assigneeId (incluyendo null para borrar)
        if (newAssigneeId !== undefined) {
            // Eliminar asignaciones viejas
            await prisma.taskAssignee.deleteMany({
                where: { taskId }
            });
            // Asignar el nuevo
            if (newAssigneeId !== null) {
                updateData.assignees = {
                    create: { userId: newAssigneeId }
                };
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                assignees: { include: { user: true } },
                subtasks: { orderBy: { createdAt: 'asc' } }
            }
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return updatedTask;
    } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('No se pudo actualizar la tarea');
    }
}

export async function deleteTask(taskId: string, workspaceId: string) {
    try {
        await prisma.task.delete({
            where: { id: taskId }
        });

        revalidatePath(`/workspace/${workspaceId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        throw new Error('No se pudo eliminar la tarea');
    }
}

// --- PERSONAL TASKS ACTIONS ---

export async function getPersonalTasks(userId: string) {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                assignees: {
                    some: { userId: userId }
                }
            },
            include: {
                assignees: { include: { user: true } },
                subtasks: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return tasks;
    } catch (error) {
        console.error('Error fetching personal tasks:', error);
        return [];
    }
}

export async function createPersonalTask(userId: string, data: {
    title: string;
    status?: string;
    priority?: string;
    startDate?: Date | null;
    dueDate?: Date | null;
}) {
    try {
        const newTask = await prisma.task.create({
            data: {
                title: data.title,
                status: data.status || 'TODO',
                priority: data.priority || 'MEDIUM',
                startDate: data.startDate,
                dueDate: data.dueDate,
                assignees: {
                    create: { userId }
                }
            },
            include: {
                assignees: { include: { user: true } },
                subtasks: { orderBy: { createdAt: 'asc' } }
            }
        });

        revalidatePath(`/my-tasks`);
        return newTask;
    } catch (error) {
        console.error('Error creating personal task:', error);
        throw new Error('No se pudo crear la tarea personal');
    }
}

export async function updatePersonalTask(
    taskId: string,
    data: {
        title?: string;
        status?: string;
        priority?: string;
        startDate?: Date | null;
        dueDate?: Date | null;
    }
) {
    try {
        const updateData: any = { ...data };
        delete updateData.subtasks;

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                assignees: { include: { user: true } },
                subtasks: { orderBy: { createdAt: 'asc' } }
            }
        });

        revalidatePath(`/my-tasks`);
        return updatedTask;
    } catch (error) {
        console.error('Error updating personal task:', error);
        throw new Error('No se pudo actualizar la tarea personal');
    }
}

export async function deletePersonalTask(taskId: string) {
    try {
        await prisma.task.delete({
            where: { id: taskId }
        });

        revalidatePath(`/my-tasks`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting personal task:', error);
        throw new Error('No se pudo eliminar la tarea personal');
    }
}
