import type { Source } from "../../shared/types";
import { useAuthStore } from "../auth/auth.store";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const baseURL = import.meta.env.VITE_API_URL || '';

export interface StreamChatParams {
    documentId: string;
    question: string;
    conversationId?: string;
    onToken: (token: string) => void;
    onDone: (payload: { conversationId: string; sources: Source[] }) => void;
    onError: (message: string) => void;
    signal?: AbortSignal;
}

export async function streamChat(params: StreamChatParams): Promise<void> {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    let done = false;

    await fetchEventSource(`${baseURL}/api/v1/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            documentId: params.documentId,
            question: params.question,
            conversationId: params.conversationId
        }),
        signal: params.signal,
        openWhenHidden: true,

        async onopen(res) {
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}: ${text}`);
            }
        },

        onmessage(evt) {
            if (!evt.data) return;
            try {
                const data = JSON.parse(evt.data);

                if (evt.event === 'token') {
                    params.onToken(data.token);
                } else if (evt.event === 'done') {
                    done = true;
                    params.onDone(data);
                } else if (evt.event === 'error') {
                    params.onError(data.message);
                }
            } catch (error) {
                /* ignore malformed */
            }
        },

        onerror(err) {
            params.onError(err?.message ?? 'Stream chat failed');
            throw err; // stop retries
        },

        onclose() {
            if (!done) params.onError('Stream chat closed unexpectedly');
        },
    });
}
