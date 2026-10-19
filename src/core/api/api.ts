import { useAuthStore } from "../auth/auth.store";
import type { AuthResponse, ChatMessage } from "../../shared/types";

const baseURL = import.meta.env.VITE_API_URL || '';


export class ApiError extends Error {
    public readonly status: number;
    public readonly body: any;

    constructor(status: number, body: any) {
        super(body?.error?.message ?? `HTTP ${status}`);

        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = useAuthStore.getState().token;
    const headers = new Headers(init.headers);

    if (token) headers.set('Authorization', `Bearer ${token}`);

    if (init.body && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${baseURL}${path}`, { ...init, headers });
    if (res.status === 401) {
        useAuthStore.getState().logout();
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body);
    }

    if (res.status === 204) return undefined as T;

    return res.json();
}

export const api = {
    register: (email: string, password: string) => 
        request<AuthResponse>('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
    
    login: (email: string, password: string) => 
        request<AuthResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    getDocuments: () => request<any[]>('/api/v1/documents'),

    uploadDocument: (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return request<any>('/api/v1/documents', {
            method: 'POST',
            body: fd
        });
    },

    removeDocument: (id: string) => 
        request<void>(`/api/v1/documents/${id}`, {
            method: 'DELETE'
        }),
    
    getConversations: () => request<any[]>('/api/v1/chat/conversations'),

    getHistory: (id: string) => 
        request<ChatMessage[]>(`/api/v1/chat/${id}/history`),

    removeConversation: (id: string) => 
        request<void>(`/api/v1/chat/${id}`, {
            method: 'DELETE'
        }),
}
