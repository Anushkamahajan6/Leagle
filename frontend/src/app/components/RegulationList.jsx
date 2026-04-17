"use client"

import { useState, useEffect } from 'react'
import { getRegulations } from '../api/client'
import { FileText, Search, Globe, Tag, Clock } from 'lucide-react'
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

    if (loading) return <div className="p-8 text-gray-500 animate-pulse">Scanning Neural Library...</div>

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Regulatory Library</h2>
                    <p className="text-gray-500 mt-1">Found {regulations.length} intelligence sources</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search by title or jurisdiction (e.g. UK)..."
                        className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((reg) => (
                    <div
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-2xl ${reg.jurisdiction === 'UK' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                {reg.jurisdiction === 'UK' ? <Globe size={24} /> : <FileText size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${reg.jurisdiction === 'UK' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {reg.jurisdiction || 'Global'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                                        {reg.category || 'General'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {reg.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Tag size={12} />
                                        <span>Regulation ID: {reg.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>Added: {new Date(reg.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Summary preview on hover */}
                        <div className="mt-4 text-xs text-gray-500 line-clamp-2 italic border-t pt-4 border-gray-50">
                            {reg.raw_text?.slice(0, 150)}...
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
                <div className="py-20 text-center">
                    <p className="text-gray-400 text-lg">No regulations found matching "{search}"</p>
                </div>
            )}
        </div>
    )
}
