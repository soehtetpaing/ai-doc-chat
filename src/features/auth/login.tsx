import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../core/auth/auth.store";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../core/api/api";
import { Card, CardContent } from "../../shared/components/common/card";
import { Input } from "../../shared/components/common/input";
import { Button } from "../../shared/components/common/button";

export function LoginPage() {
    const nav = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = useMutation({
        mutationFn: () => api.login(email, password),
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
                            <h1 className="text-lg font-semibold">Welcome back</h1>
                            <p className="text-xs text-muted-foreground">Sign in to your account</p>
                        </div>
                    </div>

                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            login.mutate();
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
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {login.error && (
                            <p className="text-sm text-red-600">{(login.error as Error).message}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={login.isPending}>
                            {login.isPending ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        No account?{' '}
                        <Link to="/register" className="text-primary underline">
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
