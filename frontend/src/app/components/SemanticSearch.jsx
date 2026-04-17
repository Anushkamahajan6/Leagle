import { useState } from 'react'
import { askQuestion } from '../api/client'
import { Search, Loader2 } from 'lucide-react'

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
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Semantic Regulation Search</h2>
            <p className="text-gray-500 mb-4 text-sm">
                Powered by Qdrant — searches by meaning, not just keywords
            </p>

            <div className="flex gap-2 mb-6">
                <input
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="e.g. data breach notification deadline..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                    Search
                </button>
            </div>

            {result && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">AI Answer</h3>
                        <p className="text-blue-900">{result.answer}</p>
                    </div>

                    {result.sources?.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-700">Sources (Qdrant similarity scores)</h3>
                            {result.sources.map((src, i) => (
                                <div key={i} className="flex items-center gap-3 mb-2">
                                    <span className="text-sm text-gray-600 flex-1">{src.title}</span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${src.score * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10 text-right">
                                        {(src.score * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
