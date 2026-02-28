"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Search, Edit2, Trash2, Mail } from "lucide-react";

// Mock data for Staff Members
const MOCK_STAFF = [
    { id: "s1", name: "Dr. James Kitchens", email: "dr.kitchens@medfit.com", role: "SUPERADMIN", department: "Medical", lastActive: "Just now" },
    { id: "s2", name: "Sarah Connor, NP", email: "s.connor@medfit.com", role: "DOCTOR", department: "Clinical", lastActive: "2 hours ago" },
    { id: "s3", name: "Emily Watson", email: "reception@medfit.com", role: "RECEPTION", department: "Front Desk", lastActive: "5 mins ago" },
];

export default function StaffManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [staff] = useState(MOCK_STAFF);

    const filteredStaff = staff.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "SUPERADMIN": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            case "DOCTOR": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "RECEPTION": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-[#8FA677]" />
                        Staff & Roles
                    </h1>
                    <p className="text-white/50">Manage Multi-Tenant access and clinical Role-Based Access Control (RBAC).</p>
                </div>
                <Button className="bg-[#8FA677] hover:bg-[#A3B88A] text-[#0C1420] font-medium gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Staff Member
                </Button>
            </div>

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
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40">
                                        No staff members found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{member.name}</span>
                                                <span className="text-xs text-white/50 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${getRoleBadgeColor(member.role)}`}>
                                                {member.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-sm text-white/70">
                                            {member.department}
                                        </td>
                                        <td className="p-4 align-middle text-sm text-white/50">
                                            {member.lastActive}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/10">
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
        </div>
    );
}
