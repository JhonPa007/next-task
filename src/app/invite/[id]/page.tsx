import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { joinWorkspace } from "@/app/actions/workspace";
import Link from "next/link";
import styles from "./Invite.module.css";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // 1. Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
        where: { id: id }
    });

    if (!workspace) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.card}>
                    <div className={styles.icon}>❌</div>
                    <h1 className={styles.title}>Enlace Inválido</h1>
                    <p className={styles.desc}>El proyecto al que intentas unirte no existe o el enlace ha caducado.</p>
                </div>
            </div>
        );
    }

    // 2. Check auth
    const session = await getServerSession(authOptions);

    if (session) {
        // Logged in user: Join directly and redirect to workspace
        await joinWorkspace(id);
        redirect(`/workspace/${id}`);
    }

    // 3. Not logged in: Show landing page
    const callbackUrl = encodeURIComponent(`/invite/${id}`);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.icon}>👋</div>
                <h1 className={styles.title}>
                    Te han invitado a <span className={styles.projectName}>{workspace.name}</span>
                </h1>
                <p className={styles.desc}>
                    Para colaborar en este proyecto y gestionar sus tareas de manera inteligente,
                    necesitas iniciar sesión o crear una cuenta gratuita.
                </p>

                <div className={styles.buttonGroup}>
                    <Link href={`/register?callbackUrl=${callbackUrl}`} className={styles.primaryBtn}>
                        Quiero crear mi cuenta
                    </Link>
                    <Link href={`/login?callbackUrl=${callbackUrl}`} className={styles.secondaryBtn}>
                        Ya tengo cuenta, Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
