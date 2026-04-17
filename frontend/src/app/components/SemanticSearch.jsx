import { useState } from 'react'
import { askQuestion } from '../api/client'
import { Search, Loader2, ShieldCheck, Zap } from 'lucide-react'
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
        <div className="p-8 max-w-4xl mx-auto min-h-[80vh]">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Semantic Regulation Brain
                </h2>
                <p className="text-gray-500 max-w-md mx-auto text-lg italic">
                    "Compliance context at the speed of thought"
                </p>
            </div>

            <div className="relative group mb-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                <div className="relative flex gap-2">
                    <input
                        className="flex-1 bg-white border-0 rounded-xl px-6 py-4 text-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Search regulations, precedents, or compliance gaps..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                        Analyze
                    </button>
                </div>
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass rounded-3xl p-8 border border-blue-100/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Zap size={120} />
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">AI compliance Verdict</h3>
                        </div>

                        <div className="markdown-content text-gray-800 text-lg">
                            <ReactMarkdown>{result.answer}</ReactMarkdown>
                        </div>
                    </div>

                    {result.sources?.length > 0 && (
                        <div className="px-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                <Search size={14} />
                                Neural Verification Sources
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.sources.map((src, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-gray-700 line-clamp-1">{src.title}</span>
                                            <span className="text-xs font-mono text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                                                {(src.score * 100).toFixed(0)}% Match
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000 ease-out"
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
