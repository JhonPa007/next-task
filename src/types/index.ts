export type TaskStatus = 'Listo' | 'En curso' | 'Detenido' | 'Working on it' | 'To do' | 'Stuck' | 'Done';

export interface User {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface Task {
    id: string;
    title: string;
    assignee: User | null;
    status: TaskStatus;
    timeline: { start: string; end: string } | null;
    dueDate: string | null;
    priority: number; // 1-5
    groupId?: string;
    commentsCount?: number;
}

export interface TaskGroup {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
}
