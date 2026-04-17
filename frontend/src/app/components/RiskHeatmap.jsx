"use client"

import { useState, useEffect } from 'react'
import { getHeatmap, getImpactDetails } from '../api/client'
import { ShieldAlert, BarChart3, Activity, X, Target } from 'lucide-react'

export default function RiskHeatmap() {
    const [data, setData] = useState({ heatmap: {}, total_open_impacts: 0 })
    const [loading, setLoading] = useState(true)
    const [selectedCell, setSelectedCell] = useState(null)
    const [details, setDetails] = useState([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const response = await getHeatmap()
                setData(response.data || { heatmap: {}, total_open_impacts: 0 })
            } catch (err) {
                console.error('Failed to load heatmap data', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        if (!selectedCell) return
        async function fetchDetails() {
            setDetailsLoading(true)
            try {
                const res = await getImpactDetails(selectedCell.dept, selectedCell.cat)
                setDetails(res.data || [])
            } catch (err) {
                console.error('Failed to fetch details', err)
            } finally {
                setDetailsLoading(false)
            }
        }
        fetchDetails()
    }, [selectedCell])

    const closeDetails = () => {
        setSelectedCell(null)
        setDetails([])
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Activity className="animate-spin text-leagle-accent" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading risk matrix...</p>
        </div>
    )

    const departments = Object.keys(data.heatmap || {})
    const categories = Array.from(new Set(
        departments.flatMap(d => Object.keys(data.heatmap[d]))
    ))

    if (departments.length === 0) {
        return (
            <div className="glass-card p-20 text-center max-w-2xl mx-auto space-y-8">
                <ShieldAlert className="mx-auto text-leagle-accent/20" size={64} />
                <div>
                    <h2 className="text-2xl font-black text-white">Matrix Initialized</h2>
                    <p className="text-gray-500 mt-2 font-medium">No open impacts detected. Ingest regulations to populate the matrix.</p>
                </div>
            </div>
        )
    }

    const getScoreStyle = (score) => {
        switch (score) {
            case 3: return 'bg-red-500/20 text-red-500 border-red-500/30'
            case 2: return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
            case 1: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            default: return 'bg-white/2 text-gray-700 border-white/5 opacity-30 cursor-default'
        }
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="text-leagle-accent" size={18} />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-leagle-accent">Risk Oversight</h2>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Risk Exposure Matrix</h1>
                </div>

                <div className="glass-card px-8 py-4 flex items-center gap-6 border-white/10">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest leading-none mb-2">Active Signals</p>
                        <p className="text-2xl font-black text-white leading-none">{data.total_open_impacts}</p>
                    </div>
                    <div className="h-10 w-px bg-white/5"></div>
                    <div className="w-10 h-10 bg-leagle-accent/10 rounded-xl flex items-center justify-center text-leagle-accent border border-leagle-accent/20">
                        <Activity className="animate-pulse" size={20} />
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 md:p-12 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-leagle-accent/5 blur-3xl rounded-full" />

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-4">
                        <thead>
                            <tr>
                                <th className="p-4 text-left font-black text-gray-600 uppercase text-[10px] tracking-[0.3em]">Department</th>
                                {categories.map(cat => (
                                    <th key={cat} className="p-4 text-center font-black text-gray-600 uppercase text-[10px] tracking-[0.3em] min-w-[150px]">
                                        {cat.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-1.5 bg-gradient-to-b from-leagle-accent to-blue-600 rounded-full shadow-[0_0_10px_#38bdf8]"></div>
                                            <span className="font-black text-white text-lg tracking-tight">{dept}</span>
                                        </div>
                                    </td>
                                    {categories.map(cat => {
                                        const score = data.heatmap[dept]?.[cat] || 0
                                        return (
                                            <td key={cat}>
                                                <button
                                                    onClick={() => score > 0 && setSelectedCell({ dept, cat, score })}
                                                    className={`
                                                        w-full h-20 rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center group relative overflow-hidden
                                                        ${getScoreStyle(score)}
                                                        ${score > 0 ? 'hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-95' : ''}
                                                    `}
                                                >
                                                    {score > 0 && (
                                                        <>
                                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ArrowUpRight size={12} />
                                                            </div>
                                                            <span className="text-[10px] font-black tracking-widest uppercase opacity-80 mb-1">
                                                                {score === 3 ? 'CRITICAL' : score === 2 ? 'WARNING' : 'STABLE'}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                {[...Array(score)].map((_, i) => (
                                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="mt-16 flex flex-wrap gap-10 items-center px-6 py-8 bg-white/2 rounded-[2rem] border border-white/5">
                    {[
                        { label: "High Risk", color: "bg-red-500 shadow-red-500/40" },
                        { label: "Moderate", color: "bg-amber-500 shadow-amber-500/40" },
                        { label: "Stable", color: "bg-emerald-500 shadow-emerald-500/40" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-md shadow-lg ${item.color}`} />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                    <div className="ml-auto text-[10px] font-black text-leagle-accent uppercase tracking-widest border-b border-leagle-accent/20 pb-1">
                        Scoring Model Active
                    </div>
                </div>
            </div>

            {/* Drill Down Overlay */}
            {selectedCell && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-leagle-bg/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={closeDetails}>
                    <div className="glass-card max-w-3xl w-full border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-white/5 bg-white/5 flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-leagle-accent/10 rounded-xl text-leagle-accent">
                                        <Target size={20} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-leagle-accent">Impact Detail</h3>
                                </div>
                                <h4 className="text-3xl font-black text-white tracking-tight leading-tight">
                                    {selectedCell.dept} Review
                                </h4>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                                    Segment: <span className="text-white">{selectedCell.cat?.replace(/_/g, ' ')}</span>
                                </p>
                            </div>
                            <button
                                onClick={closeDetails}
                                className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/5"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                            {detailsLoading ? (
                                <div className="py-24 flex flex-col items-center gap-4">
                                    <Activity className="animate-spin text-leagle-accent" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-leagle-accent animate-pulse">Loading impact evidence...</p>
                                </div>
                            ) : details.length > 0 ? (
                                <div className="space-y-6">
                                    {details.map((m, idx) => (
                                        <div key={idx} className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 space-y-6 group hover:bg-white/[0.04] transition-all duration-500">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-leagle-accent uppercase tracking-widest">Impact Record #{idx + 1}</p>
                                                    <h4 className="text-xl font-black text-white group-hover:text-leagle-accent transition-colors leading-tight">{m.regulation_title}</h4>
                                                </div>
                                                <span className={`px-4 py-1 rounded-xl text-[10px] font-black border uppercase tracking-widest ${m.impact_level === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                    }`}>
                                                    {m.impact_level} IMPACT
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-0 top-0 w-1 h-full bg-leagle-accent/20 rounded-full" />
                                                <p className="text-sm text-gray-400 leading-relaxed pl-6 italic font-medium">
                                                    &ldquo;{m.summary}&rdquo;
                                                </p>
                                            </div>

                                            <div className="flex gap-4 pt-2">
                                                <button className="flex-1 py-4 bg-leagle-accent/10 border border-leagle-accent/20 text-leagle-accent font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-leagle-accent/20 transition-all active:scale-95 shadow-lg">
                                                    View Evidence
                                                </button>
                                                <button className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white hover:bg-white/10 transition-all active:scale-95">
                                                    Open Affected Policy
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="text-4xl opacity-20">🛡️</div>
                                    <p className="font-black uppercase tracking-widest text-[10px] text-gray-600">No open impacts in this segment.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-white/5 border-t border-white/5 flex justify-end">
                            <button
                                onClick={closeDetails}
                                className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ArrowUpRight({ size }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
    )
}
