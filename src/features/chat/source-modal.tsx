import { Search, Sparkles, X } from "lucide-react";
import { Button } from "../../shared/components/common/button";
import type { Source } from "../../shared/types";

interface Props {
    source: Source;
    index: number;
    onClose: () => void;
}

export function SourceModal({ source, index, onClose }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-background rounded-lg border border-border shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-4 border-b border-border gap-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">Source {index + 1}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                        {source.filename} · chunk #{source.chunkIndex}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                            title="Cosine similarity from vector search"
                        >
                            <Search className="h-3 w-3" />
                            similarity {(source.similarity * 100).toFixed(1)}%
                        </span>

                        {source.score !== undefined && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                                title="Cross-encoder re-rank score (higher = more relevant)"
                            >
                                <Sparkles className="h-3 w-3" />
                                re-rank {(source.score * 100).toFixed(1)}%
                            </span>
                        )}
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
                    {source.content}
                </div>
            </div>
        </div>
    );
}
