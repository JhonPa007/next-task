'use client';

import React, { useState, useEffect } from 'react';
import styles from './FloatingChatbot.module.css';

// Using pathname to infer context if applicable
import { usePathname, useRouter } from 'next/navigation';
import { getOrCreateChatSession, getChatHistory, clearChatHistory } from '@/app/actions/chat';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Determine workspaceId based on current url
    const workspaceId = pathname && pathname.includes('/workspace/') ? pathname.split('/').pop() || null : null;

    useEffect(() => {
        let isMounted = true;
        const loadHistory = async () => {
            try {
                const session = await getOrCreateChatSession(workspaceId);
                if (!isMounted) return;
                setSessionId(session.id);

                const history = await getChatHistory(session.id);
                if (!isMounted) return;

                if (history && history.length > 0) {
                    setMessages(history.map((msg: any) => ({ role: msg.role as 'user' | 'model', text: msg.text })));
                } else {
                    // Start with basic greeting
                    setMessages([{ role: 'model', text: '¡Hola! Soy tu asistente de NextTask impulsado por Gemini. ¿En qué puedo ayudarte a organizar tu día?' }]);
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
                if (isMounted) {
                    setMessages([{ role: 'model', text: '¡Hola! Soy tu asistente de NextTask impulsado por Gemini. ¿En qué puedo ayudarte a organizar tu día?' }]);
                }
            }
        };

        loadHistory();

        return () => {
            isMounted = false;
        };
    }, [workspaceId]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Determine context from URL roughly
            let context: any = null;
            if (workspaceId) {
                context = { workspaceId, workspaceName: "Workspace Actual" };
            }

            // Usamos el historial completo para enviar a la API
            const chatHistory = newMessages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory, context, sessionId })
            });

            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
                if (data.refreshRequired) {
                    router.refresh(); // Refresh the page to show new data
                }
            } else {
                setMessages(prev => [...prev, { role: 'model', text: "Lo siento, tuve un problema al procesar eso." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Error de conexión temporal." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        if (!sessionId) return;
        setIsLoading(true);
        try {
            await clearChatHistory(sessionId);
            setMessages([{ role: 'model', text: '¡Hola! He limpiado nuestra conversación. ¿En qué puedo ayudarte a organizar tu día?' }]);
        } catch (e) {
            console.error("No se pudo limpiar el chat", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.chatbotWrapper}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <span style={{ fontWeight: 600 }}>✨ Gemini AI</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleClear} title="Limpiar Conversación" className={styles.iconBtn}>
                                🗑️
                            </button>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                    </div>

                    <div className={styles.messagesArea}>
                        {messages.map((msg, i) => (
                            <div key={i} className={msg.role === 'model' ? styles.msgAi : styles.msgUser}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className={styles.msgAi}>Pensando...</div>}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            placeholder="Pregúntale a Gemini..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            className={styles.input}
                        />
                        <button onClick={handleSend} disabled={isLoading} className={styles.sendBtn}>
                            {isLoading ? '...' : '➤'}
                        </button>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button className={styles.fabBtn} onClick={() => setIsOpen(true)}>
                    ✨ Asistente IA
                </button>
            )}
        </div>
    );
}
