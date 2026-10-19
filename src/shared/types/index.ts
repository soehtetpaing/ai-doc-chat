export interface User {
    id: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export type DocumentStatus = 'processing' | 'ready' | 'failed';

export interface Document {
    id: string;
    filename: string;
    file_size: number;
    page_count: number;
    status: DocumentStatus;
    created_at: string;
}

export interface Source {
    id: string;
    chunkIndex: number;
    similarity: number;
    content: string;
    filename: string;
    score?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
    streaming?: boolean;
    error?: boolean;
    created_at?: string;
}
