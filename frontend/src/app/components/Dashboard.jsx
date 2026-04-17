"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRegulations, getAlerts } from '../api/client'
import { Shield, TrendingUp, AlertTriangle, Scale, Upload, Search, Target, Bell } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({ regs: 0, alerts: 0, highRisk: 0 })
    const [loading, setLoading] = useState(true)
    const [greeting, setGreeting] = useState('Morning Briefing')

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) setGreeting('Morning Briefing')
        else if (hour >= 12 && hour < 17) setGreeting('Afternoon Briefing')
        else if (hour >= 17 && hour < 21) setGreeting('Evening Briefing')
        else setGreeting('Night Briefing')
    }, [])

    useEffect(() => {
        async function loadData() {
            try {
                const [regRes, alertRes] = await Promise.all([
                    getRegulations(),
                    getAlerts()
                ])
                const regs = regRes.data || []
                const alerts = alertRes.data || []

                setStats({
                    regs: regs.length,
                    alerts: alerts.length,
                    highRisk: alerts.filter(a => a.severity === 'HIGH' && !a.acknowledged).length
                })
            } catch (err) {
                console.error('Failed to load dashboard data', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-leagle-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-leagle-accent font-bold animate-pulse">Loading compliance overview...</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <header className="border-b border-white/5 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-serif text-white tracking-tight italic">{greeting}</h1>
                        <p className="text-gray-500 mt-2 font-medium tracking-wide uppercase text-[10px]">Operational Intelligence Hub • Leagle Central Command</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-1.5 border border-leagle-accent/30 bg-leagle-accent/5 rounded-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-leagle-accent animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-leagle-accent">System Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
                    {[
                        { label: "Regulation Portfolio", value: stats.regs, icon: <Shield size={16} /> },
                        { label: "Active Directives", value: stats.alerts, icon: <TrendingUp size={16} /> },
                        { label: "Critical Risk Gaps", value: stats.highRisk, icon: <AlertTriangle size={16} />, highlight: true },
                    ].map((stat, i) => (
                        <div key={i} className="space-y-2 border-l border-white/10 pl-6 group">
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${stat.highlight ? 'text-red-500' : 'text-gray-500'}`}>
                                {stat.icon}
                                {stat.label}
                            </div>
                            <p className="text-5xl font-serif text-white group-hover:text-leagle-accent transition-colors">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-leagle-accent/30" />
                            Workflow Execution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 p-px">
                            {[
                                { label: "Jurisdictional Library", sub: "Browse & Refine Regulations", icon: <Scale size={18} />, path: "/regulations" },
                                { label: "Diagnostic Ingest", sub: "Upload Audit Artifacts", icon: <Upload size={18} />, path: "/ingest" },
                                { label: "Semantic Inquiry", sub: "Neural Case Research", icon: <Search size={18} />, path: "/search" },
                                { label: "Impact Analysis", sub: "Cross-Reference Comparison", icon: <Target size={18} />, path: "/impact" },
                            ].map((action, i) => (
                                <Link key={i} href={action.path} className="p-8 bg-leagle-bg hover:bg-white/2 transition-all group border-transparent hover:border-leagle-accent/20 flex flex-col gap-4">
                                    <div className="text-leagle-accent opacity-50 group-hover:opacity-100 transition-opacity">{action.icon}</div>
                                    <div>
                                        <p className="font-serif text-xl text-white group-hover:text-leagle-accent transition-colors">{action.label}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">{action.sub}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1 space-y-10">
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-red-500/30" />
                            Priority Queue
                        </h3>
                        <div className="glass-card border-none bg-white/2 p-8 space-y-6">
                            <div className="w-12 h-12 border border-leagle-accent/20 bg-leagle-accent/5 flex items-center justify-center text-leagle-accent">
                                <Bell size={20} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-serif text-white italic">
                                    {stats.highRisk > 0 ? 'Alert Follow-up' : 'System Verification'}
                                </h4>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    {stats.highRisk > 0 ? (
                                        <>There are currently <span className="text-white font-black">{stats.highRisk}</span> high-priority alerts awaiting executive acknowledgment.</>
                                    ) : (
                                        <>All protocols are stable. No active high-priority alerts detected in current cycle.</>
                                    )}
                                </p>
                            </div>
                            <Link href="/alerts" className="block w-full py-3 border border-leagle-accent/50 text-leagle-accent text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-leagle-accent hover:text-black transition-all">
                                {stats.highRisk > 0 ? 'Review Protocols' : 'Audit History'}
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
