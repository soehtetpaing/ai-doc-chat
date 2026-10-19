import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { api } from "../../core/api/api";
import { cn, formatBytes } from "../../shared/libs/utils";
import { UploadCloud } from "lucide-react";

export function UploadDropzone() {
    const qc = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = useMutation({
        mutationFn: (file: File) => api.uploadDocument(file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents'] });

            // poll while processing
            setTimeout(() => qc.invalidateQueries({ queryKey: ['documents'] }), 3000);
        },
        onError: (err) => setError((err as Error).message)
    });

    const handleFile = useCallback((file?: File) => {
        setError(null);

        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setError('File exceeds 20 MB limit');
            return;
        }

        upload.mutate(file);
    }, [upload]);

    return (
        <div>
            <div
                className={cn(
                    'rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors cursor-pointer',
                    dragging && 'border-primary bg-accent',
                    upload.isPending && 'opacity-60 pointer-events-none'
                )}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                }}
            >
                <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                    {upload.isPending ? 'Uploading…' : 'Drop a PDF here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max 20 MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {upload.isSuccess && (
                <p className="mt-2 text-sm text-green-700">
                    Uploaded {formatBytes(upload.data.file_size)} — processing in background
                </p>
            )}
        </div>
    );
}
