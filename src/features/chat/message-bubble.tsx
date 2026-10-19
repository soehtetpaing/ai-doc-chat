import { cn } from "../../shared/libs/utils";
import type { ChatMessage } from "../../shared/types";
import { MarkdownMessage } from "./markdown-message";
import { SourceCitations } from "./source-citation";
import { TypingIndicator } from "./typing-indicator";

export function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                'max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap warp-break-words',
                isUser
                    ? 'bg-primary text-primary-foreground'
                    : message.error
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-background border border-border'
                )}
            >
                {message.content ? (
                    isUser ? (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                        <MarkdownMessage content={message.content} />
                    )
                ) : message.streaming ? (
                    <TypingIndicator />
                ) : null}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <SourceCitations sources={message.sources} />
                )}
            </div>
        </div>
    );
}