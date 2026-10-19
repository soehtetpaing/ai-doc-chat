import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Document } from "../../shared/types";
import { api } from "../../core/api/api";
import { useEffect } from "react";
import { cn, formatBytes, formatDate } from "../../shared/libs/utils";
import { FileText, Trash2 } from "lucide-react";
import { DocumentStatusBadge } from "./status-badge";
import { Button } from "../../shared/components/common/button";

interface Props {
    selectedId: string | null;
    onSelect: (doc: Document) => void;
}

export function DocumentList({ selectedId, onSelect }: Props) {
    const qc = useQueryClient();
    const { data: docs = [],  isLoading, refetch } = useQuery({
        queryKey: ['documents'],
        queryFn: api.getDocuments,
        refetchInterval: (q) => {
            const anyProcessing = q.state.data?.some((d: any) => d.status === 'processing');
            return anyProcessing ? 2000 : false;
        }
    });

    const del = useMutation({
        mutationFn: (id: string) => api.removeDocument(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });
        }
    });

    useEffect(() => {
        refetch(); // auto refresh on mount
    }, [refetch]);

    if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

    if (!docs.length) return <p className="text-sm text-muted-foreground text-center py-6">No documents yet.</p>;

    return (
        <ul className="space-y-2">
            {docs.map((doc: any) => (
                <li
                    key={doc.id}
                    className={cn(
                        'p-3 rounded-md border transition-colors cursor-pointer group',
                        selectedId === doc.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-accent/50',
                        doc.status !== 'ready' && 'opacity-70'
                    )}
                    onClick={() => doc.status === 'ready' && onSelect(doc)}
                >
                    <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.filename}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <DocumentStatusBadge status={doc.status} />
                                <span className="text-xs text-muted-foreground">
                                    {formatBytes(doc.file_size)}
                                </span>
                                {doc.page_count > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        · {doc.page_count} pages
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(doc.created_at)}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this document?')) del.mutate(doc.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
