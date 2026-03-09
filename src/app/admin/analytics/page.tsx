"use client";

import { useEffect, useState } from "react";
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
import { TrendingUp, Users, DollarSign, Activity, RefreshCcw } from "lucide-react";

const COLORS = ['#a10c22', '#c41e3a', '#8b0000', '#6b0000', '#4A5D4E', '#2d3a2d'];

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

const KpiSkeleton = () => (
    <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
);

interface AnalyticsSummary {
    mrr: number;
    arr: number;
    totalPatients: number;
    revenueData: { month: string; revenue: number; patients: number }[];
    treatmentData: { name: string; value: number }[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics/summary')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setIsLoading(false));
    }, []);

    const fmt = (n: number) => n >= 1_000_000
        ? `$${(n / 1_000_000).toFixed(2)}M`
        : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}k` : `$${n}`;

    return (
        <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-[#a10c22]" />
                    Financial Analytics
                </h1>
                <p className="text-white/50">Live metrics from your clinic&apos;s database.</p>
            </div>

            {/* KPI Cards */}
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
                            {isLoading ? <KpiSkeleton /> : (
                                <h3 className="text-4xl font-serif text-white">{fmt(data?.mrr ?? 0)}</h3>
                            )}
                            <p className="mt-2 text-sm text-white/40">Current month paid charges</p>
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
                            {isLoading ? <KpiSkeleton /> : (
                                <h3 className="text-4xl font-serif text-white">{fmt(data?.arr ?? 0)}</h3>
                            )}
                            <p className="mt-2 text-sm text-white/40">MRR × 12</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-[#a10c22]/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Total Patients</p>
                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#a10c22]" />
                            </div>
                        </div>
                        <div>
                            {isLoading ? <KpiSkeleton /> : (
                                <h3 className="text-4xl font-serif text-white">{(data?.totalPatients ?? 0).toLocaleString()}</h3>
                            )}
                            <p className="mt-2 text-sm text-white/40">Registered in this clinic</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl hover:border-[#a10c22]/30 transition-colors">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Last Month Revenue</p>
                            <div className="w-10 h-10 rounded-full bg-[#a10c22]/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-[#a10c22]" />
                            </div>
                        </div>
                        <div>
                            {isLoading ? <KpiSkeleton /> : (
                                <h3 className="text-4xl font-serif text-white">
                                    {data?.revenueData?.length
                                        ? fmt(data.revenueData[data.revenueData.length - 1]?.revenue ?? 0)
                                        : '$0'}
                                </h3>
                            )}
                            <p className="mt-2 text-sm text-white/40">Most recent recorded month</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Revenue Trend</CardTitle>
                        <CardDescription className="text-white/40">Monthly revenue — last 12 months</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        {isLoading ? (
                            <div className="w-full h-full bg-white/5 rounded animate-pulse" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.revenueData ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a10c22" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#a10c22" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#a10c22" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Active Patients per Month</CardTitle>
                        <CardDescription className="text-white/40">Unique paying patients per month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                        {isLoading ? (
                            <div className="w-full h-full bg-white/5 rounded animate-pulse" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.revenueData ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="patients" fill="#a10c22" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#0C1420] border-border/50 shadow-2xl lg:col-span-2">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-serif text-white font-medium">Treatment Portfolio Distribution</CardTitle>
                        <CardDescription className="text-white/40">Patient count by active clinical protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px] flex items-center justify-center">
                        {isLoading ? (
                            <div className="w-64 h-64 rounded-full bg-white/5 animate-pulse" />
                        ) : !data?.treatmentData?.length ? (
                            <p className="text-white/30 text-sm">No treatment data yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.treatmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.treatmentData.map((_entry, index) => (
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
