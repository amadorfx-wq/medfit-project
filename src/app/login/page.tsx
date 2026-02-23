"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, HeartPulse, UserCircle2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, registerAndLogin } = useAppContext();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const handlePatientLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(email || "sarah@example.com", "PATIENT");
        router.push("/dashboard");
    };

    const handlePatientRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerAndLogin(name || "New Patient", email || "new@example.com");
        router.push("/dashboard/intake");
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login("admin@medfit.com", "ADMIN");
        router.push("/admin");
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Panel: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 bg-[#080808] border-r border-border/50 flex-col justify-between p-16">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-2xl">
                            M
                        </div>
                        <span className="font-serif text-2xl tracking-wide text-foreground">MedFit America</span>
                    </div>
                    <h1 className="text-5xl font-serif leading-tight mb-8">
                        Your <span className="text-primary italic">Health.</span><br />
                        Your <span className="text-primary italic">Protocol.</span><br />
                        Your <span className="text-[#B8977E] italic">Results.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md">
                        The secure portal to manage your personalized wellness journey, track your treatments, and handle your balances effortlessly.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <ShieldCheck className="w-6 h-6 text-[#B8977E]" strokeWidth={1.5} />
                        <span>100% HIPAA-Compliant & Secure</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <HeartPulse className="w-6 h-6 text-[#B8977E]" strokeWidth={1.5} />
                        <span>Medically Supervised Protocols</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <UserCircle2 className="w-6 h-6 text-[#B8977E]" strokeWidth={1.5} />
                        <span>Concierge Patient Experience</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-16 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-10 py-10">

                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                            M
                        </div>
                        <span className="font-serif text-xl tracking-wide text-foreground">MedFit America</span>
                    </div>

                    <div className="text-left space-y-2">
                        <h2 className="text-3xl font-serif">{isAdminLogin ? "Clinical Access" : (isCreatingAccount ? "Begin Your Journey" : "Welcome Back")}</h2>
                        <p className="text-muted-foreground">{isAdminLogin ? "Enter your clinical credentials." : (isCreatingAccount ? "Create your secure patient account." : "Sign in to your secure portal.")}</p>
                    </div>

                    <Tabs
                        defaultValue="patient"
                        className="w-full"
                        onValueChange={(value) => setIsAdminLogin(value === "admin")}
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-full mb-8">
                            <TabsTrigger value="patient" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Patient
                            </TabsTrigger>
                            <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#B8977E]">
                                Clinical Staff
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="patient">
                            {isCreatingAccount ? (
                                <form onSubmit={handlePatientRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-1">
                                        <Label htmlFor="reg-name" className="text-xs uppercase tracking-wider text-muted-foreground">Full Legal Name</Label>
                                        <Input
                                            id="reg-name"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="reg-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="reg-password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full rounded-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-md shadow-[0_0_15px_rgba(143,166,119,0.3)] mt-6">
                                        Create Secure Account
                                    </Button>

                                    <div className="text-center mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingAccount(false)}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Already a patient? <span className="underline">Log in</span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handlePatientLogin} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="sarah@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            defaultValue="password123"
                                            className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg h-12"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="text-sm text-primary hover:underline cursor-pointer">Forgot password?</span>
                                    </div>
                                    <Button type="submit" className="w-full rounded-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-md mt-4">
                                        Sign In To Your Portal
                                    </Button>

                                    <div className="text-center mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingAccount(true)}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            New patient? <span className="underline">Create an account</span>
                                        </button>
                                    </div>

                                    {/* Demo Note */}
                                    <p className="text-xs text-center text-muted-foreground pt-4 opacity-50">
                                        (Demo: Any email logs you into existing test patient).
                                    </p>
                                </form>
                            )}
                        </TabsContent>

                        <TabsContent value="admin">
                            <form onSubmit={handleAdminLogin} className="space-y-6">
                                <div className="space-y-1">
                                    <Label htmlFor="admin-id" className="text-xs uppercase tracking-wider text-muted-foreground">Staff ID / Email</Label>
                                    <Input
                                        id="admin-id"
                                        placeholder="admin@medfit.com"
                                        defaultValue="admin@medfit.com"
                                        className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#B8977E] text-lg h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="admin-pwd" className="text-xs uppercase tracking-wider text-muted-foreground">Master Password</Label>
                                    <Input
                                        id="admin-pwd"
                                        type="password"
                                        placeholder="••••••••"
                                        defaultValue="supersecret"
                                        className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#B8977E] text-lg h-12"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full rounded-full h-14 bg-card border border-border hover:bg-white/5 text-foreground text-md mt-8">
                                    Access Admin Console
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    );
}
