'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Scale, Search, Upload, BarChart3, Bell, Target, RefreshCw } from 'lucide-react'

export default function Navigation() {
    const pathname = usePathname()
    const [syncLoading, setSyncLoading] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')

    const tabs = [
        { name: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'regulations', path: '/regulations', icon: Scale },
        { name: 'search', path: '/search', icon: Search },
        { name: 'ingest', path: '/ingest', icon: Upload },
        { name: 'heatmap', path: '/heatmap', icon: BarChart3 },
        { name: 'alerts', path: '/alerts', icon: Bell },
        { name: 'impact', path: '/impact', icon: Target },
    ]

    const handleSync = async () => {
        setSyncLoading(true)
        setSyncMessage('Sync in progress...')
        try {
            const resp = await fetch('http://localhost:8000/api/regulations/sync/uk', { method: 'POST' })
            const data = await resp.json()
            setSyncMessage(`Sync complete: ${data.count} regulations added.`)
            window.location.reload()
        } catch (e) {
            setSyncMessage('Sync failed. Try again.')
        } finally {
            setSyncLoading(false)
        }
    }

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[76px] min-h-screen shrink-0 bg-[rgba(2,9,22,0.98)] border-r border-[rgba(56,189,248,0.09)] z-30 flex flex-col items-center">
            <div className="w-full py-[18px] border-b border-white/5 flex justify-center">
                <div className="w-8 h-8 flex items-center justify-center text-leagle-accent">
                    <Scale size={20} />
                </div>
            </div>

            <nav className="flex-1 w-full py-2.5 flex flex-col gap-px">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path || (pathname === '/' && tab.path === '/dashboard')
                    const Icon = tab.icon
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            title={tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                            className={`cm-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={17} strokeWidth={1.8} className={isActive ? 'text-leagle-accent' : 'text-slate-500'} />
                            <span className={`text-[9px] font-bold tracking-[0.07em] uppercase ${isActive ? 'text-leagle-accent' : 'text-slate-500'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            <div className="w-full py-2 border-t border-white/5 flex flex-col items-center gap-2">
                <button
                    onClick={handleSync}
                    disabled={syncLoading}
                    title="Sync UK Source"
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={syncLoading ? 'animate-spin' : ''} />
                </button>
                <div className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[cm-pulse_2s_ease-in-out_infinite]" />
                <span className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-green-400/50">Active</span>
            </div>

            {syncMessage && (
                <p className="absolute bottom-16 left-[88px] px-3 py-1.5 rounded-lg border border-white/10 bg-[rgba(2,9,22,0.96)] text-[10px] uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    {syncMessage}
                </p>
            )}
        </aside>
    )
}
