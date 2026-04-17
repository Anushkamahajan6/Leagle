import { useState, useEffect } from 'react'
import { getHeatmap } from '../api/client'

export default function RiskHeatmap() {
    const [data, setData] = useState({ heatmap: {}, total_open_impacts: 0 })
    const [loading, setLoading] = useState(true)

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

    if (loading) return <div className="p-6">Loading heatmap...</div>

    const departments = Object.keys(data.heatmap || {})
    const categories = Array.from(new Set(
        departments.flatMap(d => Object.keys(data.heatmap[d]))
    ))

    if (departments.length === 0) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Risk Heatmap</h2>
                <p className="text-gray-500">No impact data available. Run compliance checks first.</p>
            </div>
        )
    }

    const getColor = (score) => {
        switch (score) {
            case 3: return 'bg-red-500 hover:bg-red-600 border-red-600 text-white'
            case 2: return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-yellow-900'
            case 1: return 'bg-green-400 hover:bg-green-500 border-green-500 text-green-900'
            default: return 'bg-gray-100 border-gray-200 text-transparent'
        }
    }

    const getLabel = (score) => {
        if (score === 3) return 'HIGH'
        if (score === 2) return 'MED'
        if (score === 1) return 'LOW'
        return 'NONE'
    }

    return (
        <div className="p-6 max-w-5xl mx-auto overflow-x-auto">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold">Policy Risk Heatmap</h2>
                <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                    {data.total_open_impacts} Open Impacts
                </span>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-3 text-left border-b border-gray-300 font-bold text-gray-700 bg-gray-50 rounded-tl-lg">Department</th>
                        {categories.map(cat => (
                            <th key={cat} className="p-3 text-center border-b border-gray-300 font-semibold text-gray-700 bg-gray-50 capitalize">
                                {cat.replace(/_/g, ' ')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept, i) => (
                        <tr key={dept} className="border-b border-gray-100">
                            <td className="p-3 font-medium text-gray-800 bg-gray-50/50">{dept}</td>
                            {categories.map(cat => {
                                const score = data.heatmap[dept]?.[cat] || 0
                                return (
                                    <td key={cat} className="p-2">
                                        <div className={`
                       h-12 w-full flex items-center justify-center rounded-md border 
                       font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm
                       ${getColor(score)}
                    `}>
                                            {score > 0 ? getLabel(score) : ''}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-8 flex gap-6 items-center text-sm font-medium text-gray-600">
                <span>Legend:</span>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div> High Risk</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded border border-yellow-500"></div> Medium Risk</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-400 rounded border border-green-500"></div> Low Risk</div>
            </div>
        </div>
    )
}
