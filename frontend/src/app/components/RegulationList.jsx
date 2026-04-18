"use client"

import { useState, useEffect } from 'react'
import { getRegulations } from '../api/client'
import { Search, Tag, Clock, ArrowUpRight, ChevronRight } from 'lucide-react'
import RegulationDetail from './RegulationDetail'

export default function RegulationList() {
    const [regulations, setRegulations] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedReg, setSelectedReg] = useState(null)

    useEffect(() => {
        async function fetchRegs() {
            try {
                const { data } = await getRegulations()
                setRegulations(data)
            } catch (err) {
                console.error('Error fetching regulations', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRegs()
    }, [])

    const filtered = regulations.filter(r =>
    (r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.jurisdiction?.toLowerCase().includes(search.toLowerCase()))
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-10 h-10 border-4 border-leagle-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-[10px]">Loading regulation library...</p>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-serif text-white tracking-tight italic">Jurisdictional Library</h2>
                    <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest">{regulations.length} Records in Portfolio</p>
                </div>

                <div className="relative w-full lg:w-[450px] group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-leagle-accent transition-colors" size={20} />
                    <input
                        type="search"
                        placeholder="Filter by jurisdiction or title..."
                        className="w-full pl-14 pr-8 py-5 bg-white/2 border border-white/5 rounded-sm text-gray-200 placeholder-gray-600 focus:border-leagle-accent transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filtered.map((reg) => (
                    <div
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className="glass-card p-8 group hover:bg-white/[0.02] transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between h-full border-white/5 hover:border-leagle-accent/20 rounded-sm"
                    >
                        {/* Interactive Background Element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-leagle-accent/10 to-transparent flex items-center justify-center translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform">
                            <ArrowUpRight className="text-leagle-accent opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${reg.jurisdiction === 'UK'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-leagle-accent/10 text-leagle-accent border border-leagle-accent/20'
                                    }`}>
                                    {reg.jurisdiction || 'Global'}
                                </span>
                                <span className="px-2.5 py-1 bg-white/2 border border-white/5 text-gray-500 rounded-sm text-[9px] font-black uppercase tracking-[0.2em]">
                                    {reg.category || 'General'}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif text-white group-hover:text-leagle-accent transition-colors leading-tight line-clamp-2 italic">
                                {reg.title}
                            </h3>

                            <p className="text-sm text-gray-500 font-medium line-clamp-2 italic leading-relaxed">
                                {reg.raw_text?.slice(0, 180)}...
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-8">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Tag size={12} className="text-leagle-accent opacity-60" />
                                    {reg.id.slice(0, 8)}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                    <Clock size={12} className="text-leagle-accent opacity-60" />
                                    {new Date(reg.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-leagle-accent font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                View Details <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedReg && (
                <RegulationDetail
                    regulation={selectedReg}
                    onClose={() => setSelectedReg(null)}
                />
            )}

            {filtered.length === 0 && (
                <div className="glass-card py-32 text-center space-y-4">
                    <Search size={44} className="mx-auto text-leagle-accent/40" />
                    <div className="space-y-1">
                        <p className="text-xl font-black text-white">No Matching Regulations</p>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm">Adjust your search terms or sync new source data.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
