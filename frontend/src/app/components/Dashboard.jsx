"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRegulations, getAlerts } from '../api/client'
import { Shield, TrendingUp, AlertTriangle, FileSearch, Upload, BarChart3, Bell, ClipboardCheck } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({ regs: 0, alerts: 0, highRisk: 0 })
    const [loading, setLoading] = useState(true)

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
        <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Compliance Dashboard</h2>
                    <p className="text-gray-400 mt-2 font-medium">Operational view of regulations, alerts, and risk exposure.</p>
                </div>
                <div className="flex items-center gap-2 bg-leagle-accent/10 px-4 py-2 rounded-2xl border border-leagle-accent/20">
                    <div className="w-2 h-2 rounded-full bg-leagle-accent animate-ping" />
                    <span className="text-xs font-black uppercase tracking-widest text-leagle-accent">Live Monitoring</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Regulations Tracked", value: stats.regs, icon: <Shield className="w-8 h-8" />, color: "from-blue-500 to-leagle-accent" },
                    { label: "Open Alerts", value: stats.alerts, icon: <TrendingUp className="w-8 h-8" />, color: "from-indigo-500 to-purple-500" },
                    { label: "High Severity Unread", value: stats.highRisk, icon: <AlertTriangle className="w-8 h-8" />, color: "from-orange-500 to-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card group hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
                        <div className="p-8 relative z-10">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                                {stat.icon}
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                            <p className="text-5xl font-black text-white mt-4 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 space-y-8">
                    <div>
                        <h3 className="text-2xl font-black text-white">Quick Actions</h3>
                        <p className="text-sm text-gray-500 mt-1">Jump directly to primary compliance workflows.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Review Regulations", icon: <FileSearch size={24} />, path: "/regulations" },
                            { label: "Upload Document", icon: <Upload size={24} />, path: "/ingest" },
                            { label: "Run Search", icon: <ClipboardCheck size={24} />, path: "/search" },
                            { label: "Open Heatmap", icon: <BarChart3 size={24} />, path: "/heatmap" },
                        ].map((action, i) => (
                            <Link key={i} href={action.path} className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl text-left transition-all active:scale-95 group block">
                                <span className="text-leagle-accent block mb-4 group-hover:scale-110 transition-transform w-fit">{action.icon}</span>
                                <span className="font-black text-white text-lg tracking-tight block">{action.label}</span>
                                <span className="text-[10px] text-leagle-accent font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-leagle-accent/5 blur-3xl rounded-full scale-150" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 bg-leagle-accent/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(56,189,248,0.2)] text-leagle-accent">
                            <Bell size={36} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white">Alert Follow-up</h3>
                            <p className="text-gray-400 max-w-xs mx-auto mt-2 text-sm">Review active alerts and acknowledge items that require action.</p>
                        </div>
                        <Link href="/alerts" className="btn-premium w-full text-lg">Open Alerts</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
