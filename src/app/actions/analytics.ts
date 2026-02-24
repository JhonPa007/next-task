'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/user';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type OKRHealth = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

export interface HealthInsight {
    type: 'WARNING' | 'DANGER' | 'INFO' | 'SUCCESS';
    message: string;
}

export interface HealthReport {
    health: OKRHealth;
    score: number; // 0 a 100
    aiSummary?: string; // Análisis escrito por Gemini
    insights: HealthInsight[];
    metrics: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        stuckTasks: number;
        criticalTasks: number;
        recentCheckIns: number;
        negativeMoraleCount: number;
        blockerCount: number;
    }
}

/**
 * Calculates the Predictive Health of an entire Goal (OKR)
 * based on its Key Results, Projects, Tasks, and Check-ins.
 */
export async function calculateGoalHealth(goalId: string): Promise<{ success: boolean; data?: HealthReport; error?: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        // 1. Fetch the Goal with ALL nested relations needed for analysis
        const goal = await prisma.goal.findUnique({
            where: { id: goalId },
            include: {
                keyResults: {
                    include: {
                        projects: {
                            include: {
                                tasks: {
                                    include: {
                                        task: {
                                            include: {
                                                checkIns: {
                                                    orderBy: { createdAt: 'desc' },
                                                    take: 3 // Only look at recent check-ins
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!goal) return { success: false, error: 'Goal not found' };

        const insights: HealthInsight[] = [];
        const metrics = {
            totalTasks: 0,
            completedTasks: 0,
            overdueTasks: 0,
            stuckTasks: 0,
            criticalTasks: 0,
            recentCheckIns: 0,
            negativeMoraleCount: 0,
            blockerCount: 0,
        };

        const now = new Date();
        let krProgressAvg = 0;
        let krCount = goal.keyResults.length;

        // 2. Aggregate Data
        goal.keyResults.forEach(kr => {
            const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
            krProgressAvg += progress;

            kr.projects.forEach(projectRel => {
                projectRel.tasks.forEach(taskRel => {
                    const task = taskRel.task;
                    metrics.totalTasks++;

                    if (task.status === 'DONE') {
                        metrics.completedTasks++;
                    } else {
                        if (task.status === 'STUCK') metrics.stuckTasks++;

                        if (task.dueDate && new Date(task.dueDate) < now) {
                            metrics.overdueTasks++;
                            if (task.priority === 'HIGH' || task.priority === 'URGENT') {
                                metrics.criticalTasks++;
                            }
                        }
                    }

                    task.checkIns.forEach(ci => {
                        metrics.recentCheckIns++;
                        if (ci.morale === 'ESTRESADO') metrics.negativeMoraleCount++;
                        if (ci.blockers && ci.blockers.trim() !== '') metrics.blockerCount++;
                    });
                });
            });
        });

        krProgressAvg = krCount > 0 ? krProgressAvg / krCount : 0;

        // 3. Analyze and Generate Insights
        let riskScore = 0; // Higher is worse. 0-100 scale ideally, but we'll cap it.

        // Time-based risk (Overdue tasks)
        if (metrics.overdueTasks > 0) {
            riskScore += Math.min(30, metrics.overdueTasks * 5);
            insights.push({
                type: 'WARNING',
                message: `Hay ${metrics.overdueTasks} tarea(s) vencida(s) afectando este objetivo.`
            });
        }

        // Critical Time-based risk
        if (metrics.criticalTasks > 0) {
            riskScore += Math.min(40, metrics.criticalTasks * 15);
            insights.push({
                type: 'DANGER',
                message: `¡Alerta! ${metrics.criticalTasks} tarea(s) CRÍTICAS están retrasadas.`
            });
        }

        // Execution risk (Stuck tasks)
        if (metrics.stuckTasks > 0) {
            riskScore += Math.min(25, metrics.stuckTasks * 10);
            insights.push({
                type: 'WARNING',
                message: `El equipo ha marcado ${metrics.stuckTasks} tarea(s) como detenidas (STUCK).`
            });
        }

        // Morale and Blocker risk (from recent Check-ins)
        if (metrics.negativeMoraleCount > 0) {
            riskScore += Math.min(20, metrics.negativeMoraleCount * 10);
            insights.push({
                type: 'INFO',
                message: `Se detectó alta tensión. ${metrics.negativeMoraleCount} reporte(s) reciente(s) indican estado de ánimo 'Estresado'.`
            });
        }

        if (metrics.blockerCount > 0) {
            riskScore += Math.min(20, metrics.blockerCount * 5);
            insights.push({
                type: 'WARNING',
                message: `Se han reportado obstáculos explícitos en ${metrics.blockerCount} check-in(s) reciente(s).`
            });
        }

        // Progress risk (Low completion despite having tasks)
        const taskCompletionStatus = metrics.totalTasks > 0 ? (metrics.completedTasks / metrics.totalTasks) * 100 : 0;
        if (metrics.totalTasks > 0 && taskCompletionStatus < 20 && riskScore > 10) {
            insights.push({
                type: 'INFO',
                message: `Progreso de tareas bajo (${Math.round(taskCompletionStatus)}%), considera revisar la viabilidad de las fechas.`
            });
        }

        // Subtly praise if things are going incredibly well
        if (riskScore === 0 && metrics.completedTasks > 0) {
            insights.push({
                type: 'SUCCESS',
                message: `¡Excelente inercia! Las tareas fluyen sin bloqueos y dentro de las fechas límite.`
            });
        }

        // 4. Calculate Final Health Status
        let healthValue: OKRHealth = 'ON_TRACK';
        // Base score starts at 100 and loses points based on risk
        const finalScore = Math.max(0, 100 - riskScore);

        if (finalScore < 50) {
            healthValue = 'OFF_TRACK';
        } else if (finalScore < 80) {
            healthValue = 'AT_RISK';
        }

        // 5. Generar Resumen con IA (Gemini)
        let aiSummary = "";
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const prompt = `
                    Eres un analista ágil de proyectos. Analiza el siguiente reporte métrico de un objetivo (OKR) llamado "${goal.title}" y escribe un párrafo corto (máximo 3 oraciones) con un diagnóstico motivador pero objetivo para el equipo.
                    
                    Métricas actuales:
                    - Salud calculada: ${healthValue} (Score: ${finalScore}/100)
                    - Tareas completadas: ${metrics.completedTasks} de ${metrics.totalTasks}
                    - Tareas vencidas: ${metrics.overdueTasks} (${metrics.criticalTasks} críticas)
                    - Tareas estancadas: ${metrics.stuckTasks}
                    - Check-ins estresados: ${metrics.negativeMoraleCount}
                    - Bloqueos reportados: ${metrics.blockerCount}
                    
                    Las anomalías detectadas por el sistema fueron:
                    ${insights.map(i => '- ' + i.message).join('\n')}
                    
                    Escribe tu análisis directamente, sin saludos ni introducciones genéricas.
                `;

                const result = await model.generateContent(prompt);
                aiSummary = result.response.text();
            } else {
                aiSummary = "No se configuró la llave de IA para generar el resumen descriptivo.";
            }
        } catch (err) {
            console.error("AI Generation failed:", err);
            aiSummary = "El análisis avanzado no está disponible en este momento.";
        }

        return {
            success: true,
            data: {
                health: healthValue,
                score: finalScore,
                aiSummary,
                insights,
                metrics
            }
        };

    } catch (error: any) {
        console.error('Error calculating OKR health:', error);
        return { success: false, error: error.message };
    }
}
