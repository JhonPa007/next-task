import type { Metadata } from "next";
import SidebarLayout from "@/components/layout/SidebarLayout";
import FloatingChatbot from "@/components/ai/FloatingChatbot";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import { getWorkspaces } from '@/app/actions/workspace';
import "./globals.css";

export const metadata: Metadata = {
    title: "NextTask - Gestión de Proyectos",
    description: "Plataforma integral de gestión de proyectos y workspaces.",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let workspaces: any[] = [];
    try {
        workspaces = await getWorkspaces();
    } catch (e) {
        console.warn("DB not connected yet, skipping workspace fetch in layout");
    }

    return (
        <html lang="es" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeProvider>
                    <AuthProvider>
                        <SidebarLayout initialWorkspaces={workspaces}>
                            {children}
                        </SidebarLayout>
                        <FloatingChatbot />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
