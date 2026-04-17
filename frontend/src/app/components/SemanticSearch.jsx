"use client"

import { useState } from 'react'
import { askQuestion } from '../api/client'
import { Search, Loader2, ShieldCheck, MessageSquare, History } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function SemanticSearch() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)
        try {
            const { data } = await askQuestion(query)
            setResult(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto min-h-[85vh] space-y-12 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-leagle-accent/10 rounded-3xl mb-4 text-leagle-accent shadow-[0_0_40px_rgba(56,189,248,0.1)] border border-leagle-accent/20">
                    <Search size={40} />
                </div>
                <h2 className="text-5xl font-black tracking-tight text-white">
                    Compliance <span className="text-leagle-accent">Search</span>
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto text-lg font-medium leading-relaxed">
                    Search regulations and guidance with referenced answers from your indexed sources.
                </p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-leagle-accent to-indigo-500 rounded-[2.5rem] blur-xl opacity-20 group-focus-within:opacity-40 transition duration-700"></div>
                <div className="relative flex gap-4 bg-leagle-navy/50 p-2 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
                    <input
                        className="flex-1 bg-transparent border-0 px-8 py-5 text-xl text-white placeholder-gray-600 focus:outline-none placeholder-italic"
                        placeholder="Search regulations, precedents, or compliance gaps..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="btn-premium px-10 py-5 flex items-center gap-3 rounded-[2rem]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                        Search
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-w border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-t-4 border-leagle-accent rounded-full animate-spin" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-leagle-accent animate-pulse">Retrieving source matches</p>
                </div>
            )}

            {result && !loading && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="glass-card p-10 relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-leagle-accent/5 blur-3xl rounded-full" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-leagle-accent/10 rounded-lg">
                                        <MessageSquare size={16} className="text-leagle-accent" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Response Summary</h3>
                                </div>
                                {result.local_ml_risk && (
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Risk:</span>
                                        <span className={`text-[10px] font-black uppercase ${result.local_ml_risk === 'High' ? 'text-red-500' :
                                                result.local_ml_risk === 'Medium' ? 'text-orange-400' :
                                                    'text-green-400'
                                            }`}>
                                            {result.local_ml_risk}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <div className="text-xl text-gray-200 leading-relaxed font-medium selection:bg-leagle-accent/30 prose-p:mb-6">
                                    <ReactMarkdown>{result.answer}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>

                    {result.sources?.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 px-4 flex items-center gap-2">
                                <History size={14} className="text-leagle-accent" />
                                Supporting Sources
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.sources.map((src, i) => (
                                    <div key={i} className="glass-card p-6 bg-white/2 hover:bg-white/5 transition-all group">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <span className="text-sm font-black text-gray-200 line-clamp-1 group-hover:text-leagle-accent transition-colors">{src.title}</span>
                                            <span className="text-[10px] font-black tracking-tighter text-leagle-accent bg-leagle-accent/10 px-2 py-1 rounded-lg border border-leagle-accent/20">
                                                {(src.score * 100).toFixed(0)}% RELEVANCE
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-leagle-accent to-blue-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_#38bdf8]"
                                                style={{ width: `${src.score * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
