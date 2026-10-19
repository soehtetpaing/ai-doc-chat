import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../core/auth/auth.store";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../core/api/api";
import { Card, CardContent } from "../../shared/components/common/card";
import { Input } from "../../shared/components/common/input";
import { Button } from "../../shared/components/common/button";

export function RegisterPage() {
    const nav = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const register = useMutation({
        mutationFn: () => api.register(email, password),
        onSuccess: (data) => {
            setAuth(data.token, data.user);
            nav('/');
        }
    });

    return (
        <div className="min-h-full flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardContent className="py-6">
                    <div className="flex items-center gap-3 pb-8">
                        <img
                            src="/favicon.ico"
                            alt="AI Doc Chat"
                            className="h-10 w-10 rounded"
                        />
                        <div>
                            <h1 className="text-lg font-semibold">Create account</h1>
                            <p className="text-xs text-muted-foreground">Start chatting with your documents</p>
                        </div>
                    </div>
                    
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            register.mutate();
                        }}
                    >
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password (min 8 chars)"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {register.error && (
                            <p className="text-sm text-red-600">{(register.error as Error).message}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={register.isPending}>
                            {register.isPending ? 'Creating…' : 'Create account'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary underline">
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
