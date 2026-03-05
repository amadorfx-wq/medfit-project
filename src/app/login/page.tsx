"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { tenant } from "@/lib/theme.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, HeartPulse, UserCircle2, AlertCircle } from "lucide-react";
import { DEV_CREDENTIALS } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const { loginWithCredentials, loginAsDemoPatient } = useAuth();
    const { registerAndLogin, patients } = usePatients();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    // Staff login states
    const [staffEmail, setStaffEmail] = useState(DEV_CREDENTIALS[0].email);
    const [staffPassword, setStaffPassword] = useState("");
    const [staffError, setStaffError] = useState("");
    const [isStaffLoading, setIsStaffLoading] = useState(false);

    const [isRegistering, setIsRegistering] = useState(false);

    const handlePatientLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const targetEmail = email || "sarah@example.com";
        const existingPatient = patients.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());

        if (existingPatient) {
            loginAsDemoPatient(existingPatient.id, existingPatient.name);
        } else {
            loginAsDemoPatient("demo_patient_fallback", targetEmail);
        }
        router.push("/dashboard");
    };

    const handlePatientRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            const res = await registerAndLogin(name || "New Patient", email || "new@example.com");
            if (res?.success) {
                // Hard reload to bypass aggressive Next.js App Router cache on first login
                window.location.href = "/dashboard/intake";
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffError("");
        setIsStaffLoading(true);
        try {
            await loginWithCredentials(staffEmail, staffPassword);
            router.push("/admin");
        } catch (err: any) {
            // Graceful fallback: if Supabase Auth is not configured, use demo mode
            if (err.message?.includes("Invalid login") || err.message?.includes("invalid_credentials")) {
                setStaffError("Invalid email or password. Check your credentials and try again.");
            } else if (err.message?.includes("Email not confirmed") || err.message?.includes("not confirmed")) {
                setStaffError("Email not confirmed. Please contact your administrator.");
            } else {
                // Fallback to demo mode if Supabase Auth is not set up
                const devCred = DEV_CREDENTIALS.find(c => c.email === staffEmail);
                if (devCred && staffPassword === devCred.password) {
                    // Moveremos este bypass demo si es extrictamente necesario.
                    // En el entorno enterprise, los Admins inician por DB puro.
                    setStaffError("Database auth required for Admin. Demo mode deprecated.");
                } else {
                    setStaffError(err.message || "Authentication failed. Please try again.");
                }
            }
        } finally {
            setIsStaffLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Panel: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 bg-[white] border-r border-border/50 flex-col justify-between p-16">
                <div>
                    <Link href="/" className="flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-2xl">
                            {tenant.logoInitial}
                        </div>
                        <span className="font-serif text-2xl tracking-wide text-foreground">{tenant.name}</span>
                    </Link>
                    <h1 className="text-5xl font-serif leading-tight mb-8">
                        Your <span className="text-primary italic">Health.</span><br />
                        Your <span className="text-primary italic">Protocol.</span><br />
                        Your <span className="text-[#a10c22] italic">Results.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md">
                        The secure portal to manage your personalized wellness journey, track your treatments, and handle your balances effortlessly.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <ShieldCheck className="w-6 h-6 text-[#a10c22]" strokeWidth={1.5} />
                        <span>100% HIPAA-Compliant & Secure</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <HeartPulse className="w-6 h-6 text-[#a10c22]" strokeWidth={1.5} />
                        <span>Medically Supervised Protocols</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-foreground">
                        <UserCircle2 className="w-6 h-6 text-[#a10c22]" strokeWidth={1.5} />
                        <span>Concierge Patient Experience</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-16 relative overflow-y-auto">
                <div className="w-full max-w-md space-y-10 py-10">

                    <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                            {tenant.logoInitial}
                        </div>
                        <span className="font-serif text-xl tracking-wide text-foreground">{tenant.name}</span>
                    </Link>

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
                            <TabsTrigger value="admin" className="rounded-full data-[state=active]:bg-[#102A52] data-[state=active]:text-[#a10c22]">
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

                                    <div className="flex items-start gap-3 mt-4">
                                        <input
                                            type="checkbox"
                                            id="agree-terms"
                                            required
                                            className="mt-1 accent-[#a10c22] w-4 h-4 rounded"
                                        />
                                        <label htmlFor="agree-terms" className="text-xs text-muted-foreground leading-relaxed">
                                            I agree to the{" "}
                                            <Link href="/legal/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link>,{" "}
                                            <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>, and{" "}
                                            <Link href="/legal/hipaa-notice" target="_blank" className="text-primary hover:underline">Notice of Privacy Practices</Link>.
                                        </label>
                                    </div>

                                    <Button disabled={isRegistering} type="submit" className="w-full rounded-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-md shadow-[0_0_15px_rgba(184,151,126,0.3)] transition-all duration-300 mt-6 font-medium tracking-wide">
                                        {isRegistering ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                Creating Protocol...
                                            </span>
                                        ) : "Begin Secure Intake"}
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
                                    <Button type="submit" className="w-full rounded-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-md mt-4 shadow-[0_0_15px_rgba(184,151,126,0.3)] transition-all duration-300 font-medium tracking-wide">
                                        Access Secure Portal
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
                                    <Label htmlFor="admin-id" className="text-xs uppercase tracking-wider text-muted-foreground">Staff Email</Label>
                                    <Input
                                        id="admin-id"
                                        type="email"
                                        placeholder="admin@medfit.com"
                                        value={staffEmail}
                                        onChange={(e) => setStaffEmail(e.target.value)}
                                        className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#a10c22] text-lg h-12"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="admin-pwd" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                                    <Input
                                        id="admin-pwd"
                                        type="password"
                                        placeholder="••••••••"
                                        value={staffPassword}
                                        onChange={(e) => setStaffPassword(e.target.value)}
                                        className="border-0 border-b border-border/50 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#a10c22] text-lg h-12"
                                        required
                                    />
                                </div>

                                {/* Error Message */}
                                {staffError && (
                                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{staffError}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isStaffLoading}
                                    className="w-full rounded-full h-14 bg-card border border-[#a10c22]/30 hover:bg-[#a10c22]/10 hover:border-[#a10c22]/60 text-[#a10c22] text-md mt-8 disabled:opacity-60 transition-all duration-300 font-medium tracking-wide"
                                >
                                    {isStaffLoading ? "Authenticating..." : "Access Clinical Console"}
                                </Button>

                                <p className="text-xs text-center text-white/30 pt-2">
                                    Dev credentials: admin@medfit.com / MedFit2026!
                                </p>
                            </form>
                        </TabsContent>
                    </Tabs>


                </div>
            </div>
        </div>
    );
}
