"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText, ChevronRight, AlertCircle, FileSignature, ArrowRight, MessageSquare, ShoppingBag, PhoneCall, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
    const { currentUser, charges, patients } = useAppContext();

    if (!currentUser) return null;

    // Get full patient object to check forms status
    const currentPatientData = patients.find(p => p.id === currentUser.id);
    const hasPendingForms = currentPatientData?.formsStatus === "PENDING";
    const userDetails = patients.find(p => p.id === currentUser.id);
    const userCharges = charges.filter(c => c.patientId === currentUser.id);
    const pendingBalance = userCharges.reduce((acc, curr) => curr.status === "PENDING" ? acc + curr.amount : acc, 0);

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <header className="mb-10 border-b border-border/50 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif mb-2">Welcome, {currentUser.name}</h1>
                <p className="text-muted-foreground">Your personalized wellness dashboard.</p>
            </header>

            {hasPendingForms && (
                <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-red-400">
                        <AlertCircle className="w-8 h-8 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg text-red-400">Required Action: Intake Forms Pending</h3>
                            <p className="text-sm opacity-90">You must complete your secure medical and consent forms before scheduling treatments.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/intake">
                        <Button className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-medium flex items-center gap-2">
                            <FileSignature className="w-4 h-4" />
                            Complete Forms Now
                        </Button>
                    </Link>
                </div>
            )}

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Balance Card */}
                <Card className={`border ${pendingBalance > 0 ? 'border-primary/50 bg-[#1A1A1A]' : 'border-border/50 bg-card'} relative overflow-hidden backdrop-blur-sm`}>
                    {pendingBalance > 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Balance Due
                                {pendingBalance > 0 && <AlertCircle className="w-4 h-4 text-primary" />}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif">${pendingBalance.toFixed(2)}</h3>
                            {pendingBalance > 0 && <p className="text-sm text-muted-foreground mt-1">Pending action required</p>}
                        </div>
                        {pendingBalance > 0 ? (
                            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-12">
                                <Link href="/dashboard/pay">
                                    PAY NOW <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        ) : (
                            <Badge variant="outline" className="border-border text-muted-foreground bg-white/5 w-fit px-4 py-1">
                                <CheckCircle2 className="w-3 h-3 mr-2" /> All clear
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Active Treatment Card */}
                <Card className="border border-border/50 bg-card backdrop-blur-sm">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <span className="text-sm font-medium text-muted-foreground">Active Program</span>
                        <div>
                            <h3 className="text-xl font-medium leading-tight mb-2">{userDetails?.activeTreatment || "None"}</h3>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>Phase Progress</span>
                                <span>50%</span>
                            </div>
                            <Progress value={50} className="h-1.5 [&>div]:bg-primary" />
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment Card */}
                <Card className="border border-border/50 bg-card backdrop-blur-sm">
                    <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <span className="text-sm font-medium text-muted-foreground">Next Assessment</span>
                        <div>
                            <h3 className="text-xl font-medium mb-1">March 15, 2026</h3>
                            <p className="text-sm text-muted-foreground">with Dr. Kitchens (Video)</p>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-border hover:bg-white/5 h-12 text-sm font-medium">
                            Manage Booking
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Feed / Protocol List */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Your Current Meds
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: "Testosterone Cypionate", dose: "140mg / week (Injected)", status: "Active" },
                                { name: "Anastrozole", dose: "0.5mg / twice a week", status: "Active" }
                            ].map((med, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white/5 hover:border-primary/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{med.name}</p>
                                        <p className="text-sm text-muted-foreground">{med.dose}</p>
                                    </div>
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">{med.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {userCharges.filter(c => c.status === "PAID").slice(0, 3).map((charge, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Payment Received for {charge.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{charge.date} • ${charge.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                            {userCharges.filter(c => c.status === "PAID").length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="space-y-6">
                    <Card className="border border-border/50 bg-card">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-serif mb-4 text-muted-foreground uppercase tracking-widest">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground border border-border/50 transition-colors gap-3">
                                    <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                                    <span className="text-xs font-medium text-center">Message<br />Clinic</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground border border-border/50 transition-colors gap-3">
                                    <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                                    <span className="text-xs font-medium text-center">Shop<br />Supplements</span>
                                </button>
                                <button className="col-span-2 flex items-center justify-center p-4 rounded-xl bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-border/50 transition-colors gap-3 group">
                                    <PhoneCall className="w-5 h-5 text-muted-foreground group-hover:text-destructive" strokeWidth={1.5} />
                                    <span className="text-sm font-medium">Urgent Medical Line</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
