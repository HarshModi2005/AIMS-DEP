"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverBorderGradient } from "@/components/ui/aceternity/hover-border-gradient";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch {
            setError("Failed to sign in with Google");
            setIsLoading(false);
        }
    };

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
            } else {
                // Check role and redirect
                const res = await fetch("/api/auth/session");
                const session = await res.json();

                if (session?.user?.role === "FACULTY_ADVISOR") {
                    router.push("/advisor");
                } else if (session?.user?.role === "FACULTY") {
                    router.push("/faculty");
                } else if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
                router.refresh();
            }
        } catch {
            setError("An error occurred during sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
            <BackgroundBeams className="absolute inset-0" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        AIMS
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Academic Information Management System
                    </p>
                </div>

                {/* Terms Notice */}
                <p className="text-center text-sm text-amber-500 mb-6">
                    By proceeding with the login you agree to the{" "}
                    <a href="/terms" className="underline hover:text-amber-400">
                        terms of use
                    </a>{" "}
                    of this service.
                </p>

                <div className="grid gap-6">
                    {/* Google OAuth Card */}
                    <Card className="border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Login with IIT Ropar Google ID</CardTitle>
                            <CardDescription>
                                Use your official IIT Ropar Google account to sign in
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-zinc-400 space-y-2 mb-6">
                                <li>• JavaScript is not blocked by your browser</li>
                                <li>• Popups are not blocked by your browser</li>
                                <li>• You are not logged into multiple Google accounts</li>
                            </ul>

                            <HoverBorderGradient
                                containerClassName="w-full"
                                className="w-full bg-zinc-900 hover:bg-zinc-800"
                                onClick={handleGoogleSignIn}
                                as="button"
                            >
                                <div className="flex items-center justify-center gap-3 w-full py-1">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Sign in with Google</span>
                                </div>
                            </HoverBorderGradient>
                        </CardContent>
                    </Card>

                    {/* Credentials Card */}
                    <Card className="border-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Login with AIMS credentials</CardTitle>
                            <CardDescription>
                                Use your AIMS account email and password
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showCredentials ? (
                                <Button
                                    variant="outline"
                                    className="w-full border-indigo-500/50 hover:bg-indigo-500/10"
                                    onClick={() => setShowCredentials(true)}
                                >
                                    Login with Email
                                </Button>
                            ) : (
                                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@iitrpr.ac.in"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({ ...formData, password: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-500 text-center">{error}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>

                                    <div className="text-center">
                                        <a
                                            href="/reset-password"
                                            className="text-sm text-indigo-400 hover:text-indigo-300"
                                        >
                                            Forgot password? Reset here
                                        </a>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* User Guide Link */}
                <div className="text-center mt-8">
                    <a href="/help" className="text-indigo-400 hover:text-indigo-300">
                        User Guide
                    </a>
                    <p className="text-zinc-500 text-sm mt-2">
                        Contact us at: aims_help @ iitrpr . ac . in
                    </p>
                </div>
            </div>
        </div>
    );
}
