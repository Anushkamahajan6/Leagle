"use client"

import { useState, useEffect } from 'react'
import { getRegulationIntel } from '../api/client'
import { X, ShieldAlert, Cpu, Scale, BrainCircuit, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function RegulationDetail({ regulation, onClose }) {
    const [intel, setIntel] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadIntel() {
            try {
                const { data } = await getRegulationIntel(regulation.id)
                setIntel(data)
            } catch (err) {
                console.error('Failed to load regulation intelligence', err)
            } finally {
                setLoading(false)
            }
        }
        loadIntel()
    }, [regulation.id])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col text-white">
                {/* Background Aura */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -ml-48 -mb-48 transition-all duration-1000"></div>

                <div className="p-8 pb-4 flex justify-between items-start relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full">
                                Regulation Analysis
                            </span>
                            {regulation.jurisdiction && (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/70 px-3 py-1 rounded-full border border-white/5">
                                    Region: {regulation.jurisdiction}
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold leading-tight line-clamp-2 pr-12">
                            {regulation.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-4 relative z-10 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                            <p className="text-gray-400 font-medium animate-pulse">Running Neural Legal Analysis...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Key Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-red-500/20 text-red-500 rounded-2xl">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <h3 className="font-bold text-lg">ML Risk Exposure</h3>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <span className={`text-5xl font-black ${intel.risk_score >= 70 ? 'text-red-500' :
                                                intel.risk_score >= 40 ? 'text-yellow-500' : 'text-green-500'
                                            }`}>
                                            {intel.risk_score}%
                                        </span>
                                        <span className="text-gray-400 mb-2 font-medium">Compliance Severity</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${intel.risk_score >= 70 ? 'bg-red-500' :
                                                    intel.risk_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${intel.risk_score}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl">
                                            <Cpu size={24} />
                                        </div>
                                        <h3 className="font-bold text-lg">Impact Areas</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {intel.impact_areas?.map((area, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-300">
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Brief Explanation */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                                <div className="flex items-center gap-3 mb-6">
                                    <BrainCircuit className="text-blue-400" size={24} />
                                    <h3 className="text-xl font-bold tracking-tight">Executive Briefing</h3>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-lg italic">
                                    "{intel.explanation}"
                                </p>
                            </div>

                            {/* Legal Comparison */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <Scale className="text-purple-400" size={24} />
                                    <h3 className="text-xl font-bold tracking-tight">Neural Legal Comparison</h3>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-gray-300 leading-relaxed prose prose-invert max-w-none">
                                    <ReactMarkdown>{intel.comparison}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-4 border-t border-white/5 bg-white/[0.02] relative z-10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    )
}
