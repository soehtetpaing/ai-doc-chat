import { cn } from "../../shared/libs/utils";
import type { DocumentStatus } from "../../shared/types";

const styles: Record<DocumentStatus, string> = {
    processing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                styles[status]
            )}
        >
            {status === 'processing' && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            )}
            {status}
        </span>
    );
}
