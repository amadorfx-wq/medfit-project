"use client";

import { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Shield, UserPlus, Search, Edit2, Trash2, Mail, AlertTriangle,
    FileText, Upload, X, Download, Phone, MapPin, BadgeCheck, StickyNote,
    Eye, Lock, ChevronLeft
} from "lucide-react";
import { useAppContext, Role, Staff, StaffDocument } from "@/lib/store";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type StaffFormData = {
    name: string;
    email: string;
    password: string;
    role: Role;
    department: string;
    phone: string;
    address: string;
    licenseNumber: string;
    notes: string;
};

const INITIAL_FORM: StaffFormData = {
    name: "", email: "", password: "", role: "RECEPTION",
    department: "", phone: "", address: "", licenseNumber: "", notes: ""
};

export default function StaffManagementPage() {
    const { staff, addStaff, updateStaff, deleteStaff, uploadStaffDocument, deleteStaffDocument } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Modal & View States ────────────────────────────────────────────────────
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [expedientOpen, setExpedientOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // ─── Form ───────────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState<StaffFormData>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const filteredStaff = useMemo(() => staff.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [staff, searchTerm]);

    const getRoleBadgeColor = (role: Role) => {
        switch (role) {
            case "SUPERADMIN": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "ADMIN": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
            case "DOCTOR": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "RECEPTION": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Unknown";
        const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ─── Open Expedient (Profile) View ─────────────────────────────────────────
    const handleOpenExpedient = (member: Staff) => {
        setSelectedStaff(member);
        setEditMode(false);
        setExpedientOpen(true);
        setFormData({
            name: member.name, email: member.email, password: "",
            role: member.role, department: member.department,
            phone: member.phone || "", address: member.address || "",
            licenseNumber: member.licenseNumber || "", notes: member.notes || ""
        });
    };

    // ─── Save Edit ──────────────────────────────────────────────────────────────
    const handleSaveEdit = async () => {
        if (!selectedStaff) return;
        setIsSubmitting(true);
        await updateStaff(selectedStaff.id, {
            name: formData.name, email: formData.email, role: formData.role,
            department: formData.department, phone: formData.phone,
            address: formData.address, licenseNumber: formData.licenseNumber,
            notes: formData.notes,
        });
        setSelectedStaff(prev => prev ? { ...prev, ...formData } : prev);
        setIsSubmitting(false);
        setEditMode(false);
    };

    // ─── Add Staff ──────────────────────────────────────────────────────────────
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await addStaff({
            name: formData.name, email: formData.email, role: formData.role,
            department: formData.department, phone: formData.phone,
            address: formData.address, licenseNumber: formData.licenseNumber,
            notes: formData.notes,
            password: formData.password || undefined,
        });
        setIsSubmitting(false);
        setIsAddOpen(false);
        setFormData(INITIAL_FORM);
    };

    // ─── Delete Staff ───────────────────────────────────────────────────────────
    const handleDeleteSubmit = async () => {
        if (!selectedStaff) return;
        setIsSubmitting(true);
        await deleteStaff(selectedStaff.id);
        setIsSubmitting(false);
        setIsDeleteOpen(false);
        setExpedientOpen(false);
        setSelectedStaff(null);
    };

    // ─── File Upload ────────────────────────────────────────────────────────────
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedStaff || !e.target.files?.[0]) return;
        setIsUploading(true);
        await uploadStaffDocument(selectedStaff.id, e.target.files[0]);
        // Refresh local selectedStaff docs
        const updated = staff.find(s => s.id === selectedStaff.id);
        if (updated) setSelectedStaff(updated);
        setIsUploading(false);
        e.target.value = "";
    };

    const handleDeleteDoc = async (docName: string) => {
        if (!selectedStaff) return;
        await deleteStaffDocument(selectedStaff.id, docName);
        const updated = staff.find(s => s.id === selectedStaff.id);
        if (updated) setSelectedStaff(updated);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const currentDocs = selectedStaff ? (staff.find(s => s.id === selectedStaff.id)?.documents || []) : [];

    // ─── Reusable Form Fields Component ────────────────────────────────────────
    const FormField = ({ label, name, type = "text", placeholder = "" }: { label: string; name: keyof StaffFormData; type?: string; placeholder?: string }) => (
        <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-white/50">{label}</Label>
            <Input
                type={type}
                name={name}
                value={formData[name] ?? ""}
                onChange={handleFormChange}
                placeholder={placeholder}
                disabled={!editMode && expedientOpen}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#8FA677]/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-[#8FA677]" />
                        Staff & Roles
                    </h1>
                    <p className="text-white/50">Manage clinical team access, RBAC permissions, and staff expedients.</p>
                </div>
                <Button onClick={() => { setFormData(INITIAL_FORM); setIsAddOpen(true); }} className="bg-[#8FA677] hover:bg-[#A3B88A] text-[#0C1420] font-medium gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Staff Member
                </Button>
            </div>

            {/* ── Staff Table ── */}
            <div className="bg-[#0C1420] border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#111A27]/50">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                            placeholder="Search staff by name, email, or role..."
                            className="bg-[#0C1420] border-white/10 text-white pl-9 h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-[#8FA677]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border/50">
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">Name & Email</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">System Role</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">Department</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest">Last Active</th>
                                <th className="p-4 text-xs font-semibold text-white/60 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredStaff.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-white/40">No staff members found.</td></tr>
                            ) : (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => handleOpenExpedient(member)}>
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{member.name}</span>
                                                <span className="text-xs text-white/50 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />{member.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${getRoleBadgeColor(member.role)}`}>
                                                {member.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-sm text-white/70">{member.department}</td>
                                        <td className="p-4 align-middle text-sm text-white/50">{formatDate(member.lastActive)}</td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white" onClick={(e) => { e.stopPropagation(); handleOpenExpedient(member); }}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10" onClick={(e) => { e.stopPropagation(); setSelectedStaff(member); setIsDeleteOpen(true); }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════
                EXPEDIENT MODAL — Full Staff Profile
            ════════════════════════════════════════════════════════════════════ */}
            <Dialog open={expedientOpen} onOpenChange={setExpedientOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#8FA677]/20 flex items-center justify-center text-xl font-serif text-[#8FA677]">
                                    {selectedStaff?.name.charAt(0)}
                                </div>
                                <div>
                                    <DialogTitle className="font-serif text-xl text-white">{selectedStaff?.name}</DialogTitle>
                                    <DialogDescription className="text-white/50 mt-0.5">{selectedStaff?.email}</DialogDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${getRoleBadgeColor(selectedStaff?.role ?? null)}`}>
                                    {selectedStaff?.role}
                                </Badge>
                                {!editMode ? (
                                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10 h-8" onClick={() => setEditMode(true)}>
                                        <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="border-white/10 text-white h-8" onClick={() => setEditMode(false)}>Cancel</Button>
                                        <Button size="sm" className="bg-[#8FA677] text-black hover:bg-[#A3B88A] h-8" onClick={handleSaveEdit} disabled={isSubmitting}>
                                            {isSubmitting ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="profile" className="mt-4">
                        <TabsList className="bg-[#111A27] border border-white/10 p-1 mb-6">
                            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                                <BadgeCheck className="w-3.5 h-3.5 mr-1.5" /> Profile
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
                                <FileText className="w-3.5 h-3.5 mr-1.5" /> Documents ({currentDocs.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* ── TAB 1: Profile ── */}
                        <TabsContent value="profile" className="space-y-5 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Full Name" name="name" placeholder="Dr. Jane Smith" />
                                <FormField label="Email Address" name="email" type="email" placeholder="jane@medfit.com" />
                                <FormField label="Phone Number" name="phone" type="tel" placeholder="+1 (404) 555-0100" />
                                <FormField label="License / Badge #" name="licenseNumber" placeholder="MD-12345 or NP-98765" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Physical Address</Label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                    placeholder="123 Medical Center Dr, Atlanta, GA"
                                    disabled={!editMode}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#8FA677]/50 disabled:opacity-60"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-white/50">Department</Label>
                                    <Input name="department" value={formData.department} onChange={handleFormChange} disabled={!editMode} className="bg-white/5 border-white/10 text-white disabled:opacity-60" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs uppercase tracking-wider text-white/50">System Role</Label>
                                    <select
                                        name="role"
                                        value={String(formData.role ?? "RECEPTION")}
                                        onChange={handleFormChange}
                                        disabled={!editMode}
                                        className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#8FA677]/50"
                                    >
                                        <option value="RECEPTION">Reception</option>
                                        <option value="DOCTOR">Doctor / NP</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="SUPERADMIN">Super Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Internal Notes</Label>
                                <Textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    placeholder="Private memos, onboarding notes, specializations..."
                                    disabled={!editMode}
                                    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/20 disabled:opacity-60 resize-none"
                                />
                            </div>

                            {/* Last Active */}
                            <div className="flex items-center justify-between py-3 border-t border-white/5 text-xs text-white/40">
                                <span>Last Active</span>
                                <span>{formatDate(selectedStaff?.lastActive || "")}</span>
                            </div>
                        </TabsContent>

                        {/* ── TAB 2: Documents ── */}
                        <TabsContent value="documents" className="space-y-4 animate-in fade-in duration-300">
                            {/* Upload Area */}
                            <div
                                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#8FA677]/40 hover:bg-[#8FA677]/5 transition-all cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-white/30 group-hover:text-[#8FA677] mx-auto mb-3 transition-colors" />
                                <p className="text-sm text-white/60 group-hover:text-white/80">Click to upload, or drag & drop</p>
                                <p className="text-xs text-white/30 mt-1">PDF, JPG, PNG, DOCX — up to 10MB</p>
                                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFileUpload} />
                            </div>
                            {isUploading && (
                                <div className="text-center text-sm text-[#8FA677] animate-pulse">Uploading to Supabase Storage...</div>
                            )}

                            {/* Documents List */}
                            {currentDocs.length === 0 ? (
                                <div className="text-center py-8 text-white/30 text-sm">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    No documents uploaded yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentDocs.map((doc: StaffDocument, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group/doc">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-[#8FA677]/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-[#8FA677]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white truncate">{doc.name}</p>
                                                    <p className="text-xs text-white/40">{formatFileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40 hover:text-white">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </a>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400/50 hover:text-red-400" onClick={() => handleDeleteDoc(doc.name)}>
                                                    <X className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* ════ ADD STAFF MODAL ════ */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-[#8FA677]" />
                            Invite Staff Member
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Create a new clinical staff profile. If you set a password, they&apos;ll be able to log in immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Full Name *</Label>
                                <Input name="name" value={formData.name} onChange={handleFormChange} required placeholder="Dr. Jane Smith" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Department *</Label>
                                <Input name="department" value={formData.department} onChange={handleFormChange} required placeholder="Clinical" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Email (Login) *</Label>
                                <Input name="email" type="email" value={formData.email} onChange={handleFormChange} required placeholder="jane@medfit.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">System Role *</Label>
                                <select name="role" value={formData.role ?? ""} onChange={handleFormChange} className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8FA677]/50">
                                    <option value="RECEPTION">Reception</option>
                                    <option value="DOCTOR">Doctor / NP</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPERADMIN">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">Phone</Label>
                                <Input name="phone" type="tel" value={formData.phone} onChange={handleFormChange} placeholder="+1 (404) 555-0100" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase tracking-wider text-white/50">License / Badge #</Label>
                                <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleFormChange} placeholder="MD-12345" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                                <Lock className="w-3 h-3" /> Login Password (Optional)
                            </Label>
                            <Input name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder="Leave blank to create profile without login access" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm" />
                            <p className="text-[10px] text-white/30">If set, a Supabase Auth account will be created. Password is bcrypt-hashed automatically.</p>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-white/50">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-[#8FA677] text-black hover:bg-[#A3B88A]">
                                {isSubmitting ? "Creating..." : "Create Staff Member"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ════ DELETE CONFIRM MODAL ════ */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" /> Revoke Access
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            This will permanently remove <strong className="text-white">{selectedStaff?.name}</strong> and revoke all system access. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="text-white/50">Cancel</Button>
                        <Button onClick={handleDeleteSubmit} disabled={isSubmitting} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                            {isSubmitting ? "Revoking..." : "Revoke Access"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
