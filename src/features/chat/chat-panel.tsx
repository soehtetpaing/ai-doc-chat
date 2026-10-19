import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Document } from "../../shared/types";
import { streamChat } from "../../core/api/sse";
import { MessageBubble } from "./message-bubble";
import { Textarea } from "../../shared/components/common/textarea";
import { Button } from "../../shared/components/common/button";
import { Send, Square } from "lucide-react";
import { api } from "../../core/api/api";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
    document: Document;
    initialConversationId?: string | null;
    onConversationChange?: (id: string) => void;
}

export function ChatPanel({ document, initialConversationId, onConversationChange }: Props) {
    const qc = useQueryClient();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId ?? undefined);

    const abortRef = useRef<AbortController | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // load history when an existing conversation is selected 
    useEffect(() => {
        if (!initialConversationId) {
            setMessages([]);
            setConversationId(undefined);
            return;
        }

        setConversationId(initialConversationId);
        api.getHistory(initialConversationId).then((rows) => {
            setMessages(
                rows.map((r) => ({
                    id: r.id,
                    role: r.role as 'user' | 'assistant',
                    content: r.content,
                    sources: r.sources ?? undefined
                }))
            );
        });
    }, [initialConversationId]);

    // reset conversation when document changes
    useEffect(() => {
        if (!initialConversationId) {
            setMessages([]);
            setConversationId(undefined);
            setInput('');
        }
        abortRef.current?.abort();
    }, [document.id]);

    // auto scroll as messages stream
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    const send = async () => {
        const q = input.trim();
        if (!q || isStreaming) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: q
        }

        const assistantId = crypto.randomUUID();
        const assistantMsg: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            streaming: true
        }

        setMessages((m) => [...m, userMsg, assistantMsg]);
        setInput('');
        setIsStreaming(true);

        const ctrl = new AbortController();
        abortRef.current = ctrl;

        const wasNewConversation = !conversationId;

        try {
            await streamChat({
                documentId: document.id,
                question: q,
                conversationId,
                signal: ctrl.signal,
                onToken: (token) => {
                    setMessages((m) => 
                        m.map((msg) => 
                            msg.id === assistantId 
                                ? { ...msg, content: msg.content + token } 
                                : msg
                        )
                    );
                },
                onDone: ({ conversationId: cid, sources }) => {
                    setMessages((m) => 
                        m.map((msg) => 
                            msg.id === assistantId 
                                ? { ...msg, streaming: false, sources } 
                                : msg
                        )
                    );

                    if (wasNewConversation) {
                        setConversationId(cid);
                        onConversationChange?.(cid);
                        qc.invalidateQueries({ queryKey: ['conversations'] });
                    }
                },
                onError: (err) => {
                    setMessages((m) => 
                        m.map((msg) => 
                            msg.id === assistantId 
                                ? { ...msg, streaming: false, error: true, content: msg.content || `Error: ${err}` } 
                                : msg
                        )
                    )
                }
            });
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                setMessages((m) => 
                    m.map((msg) => 
                        msg.id === assistantId 
                            ? { ...msg, streaming: false, error: true, content: `Error: ${error.message}` } 
                            : msg
                    )
                );
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    };

    const stop = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <h2 className="text-sm font-semibold truncate">{document.filename}</h2>
                <p className="text-xs text-muted-foreground">
                    {document.page_count} pages · chat about this document
                </p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-sm">
                        <p className="text-sm text-muted-foreground">
                            Ask a question about this document to get started.
                        </p>
                        </div>
                    </div>
                )}
                {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                ))}
            </div>

            <div className="p-3 border-t border-border">
                <div className="flex items-end gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                        }}
                        placeholder="Ask a question… (Enter to send, Shift + Enter for newline)"
                        rows={2}
                        disabled={isStreaming}
                    />
                    {isStreaming ? (
                        <Button variant="outline" size="icon" onClick={stop} title="Stop">
                            <Square className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            onClick={send}
                            disabled={!input.trim()}
                            title="Send"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
