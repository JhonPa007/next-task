import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createGoal, createKeyResult, getGoalsByWorkspace } from '@/app/actions/goals';
import { saveChatMessage } from '@/app/actions/chat';

// Inicialización segura para evitar errores en "next build" (Railway) si no hay variable
const initGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set. AI features disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};
const ai = initGenAI();

export async function POST(request: Request) {
    try {
        const { messages, context, sessionId } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        let systemInstruction = "Eres un asistente virtual de NextTask, la plataforma de Gestión de Proyectos empresariales. Eres experto, profesional, y tu objetivo es ayudar al usuario a clarificar sus ideas, redactar objetivos OKR y organizar su trabajo diario.\n\nPuedes crear Objetivos (Goals) y Resultados Clave (Key Results) directamente usando las herramientas (tools) disponibles si el usuario te lo solicita explícitamente.";

        let workspaceId = null;

        if (context && context.workspaceId) {
            workspaceId = context.workspaceId;
            systemInstruction += `\nActualmente el usuario está trabajando en el Workspace: "${context.workspaceName}" (ID: ${workspaceId}).`;

            // Fetch existing goals to provide context for KRs
            const existingGoals = await getGoalsByWorkspace(workspaceId);
            if (existingGoals && existingGoals.length > 0) {
                systemInstruction += `\n\nLos Objetivos actuales en este workspace son:\n`;
                existingGoals.forEach((g: { id: string, title: string, type: string }) => {
                    systemInstruction += `- ID: ${g.id} | Título: ${g.title} | Tipo: ${g.type}\n`;
                });
                systemInstruction += `Usa estos IDs exactos si el usuario quiere añadir un Key Result a un objetivo existente.`;
            } else {
                systemInstruction += `\n\nActualmente no hay Objetivos en este workspace.`;
            }
        }

        // Recuperar el texto enviado por el usuario (es el último del array enviado desde el frontend para context)
        const lastUserMessage = messages[messages.length - 1]?.parts?.[0]?.text;

        // Guardar el mensaje del usuario en BD si hay una sesión activa
        if (sessionId && lastUserMessage) {
            await saveChatMessage(sessionId, 'user', lastUserMessage);
        }

        if (!ai) {
            return NextResponse.json({ reply: '🤖 Lo siento, la Inteligencia Artificial está desactivada temporalmente. Por favor, configura tu API Key de Gemini en las variables de entorno para usarla.' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: messages,
            config: {
                systemInstruction,
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: "createGoal",
                                description: "Crea un nuevo Objetivo (Goal) en el workspace actual.",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: {
                                            type: Type.STRING,
                                            description: "El título o nombre del objetivo (ej. 'Aumentar ventas en Q3')",
                                        },
                                        type: {
                                            type: Type.STRING,
                                            description: "El tipo de objetivo. Puede ser 'QUALITATIVE', 'QUANTITATIVE' o 'HABIT'",
                                        },
                                    },
                                    required: ["title"],
                                },
                            },
                            {
                                name: "createKeyResult",
                                description: "Crea un nuevo Resultado Clave (Key Result / SMART metric) asociado a un Objetivo (Goal) existente.",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        goalId: {
                                            type: Type.STRING,
                                            description: "El ID exacto del Objetivo al que pertenece este Key Result. Debe ser un ID de los listados en tus instrucciones.",
                                        },
                                        title: {
                                            type: Type.STRING,
                                            description: "El título de la métrica (ej. 'Conseguir 500 leads')",
                                        },
                                        targetValue: {
                                            type: Type.NUMBER,
                                            description: "El valor numérico meta a alcanzar (ej. 500). Sin comas ni separadores de miles.",
                                        },
                                        unit: {
                                            type: Type.STRING,
                                            description: "Opcional. La unidad de medida (ej. '%', 'leads', 'USD', 'usuarios').",
                                        }
                                    },
                                    required: ["goalId", "title", "targetValue"],
                                },
                            }
                        ]
                    }
                ]
            }
        });

        // Check if Gemini decided to call a function
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const args = call.args;

            if (!args) {
                return NextResponse.json({ reply: 'Hubo un error al interpretar los argumentos de la IA.' });
            }

            try {
                if (call.name === 'createGoal') {
                    if (!workspaceId) {
                        return NextResponse.json({ reply: 'Necesitas estar dentro de un Workspace para crear un objetivo. Por favor ve a un Workspace primero.' });
                    }
                    await createGoal({
                        workspaceId,
                        title: args.title as string,
                        type: (args.type as 'QUALITATIVE' | 'QUANTITATIVE' | 'HABIT') || 'QUALITATIVE'
                    });

                    const replyText = `¡Listo! He creado el objetivo "${args.title}" exitosamente.`;
                    if (sessionId) await saveChatMessage(sessionId, 'model', replyText);

                    return NextResponse.json({
                        reply: replyText,
                        refreshRequired: true
                    });

                } else if (call.name === 'createKeyResult') {
                    await createKeyResult({
                        goalId: args.goalId as string,
                        title: args.title as string,
                        targetValue: args.targetValue as number,
                        unit: args.unit as string | undefined
                    });

                    const replyText = `¡Claro! Añadí el resultado clave "${args.title}" con meta ${args.targetValue} ${args.unit || ''} al objetivo solicitado.`;
                    if (sessionId) await saveChatMessage(sessionId, 'model', replyText);

                    return NextResponse.json({
                        reply: replyText,
                        refreshRequired: true
                    });
                }
            } catch (actionError) {
                console.error("Error executing server action inside chat:", actionError);
                return NextResponse.json({ reply: "Lo siento, intenté crear la meta pero ocurrió un error en el servidor." });
            }
        }

        // Normal text response
        if (response.text && sessionId) {
            await saveChatMessage(sessionId, 'model', response.text);
        }

        return NextResponse.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json({ error: 'Hubo un error procesando tu solicitud a Gemini.' }, { status: 500 });
    }
}
