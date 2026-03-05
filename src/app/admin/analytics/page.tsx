"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
import { TrendingUp, Users, DollarSign, Activity, Infinity, RefreshCcw, TrendingDown } from "lucide-react";

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

const COLORS = ['#a10c22', '#a10c22', '#a10c22', '#4A5D4E'];

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

export default function AnalyticsPage() {

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-[#a10c22]" />
                    Financial Analytics
                </h1>
                <p className="text-white/50">SaaS Metrics Overview: MRR, LTV, and Retention Data for Investors.</p>
            </div>

            {/* SaaS KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-[#a10c22]/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Monthly Recurring Rev (MRR)</p>
                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                <RefreshCcw className="w-5 h-5 text-[#a10c22]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif text-white">$124,500</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="text-[#a10c22] font-medium">+12.4%</span>
                                <span className="text-white/40">vs last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-[#a10c22]/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Annual Run Rate (ARR)</p>
                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-[#a10c22]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif text-white">$1.49M</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="text-[#a10c22] font-medium">On Track</span>
                                <span className="text-white/40">for FY2026</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-[#a10c22]/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Lifetime Value (LTV)</p>
                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                <Infinity className="w-5 h-5 text-[#a10c22]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif text-white">$4,850</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="text-[#a10c22] font-medium">+5.2%</span>
                                <span className="text-white/40">Avg 14mo retention</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-red-500/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Gross Churn Rate</p>
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-serif text-white">1.1%</h3>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="text-[#a10c22] font-medium">-0.3%</span>
                                <span className="text-white/40">industry avg is 4%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MRR Growth Pipeline Area Chart */}
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">MRR Growth Pipeline</CardTitle>
                        <CardDescription className="text-white/40">Monthly Recurring Revenue path to $1.5M ARR</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a10c22" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#a10c22" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#a10c22" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Subscriptions Bar Chart */}
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Active Subscriptions</CardTitle>
                        <CardDescription className="text-white/40">Total recurring patients per month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="patients" fill="#a10c22" radius={[4, 4, 0, 0]} maxBarSize={40} />
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
