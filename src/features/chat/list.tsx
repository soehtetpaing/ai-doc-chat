import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../core/api/api";
import { cn, formatDate } from "../../shared/libs/utils";
import { Button } from "../../shared/components/common/button";
import { MessageSquare, Trash2 } from "lucide-react";

interface Props {
    documentId: string;
    activeId: string | null;
    onSelect: (id: string) => void;
}

export function ConversationList({ documentId, activeId, onSelect }: Props) {
    const qc = useQueryClient();
    const { data: all = [], isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: api.getConversations,
        refetchOnWindowFocus: true
    });

    const convs = (all as any[]).filter((c) => c.document_id === documentId);

    const del = useMutation({
        mutationFn: (id: string) => api.removeConversation(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] })
    });

    if (isLoading) return <p className="text-sm text-muted-foreground p-2">Loading…</p>;

    if (!convs.length) return <p className="text-xs text-muted-foreground px-2 py-3">No conversations yet.</p>;

    return (
        <ul className="space-y-1">
            {convs.map((c: any) => (
                <li
                    key={c.id}
                    className={cn(
                        'group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm',
                        activeId === c.id ? 'bg-accent' : 'hover:bg-accent/50'
                    )}
                    onClick={() => onSelect(c.id)}
                >
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                            {c.title ?? 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {c.message_count} msg · {formatDate(c.created_at)}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7"
                        onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete conversation?')) del.mutate(c.id);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </li>
            ))}
        </ul>
    );
}
