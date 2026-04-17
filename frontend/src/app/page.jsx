'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import SemanticSearch from './components/SemanticSearch'
import Dashboard from './components/Dashboard'
import AlertsPanel from './components/AlertsPanel'
import RiskHeatmap from './components/RiskHeatmap'
import Ingest from './components/Ingest'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
    },
})

function AppContent() {
    useWebSocket()  // Connect WebSocket globally
    const [tab, setTab] = useState('dashboard')

    const tabs = ['dashboard', 'search', 'ingest', 'heatmap', 'alerts', 'impact']

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-6 py-4">
                <h1 className="text-xl font-bold text-gray-900">
                    AI Compliance Management System
                </h1>
            </header>
            <nav className="bg-white border-b px-6">
                <div className="flex gap-6">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`py-3 text-sm font-medium capitalize border-b-2 ${tab === t
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </nav>
            <main className="p-6">
                {tab === 'dashboard' && <Dashboard />}
                {tab === 'search' && <SemanticSearch />}
                {tab === 'ingest' && <div className="p-6"><Ingest/></div>}
                {tab === 'heatmap' && <RiskHeatmap />}
                {tab === 'alerts' && <AlertsPanel />}
                {tab === 'impact' && <div className="p-6">Impact Component Builder...</div>}
            </main>
        </div>
    )
}

export default function Home() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
        </QueryClientProvider>
    )
}
