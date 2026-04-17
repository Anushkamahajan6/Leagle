'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
    const pathname = usePathname()

    const tabs = [
        { name: 'dashboard', path: '/dashboard' },
        { name: 'regulations', path: '/regulations' },
        { name: 'search', path: '/search' },
        { name: 'ingest', path: '/ingest' },
        { name: 'heatmap', path: '/heatmap' },
        { name: 'alerts', path: '/alerts' },
        { name: 'impact', path: '/impact' },
    ]

    const handleSync = async () => {
        try {
            const btn = document.getElementById('sync-uk-btn');
            btn.innerText = 'Syncing...';
            btn.disabled = true;

            const resp = await fetch('http://localhost:8000/api/regulations/sync/uk', { method: 'POST' });
            const data = await resp.json();
            alert(`Sync Complete! Ingested ${data.count} new regulations.`);
            window.location.reload();
        } catch (e) {
            alert('Sync failed. Please try again.');
        } finally {
            const btn = document.getElementById('sync-uk-btn');
            if (btn) {
                btn.innerText = 'Sync UK Live Feed';
                btn.disabled = false;
            }
        }
    }

    return (
        <>
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">
                    AI Compliance Management System
                </h1>

                <button
                    onClick={handleSync}
                    id="sync-uk-btn"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-indigo-300 transition-all active:scale-95"
                >
                    Sync UK Live Feed
                </button>
            </header>

            <nav className="bg-white border-b px-6 sticky top-0 z-50">
                <div className="flex gap-6">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path || (pathname === '/' && tab.path === '/dashboard')
                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className={`py-3 text-sm font-medium capitalize border-b-2 transition-colors ${isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                                    }`}
                            >
                                {tab.name}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
