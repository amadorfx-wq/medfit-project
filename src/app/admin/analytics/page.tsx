"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

// Mock Data
const revenueData = [
    { month: 'Jan', revenue: 15400, patients: 45 },
    { month: 'Feb', revenue: 18200, patients: 52 },
    { month: 'Mar', revenue: 22500, patients: 68 },
    { month: 'Apr', revenue: 21000, patients: 61 },
    { month: 'May', revenue: 26800, patients: 82 },
    { month: 'Jun', revenue: 32400, patients: 95 },
    { month: 'Jul', revenue: 35000, patients: 110 },
];

const treatmentData = [
    { name: 'Weight Loss (GLP-1)', value: 45 },
    { name: 'TRT Optimization', value: 25 },
    { name: 'Peptide Therapy', value: 15 },
    { name: 'NFC Lab Analysis', value: 15 },
];

const COLORS = ['#8FA677', '#B8977E', '#E8A838', '#4A5D4E'];

export default function AnalyticsPage() {
    // Custom Tooltip for dark mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0C1420] border border-white/10 p-4 rounded-lg shadow-xl">
                    <p className="text-white font-serif mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}: {entry.name === 'revenue' ? '$' : ''}{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-[#B8977E]" />
                    Business Intelligence
                </h1>
                <p className="text-white/50">Real-time clinical analytics, revenue tracking, and patient volume insights.</p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#0C1420] border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/50 uppercase tracking-widest mb-1">MTD Revenue</p>
                                <h3 className="text-4xl font-serif text-white">$35,000</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#8FA677]/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-[#8FA677]" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-[#8FA677] font-medium">+14.2%</span>
                            <span className="text-white/40">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/50 uppercase tracking-widest mb-1">Active Patients</p>
                                <h3 className="text-4xl font-serif text-white">432</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#B8977E]/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#B8977E]" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-[#8FA677] font-medium">+8.5%</span>
                            <span className="text-white/40">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/50 uppercase tracking-widest mb-1">Avg. Patient Value</p>
                                <h3 className="text-4xl font-serif text-white">$810.00</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-[#E8A838]/10 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-[#E8A838]" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-[#8FA677] font-medium">+2.1%</span>
                            <span className="text-white/40">from last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Area Chart */}
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Revenue Growth Pipeline</CardTitle>
                        <CardDescription className="text-white/40">Gross generated revenue over the last 7 months</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8FA677" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8FA677" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#8FA677" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Patient Acquisition Bar Chart */}
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Patient Acquisition</CardTitle>
                        <CardDescription className="text-white/40">Monthly active patient volume</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="patients" fill="#B8977E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Treatment Breakdown */}
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl lg:col-span-2">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Treatment Portfolio Distribution</CardTitle>
                        <CardDescription className="text-white/40">Breakdown of patient demand by clinical protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={treatmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {treatmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-white/70 ml-2 text-sm">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
