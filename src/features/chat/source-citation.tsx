import { useState } from "react";
import type { Source } from "../../shared/types";
import { ChevronDown, FileSearch } from "lucide-react";
import { cn } from "../../shared/libs/utils";
import { SourceModal } from "./source-modal";

export function SourceCitations({ sources }: { sources: Source[] }) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (!sources.length) return null;

    return (
        <div className="mt-2">
            <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
                <FileSearch className="h-3.5 w-3.5" />
                {sources.length} source{sources.length !== 1 ? 's' : ''}
                <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
            </button>

            {open && (
                <ul className="mt-2 space-y-1 border-l-2 border-border pl-3">
                {sources.map((s, i) => (
                    <li key={s.id}>
                    <button
                        onClick={() => setActiveIndex(i)}
                        className="text-xs text-muted-foreground hover:text-foreground text-left w-full"
                    >
                        <span className="font-medium text-foreground">[Source {i + 1}]</span>{' '}
                        chunk #{s.chunkIndex} · sim {(s.similarity * 100).toFixed(1)}%
                        {s.score !== undefined && (
                        <> · rr {(s.score * 100).toFixed(1)}%</>
                        )}
                        {' · '}
                        <span className="italic">{s.filename}</span>
                    </button>
                    </li>
                ))}
                </ul>
            )}

            {activeIndex !== null && (
                <SourceModal
                    source={sources[activeIndex]}
                    index={activeIndex}
                    onClose={() => setActiveIndex(null)}
                />
            )}
        </div>
    );
}
