import { prisma } from '@/lib/prisma';
import Header from '@/components/layout/Header';
import GoalList from '@/components/goals/GoalList';
import { getGoalsByWorkspace } from '@/app/actions/goals';
import { getTasksByWorkspace } from '@/app/actions/tasks';
import { getWorkspaceMembers } from '@/app/actions/workspace';
import { getWorkspaceKudos } from '@/app/actions/kudos';
import TaskManager from '@/components/board/TaskManager';
import KudosWidget from '@/components/kudos/KudosWidget';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const workspace = await prisma.workspace.findUnique({
        where: { id },
    });

    if (!workspace) {
        return <div style={{ padding: '2rem' }}>Espacio no encontrado...</div>;
    }

    const goals = await getGoalsByWorkspace(id);
    const tasks = await getTasksByWorkspace(id);
    const members = await getWorkspaceMembers(id);

    const kudosRes = await getWorkspaceKudos(id);
    const kudos = kudosRes.success && kudosRes.data ? kudosRes.data : [];

    return (
        <main style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--background)' }}>
            <Header title={`Espacio: ${workspace.name}`} />

            <div style={{ padding: '1rem' }}>
                <GoalList workspaceId={workspace.id} initialGoals={goals} />
            </div>

            <div style={{ padding: '0 1rem' }}>
                <KudosWidget
                    workspaceId={workspace.id}
                    initialKudos={kudos as any}
                    members={members}
                />
            </div>

            <div style={{ padding: '0 1rem 1rem 1rem', flex: 1 }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)', fontSize: '1.2rem' }}>Gestión de Tareas</h2>
                <TaskManager initialTasks={tasks} workspaceId={workspace.id} members={members} />
            </div>
        </main>
    );
}
