"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, CreditCard, DollarSign, Calendar, LogOut, FileText, ChevronRight } from "lucide-react";

export default function AdminDashboardPage() {
    const { currentUser, logout, patients, charges, addCharge } = useAppContext();

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState<string>("p1");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    if (!currentUser) return null;

    // KPIs calculations
    const totalPending = charges.filter(c => c.status === "PENDING").length;
    const revenueAmount = charges.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);

    const handleAddCharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        addCharge({
            patientId: selectedPatientId,
            amount: parseFloat(amount),
            description: description,
        });

        setAmount("");
        setDescription("");
        alert("Charge assigned successfully.");
    };

    const getPatientPendingBalance = (patientId: string) => {
        return charges
            .filter(c => c.patientId === patientId && c.status === "PENDING")
            .reduce((sum, c) => sum + c.amount, 0);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Top Navigation */}
            <header className="h-20 border-b border-border/50 bg-[#0C1420] text-white flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-2xl">
                        M
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-lg tracking-wide">MedFit America</span>
                        <Badge variant="outline" className="w-fit text-[10px] text-[#B8977E] border-[#B8977E]/50 bg-[#B8977E]/10 py-0 tracking-widest mt-0.5 uppercase">
                            Admin Portal
                        </Badge>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search patient records..."
                        className="w-full bg-white/5 border-white/10 text-white pl-9 h-10 rounded-full focus-visible:ring-[#B8977E]/50"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{currentUser.name}</p>
                        <p className="text-xs text-white/50">Clinical Director</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2 px-3 py-2 rounded-lg"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Log Out</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row max-h-[calc(100vh-80px)] overflow-hidden">

                {/* Main Content (Left) */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-serif text-white mb-2">Clinic Overview</h1>
                        <p className="text-white/50">Current operational metrics and active accounts.</p>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <Card className="bg-[#0C1420] border-border/50 text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/60">Total Patients</span>
                                    <Users className="w-4 h-4 text-white/40" />
                                </div>
                                <div className="text-3xl font-serif">{patients.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#0C1420] border-border/50 text-white">
                            <CardContent className="p-5 relative overflow-hidden">
                                {totalPending > 0 && <div className="absolute inset-0 border-l-2 border-[#E8A838]" />}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/60">Pending Invoices</span>
                                    <CreditCard className={`w-4 h-4 ${totalPending > 0 ? 'text-[#E8A838]' : 'text-white/40'}`} />
                                </div>
                                <div className={`text-3xl font-serif ${totalPending > 0 ? 'text-[#E8A838]' : 'text-white'}`}>{totalPending}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#0C1420] border-border/50 text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/60">Revenue (MTD)</span>
                                    <DollarSign className="w-4 h-4 text-primary" />
                                </div>
                                <div className="text-3xl font-serif">${revenueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#0C1420] border-border/50 text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/60">Appointments</span>
                                    <Calendar className="w-4 h-4 text-white/40" />
                                </div>
                                <div className="text-3xl font-serif">4</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Patients Table */}
                    <div className="bg-[#0C1420] border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-border/50 flex justify-between items-center">
                            <h2 className="text-lg font-serif text-white">Patient Accounts</h2>
                            <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white hover:bg-white/5">
                                View All Directory
                            </Button>
                        </div>
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Patient Name</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Active Treatment</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Balance Due</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase">Forms Intake</TableHead>
                                    <TableHead className="text-white/50 text-xs tracking-wider uppercase text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map(patient => {
                                    const balance = getPatientPendingBalance(patient.id);
                                    return (
                                        <TableRow key={patient.id} className="border-border/50 text-white/80 hover:bg-white/5">
                                            <TableCell className="font-medium text-white flex items-center gap-3 py-4">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-serif text-white">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                {patient.name}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm">{patient.activeTreatment}</TableCell>
                                            <TableCell className="py-4">
                                                {balance > 0 ? (
                                                    <Badge variant="outline" className="border-[#E8A838]/50 text-[#E8A838] bg-[#E8A838]/10 font-normal">
                                                        ${balance.toFixed(2)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-white/40 text-sm">Clear</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                </main>

                {/* Right Sidebar: Panel de Acción */}
                <aside className="w-full lg:w-96 bg-[#080D15] border-l border-border/50 p-6 lg:p-10 flex flex-col overflow-y-auto">
                    <h2 className="text-xl font-serif text-white flex items-center gap-2 mb-8">
                        <FileText className="w-5 h-5 text-[#B8977E]" />
                        Add Charge to Patient
                    </h2>

                    <form onSubmit={handleAddCharge} className="space-y-6 flex-1 text-white">
                        <div className="space-y-2">
                            <Label htmlFor="patient" className="text-white/60">Select Patient account</Label>
                            <select
                                id="patient"
                                className="w-full bg-[#0C1420] border border-border/50 rounded-md h-11 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                            >
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="service" className="text-white/60">Service or Item (Description)</Label>
                            <Input
                                id="service"
                                placeholder="e.g. Monthly Lab Panel"
                                className="bg-[#0C1420] border-border/50 placeholder:text-white/30"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-white/60">Amount to Charge ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="bg-[#0C1420] border-border/50 pl-8 font-serif text-lg"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base text-white">Send Notification</Label>
                                <p className="text-xs text-white/50">Alerts patient via email & SMS</p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-[#B8977E]" />
                        </div>

                        <Button type="submit" className="w-full h-12 bg-[#B8977E] hover:bg-[#B8977E]/90 text-black font-semibold mt-4 shadow-[0_4px_14px_rgba(184,151,126,0.3)]">
                            Assign Charge to Account
                        </Button>
                    </form>

                    <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-xs text-primary max-w-sm mx-auto flex gap-2">
                            <Search className="w-4 h-4 shrink-0" />
                            This form securely appends the balance to the patient's portal for frictionless checkouts.
                        </p>
                    </div>
                </aside>

            </div>
        </div>
    );
}
