"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { DollarSign, Search, CreditCard, Mail, CheckCircle2, Receipt, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { getPaymentPreview } from "@/lib/payment-nomenclature";

export default function BillingInvoicesPage() {
    const { patients, charges, addCharge, authorizeTreatment } = useAppContext();

    const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        const patient = patients.find(p => p.id === selectedPatientId);

        if (patient?.approvalStatus === "PENDING_APPROVAL") {
            authorizeTreatment(selectedPatientId, parseFloat(amount), description);
            toast.success("Treatment Authorized", {
                description: `A secure payment link has been emailed to ${patient.name} for ${description}.`,
                icon: <Mail className="w-4 h-4 text-primary" />
            });
        } else {
            addCharge({
                patientId: selectedPatientId,
                amount: parseFloat(amount),
                description: description,
            });
            toast.success("Charge Assigned", {
                description: `Invoice added to ${patient?.name}'s portal.`
            });
        }

        setAmount("");
        setDescription("");
    };

    const getPatientPendingBalance = (patientId: string) => {
        return charges
            .filter(c => c.patientId === patientId && c.status === "PENDING")
            .reduce((sum, c) => sum + c.amount, 0);
    };

    const pendingCharges = charges.filter(c => c.status === "PENDING");
    const paidCharges = charges.filter(c => c.status === "PAID");

    const filteredPending = pendingCharges.filter(c => {
        const p = patients.find(pat => pat.id === c.patientId);
        return p?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-[#B8977E]" />
                    Billing & Invoices
                </h1>
                <p className="text-white/50">Manage patient balances, issue new charges, and track revenue.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Create Invoice Panel */}
                <Card className="bg-[#0C1420] border-border/50 col-span-1 shadow-2xl h-fit">
                    <CardHeader className="border-b border-border/50 pb-6">
                        <CardTitle className="text-xl font-serif text-white flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-[#B8977E]" />
                            Issue New Invoice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleAddCharge} className="space-y-6 text-white">
                            <div className="space-y-2">
                                <Label htmlFor="patient" className="text-white/60">Select Patient Account</Label>
                                <select
                                    id="patient"
                                    className="w-full bg-[#080D15] border border-border/50 rounded-md h-11 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={selectedPatientId}
                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                >
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {p.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="service" className="text-white/60">Line Item Description</Label>
                                <Input
                                    id="service"
                                    placeholder="e.g. Monthly Protocol Refill"
                                    className="bg-[#080D15] border-border/50 placeholder:text-white/30"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Nomenclature Preview */}
                            {description.length > 2 && (
                                <div className="bg-[#8FA677]/10 border border-[#8FA677]/20 rounded-xl p-3 space-y-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-[#8FA677]" />
                                        <span className="text-[10px] font-semibold text-[#8FA677] uppercase tracking-wider">Payment Processor Shield</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <p className="text-white/40 text-[10px] mb-0.5 flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> Patient sees</p>
                                            <p className="text-white/80 font-medium">{description}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-[10px] mb-0.5 flex items-center gap-1"><EyeOff className="w-2.5 h-2.5" /> Stripe sees</p>
                                            <p className="text-[#8FA677] font-medium font-mono text-[11px]">{getPaymentPreview(description).stripeLabel}</p>
                                        </div>
                                    </div>
                                    <p className="text-white/20 text-[9px]">Bank statement: MEDFIT WELLNESS</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-white/60">Amount to Charge ($)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="bg-[#080D15] border-border/50 pl-8 font-serif text-lg"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Separator className="bg-border/50 my-6" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-white">Send Payment Link</Label>
                                    <p className="text-xs text-white/50">Alerts patient via email & SMS</p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-[#B8977E]" />
                            </div>

                            <Button type="submit" className="w-full h-12 bg-[#B8977E] hover:bg-[#B8977E]/90 text-black font-semibold mt-4">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Process Invoice to Account
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right Side: Ledger */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Outstanding Balances */}
                    <Card className="bg-[#0C1420] border-border/50 shadow-xl">
                        <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-serif text-white">Outstanding Balances</CardTitle>
                            <div className="relative w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <Input
                                    placeholder="Search active invoices..."
                                    className="bg-[#080D15] border-border/50 h-9 pl-9 text-xs text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredPending.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-white/40 text-sm">No outstanding balances found.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-white/5">
                                        <TableRow className="border-border/50 hover:bg-transparent">
                                            <TableHead className="text-white/50 text-xs pl-6">Patient</TableHead>
                                            <TableHead className="text-white/50 text-xs">Description</TableHead>
                                            <TableHead className="text-white/50 text-xs">Date</TableHead>
                                            <TableHead className="text-white/50 text-xs text-right pr-6">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPending.map(charge => {
                                            const p = patients.find(pat => pat.id === charge.patientId);
                                            return (
                                                <TableRow key={charge.id} className="border-border/50 hover:bg-white/5">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="font-medium text-white text-sm">{p?.name || 'Unknown'}</div>
                                                    </TableCell>
                                                    <TableCell className="text-white/70 text-sm py-4">{charge.description}</TableCell>
                                                    <TableCell className="text-white/50 text-xs py-4">{charge.date}</TableCell>
                                                    <TableCell className="text-right pr-6 py-4">
                                                        <span className="text-[#E8A838] font-serif font-medium">${charge.amount.toFixed(2)}</span>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recently Paid */}
                    <Card className="bg-[#0C1420] border-border/50 shadow-xl">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="text-lg font-serif text-white">Recent Payments Collected</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                            {paidCharges.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-white/40 text-sm">No recent payments.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableBody>
                                        {paidCharges.map(charge => {
                                            const p = patients.find(pat => pat.id === charge.patientId);
                                            return (
                                                <TableRow key={charge.id} className="border-border/50 hover:bg-white/5">
                                                    <TableCell className="pl-6 py-3 w-10">
                                                        <CheckCircle2 className="w-4 h-4 text-[#8FA677]" />
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="font-medium text-white text-sm">{p?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-white/50">{charge.description}</div>
                                                    </TableCell>
                                                    <TableCell className="text-white/50 text-xs py-3">{charge.date}</TableCell>
                                                    <TableCell className="text-right pr-6 py-3">
                                                        <span className="text-[#8FA677] font-serif font-medium">+${charge.amount.toFixed(2)}</span>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                    {/* ─── Subscription Plans ─────────────────────────────── */}
                    <div className="col-span-2">
                        <Card className="bg-[#0C1420] border-border/50">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg font-serif">Recurring Subscription Plans</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-primary border-primary/30 text-xs">Stripe Billing</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { name: "Medical Weight Loss", price: 299, desc: "Monthly Semaglutide/Tirzepatide protocol" },
                                        { name: "TRT Protocol", price: 199, desc: "Monthly testosterone optimization" },
                                        { name: "Peptide Protocol", price: 349, desc: "Monthly peptide therapy management" },
                                        { name: "Full Optimization", price: 599, desc: "All-inclusive longevity protocol" },
                                    ].map((plan, i) => (
                                        <div key={i} className="rounded-xl border border-border/50 bg-white/[0.02] p-4 space-y-3 hover:border-primary/30 transition-colors">
                                            <h4 className="font-serif text-sm text-white">{plan.name}</h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-serif text-primary">${plan.price}</span>
                                                <span className="text-xs text-white/40">/month</span>
                                            </div>
                                            <p className="text-xs text-white/40 leading-relaxed">{plan.desc}</p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full rounded-lg text-xs border-primary/30 text-primary hover:bg-primary/10"
                                                onClick={async () => {
                                                    const patient = patients.find(p => p.id === selectedPatientId);
                                                    if (!patient) {
                                                        toast.error("Select a patient first.");
                                                        return;
                                                    }
                                                    toast.loading(`Creating ${plan.name} subscription...`, { id: "sub" });
                                                    try {
                                                        const res = await fetch("/api/create-subscription", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                patientEmail: patient.email,
                                                                patientName: patient.name,
                                                                priceAmount: plan.price,
                                                                planName: plan.name,
                                                                patientId: patient.id,
                                                            }),
                                                        });
                                                        const data = await res.json();
                                                        if (data.error) throw new Error(data.error);
                                                        toast.success(`${plan.name} subscription created!`, {
                                                            id: "sub",
                                                            description: `Subscription ID: ${data.subscriptionId?.slice(0, 20)}...`
                                                        });
                                                    } catch (err: any) {
                                                        toast.error(err.message || "Failed to create subscription", { id: "sub" });
                                                    }
                                                }}
                                            >
                                                <ArrowRight className="w-3 h-3 mr-1" />
                                                Enroll Patient
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-white/30 text-center">
                                    Subscriptions are processed securely via Stripe Billing. Patients will be charged automatically each month.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
