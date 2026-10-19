import { useState } from "react";
import { useAuthStore } from "./auth/auth.store";
import type { Document } from "../shared/types";
import { Button } from "../shared/components/common/button";
import { LogOut, MessageSquarePlus } from "lucide-react";
import { Card } from "../shared/components/common/card";
import { UploadDropzone } from "../features/documents/upload-dropzone";
import { DocumentList } from "../features/documents/list";
import { ChatPanel } from "../features/chat/chat-panel";
import { ConversationList } from "../features/chat/list";

export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

    const handleSelectedDoc = (doc: Document) => {
        setSelectedDoc(doc);
        setSelectedConvId(null); // reset conversation on doc change
    }

    return (
        <div className="h-full flex flex-col">
            <header className="border-b border-border bg-background">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <img
                        src="/favicon.ico"
                        alt="AI Doc Chat"
                        className="h-8 w-8 rounded"
                    />
                    <div>
                        <h1 className="text-lg font-semibold">AI Doc Chat</h1>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-4 p-4">
                    {/* Left: upload, documents, conversations */}
                    <aside className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
                        <Card className="p-4">
                            <h2 className="text-sm font-semibold mb-3">Upload PDF</h2>
                            <UploadDropzone />
                        </Card>

                        <Card className="p-4">
                            <h2 className="text-sm font-semibold mb-3">Your documents</h2>
                            <DocumentList
                                selectedId={selectedDoc?.id ?? null}
                                onSelect={handleSelectedDoc}
                            />
                        </Card>

                        {/* Conversation list — only when a doc is selected */}
                        {selectedDoc && (
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">Conversations</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedConvId(null)}
                                title="New chat"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                            </Button>
                            </div>
                            <ConversationList
                                documentId={selectedDoc.id}
                                activeId={selectedConvId}
                                onSelect={setSelectedConvId}
                            />
                        </Card>
                        )}
                    </aside>

                    {/* Right: chat panel */}
                    <section className="col-span-12 md:col-span-8 lg:col-span-9 h-[calc(100vh-6rem)]">
                        <Card className="h-full flex flex-col overflow-hidden">
                        {selectedDoc ? (
                            <ChatPanel
                                key={`${selectedDoc.id}:${selectedConvId ?? 'new'}`}
                                document={selectedDoc}
                                initialConversationId={selectedConvId}
                                onConversationChange={(id) => setSelectedConvId(id)}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                                <p className="text-sm font-medium">No document selected</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                Upload a PDF, wait for it to be ready, then click it to start chatting.
                                </p>
                            </div>
                            </div>
                        )}
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}