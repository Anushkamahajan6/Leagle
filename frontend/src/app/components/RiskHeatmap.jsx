"use client"

import { useState, useEffect } from 'react'
import { getHeatmap, getImpactDetails } from '../api/client'
import { ShieldAlert, BarChart3, ChevronRight, Activity, X } from 'lucide-react'

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
        if (!selectedCell) {
            setDetails([])
            return
        }
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Activity className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-gray-400 font-medium animate-pulse">Scanning Risk Matrix...</p>
        </div>
    )

    const departments = Object.keys(data.heatmap || {})
    const categories = Array.from(new Set(
        departments.flatMap(d => Object.keys(data.heatmap[d]))
    ))

    if (departments.length === 0) {
        return (
            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto border border-blue-100/20">
                <ShieldAlert className="mx-auto text-blue-200 mb-6" size={64} />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Matrix Initialized</h2>
                <p className="text-gray-500">No impact data detected. Ingest regulations to populate the risk engine.</p>
            </div>
        )
    }

    const getScoreStyle = (score) => {
        switch (score) {
            case 3: return 'bg-red-500/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-400/50'
            case 2: return 'bg-amber-400/90 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.3)] border-amber-300/50'
            case 1: return 'bg-emerald-400/90 text-emerald-950 shadow-[0_0_15px_rgba(52,211,153,0.3)] border-emerald-300/50'
            default: return 'bg-white/50 text-gray-300 border-gray-100'
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="text-blue-600" size={20} />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-blue-500">Executive Dashboard</h2>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Compliance Risk Matrix</h1>
                </div>

                <div className="glass px-6 py-3 rounded-2xl border border-blue-100/30 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Active Signals</p>
                        <p className="text-xl font-black text-blue-600 leading-none">{data.total_open_impacts}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <Activity className="text-green-500 animate-pulse" size={24} />
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-4 md:p-8 border border-white/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>

                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-2">
                        <thead>
                            <tr>
                                <th className="p-4 text-left font-black text-gray-400 uppercase text-[10px] tracking-widest">Department</th>
                                {categories.map(cat => (
                                    <th key={cat} className="p-4 text-center font-black text-gray-400 uppercase text-[10px] tracking-widest min-w-[120px]">
                                        {cat.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                                            <span className="font-bold text-gray-800 text-sm">{dept}</span>
                                        </div>
                                    </td>
                                    {categories.map(cat => {
                                        const score = data.heatmap[dept]?.[cat] || 0
                                        return (
                                            <td key={cat}>
                                                <button
                                                    onClick={() => setSelectedCell({ dept, cat, score })}
                                                    className={`
                                                        w-full h-14 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center group relative
                                                        ${getScoreStyle(score)}
                                                        ${score > 0 ? 'hover:scale-[1.03] active:scale-95' : 'opacity-40 grayscale'}
                                                    `}
                                                >
                                                    {score > 0 && (
                                                        <>
                                                            <span className="text-[10px] font-black tracking-tighter opacity-70 mb-0.5">
                                                                {score === 3 ? 'CRITICAL' : score === 2 ? 'WARNING' : 'STABLE'}
                                                            </span>
                                                            <ChevronRight size={14} className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="mt-12 flex flex-wrap gap-8 items-center px-4 pt-8 border-t border-gray-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-500 rounded-lg shadow-lg shadow-red-500/30"></div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">High Risk</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-amber-400 rounded-lg shadow-lg shadow-amber-400/30"></div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Moderate</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-400 rounded-lg shadow-lg shadow-emerald-400/30"></div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Optimized</span>
                    </div>
                </div>
            </div>

            {/* Drill Down Overlay */}
            {selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedCell(null)}>
                    <div className="glass max-w-2xl w-full rounded-[2rem] border border-white/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-gray-100/50 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Departmental Intelligence</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedCell.dept}</span>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedCell.cat?.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {detailsLoading ? (
                                <div className="py-20 flex flex-col items-center">
                                    <Activity className="animate-spin text-blue-500 mb-4" size={32} />
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Compiling Evidence...</p>
                                </div>
                            ) : details.length > 0 ? (
                                <div className="space-y-6">
                                    {details.map((m, idx) => (
                                        <div key={idx} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Impact Event #{idx + 1}</p>
                                                    <h4 className="font-bold text-gray-900">{m.regulation_title}</h4>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.impact_level === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {m.impact_level}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100/50 italic mb-4">
                                                "{m.summary}"
                                            </p>
                                            <div className="flex gap-4">
                                                <a
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(m.regulation_title + ' official text')}`}
                                                    target="_blank"
                                                    className="flex-1 py-3 text-center bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                                                >
                                                    View Source Text
                                                </a>
                                                <button className="flex-1 py-3 text-center bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all">
                                                    Open {m.policy_title}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <p className="font-bold">No active remediation tasks for this cell.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedCell(null)}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
