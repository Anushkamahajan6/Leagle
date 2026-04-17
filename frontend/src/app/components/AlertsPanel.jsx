"use client"

import { useAppStore } from '../store/appStore'
import { Bell, AlertTriangle, Info, ChevronRight, Activity, Zap } from 'lucide-react'

export default function AlertsPanel() {
    const { alerts, unreadCount, markRead } = useAppStore()

    const getIcon = (severity) => {
        switch (severity) {
            case 'HIGH': return <Zap className="text-red-500" size={18} />
            case 'MEDIUM': return <AlertTriangle className="text-amber-500" size={18} />
            default: return <Info className="text-leagle-accent" size={18} />
        }
    }

    const getBg = (severity) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-500/5 border-red-500/10'
            case 'MEDIUM': return 'bg-amber-500/5 border-amber-500/10'
            default: return 'bg-leagle-accent/5 border-leagle-accent/10'
        }
    }

    return (
        <div className="glass-card overflow-hidden h-full flex flex-col border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-leagle-accent/10 rounded-2xl flex items-center justify-center text-leagle-accent border border-leagle-accent/20">
                            <Bell size={24} />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-600 border-2 border-[#0f172a] shadow-lg animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Active Alerts</h2>
                        <p className="text-[10px] font-black text-leagle-accent uppercase tracking-[0.2em] opacity-80">Live Feed</p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markRead}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                    >
                        Mark as Read
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="text-5xl opacity-20 grayscale">🔕</div>
                        <p className="text-gray-500 font-bold text-sm tracking-tight">No active alerts.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {alerts.map((alert, idx) => (
                            <div
                                key={alert.id || idx}
                                className={`p-6 flex gap-5 transition-all hover:bg-white/[0.03] group ${getBg(alert.severity)}`}
                            >
                                <div className="mt-1 group-hover:scale-110 transition-transform">{getIcon(alert.severity)}</div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-[9px] font-black tracking-[0.2em] uppercase ${alert.severity === 'HIGH' ? 'text-red-400' :
                                                alert.severity === 'MEDIUM' ? 'text-amber-400' : 'text-leagle-accent'
                                            }`}>
                                            {alert.severity} Severity
                                        </p>
                                        <span className="text-[9px] text-gray-600 font-black font-mono">LIVE UTC</span>
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors">
                                        {alert.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded-lg text-[8px] font-black bg-white/5 text-gray-500 border border-white/5 flex items-center gap-1 group-hover:border-leagle-accent/30 group-hover:text-leagle-accent transition-all">
                                            {alert.regulation_title?.slice(0, 40) || 'Regulation Update'}
                                            <ChevronRight size={10} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-leagle-accent animate-ping opacity-50"></div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Feed Status: Connected</span>
                </div>
                <Activity size={14} className="text-leagle-accent/40" />
            </div>
        </div>
    )
}
