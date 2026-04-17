'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
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

import RegulationList from './components/RegulationList'

function AppContent() {
    const [tab, setTab] = useState('dashboard')

    const tabs = ['dashboard', 'regulations', 'search', 'ingest', 'heatmap', 'alerts', 'impact']

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-6 py-4">
                <h1 className="text-xl font-bold text-gray-900">
                    AI Compliance Management System
                </h1>
            </header>
            {/* UK Sync Trigger */}
            <div className="flex justify-center mb-12">
                <button
                    onClick={async () => {
                        try {
                            const btn = document.getElementById('sync-uk-btn');
                            btn.innerText = 'Syncing...';
                            btn.disabled = true;
                            // This would call an endpoint we'll create in main.py
                            const resp = await fetch('http://localhost:8000/api/regulations/sync/uk', { method: 'POST' });
                            const data = await resp.json();
                            alert(`Sync Complete! Ingested ${data.count} new regulations.`);
                        } catch (e) {
                            alert('Sync failed. Please try again.');
                        } finally {
                            const btn = document.getElementById('sync-uk-btn');
                            btn.innerText = 'Sync UK Live Feed';
                            btn.disabled = false;
                            window.location.reload();
                        }
                    }}
                    id="sync-uk-btn"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-indigo-500/50 transition-all active:scale-95"
                >
                    Sync UK Live Feed
                </button>
            </div>

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
                {tab === 'regulations' && <RegulationList />}
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
