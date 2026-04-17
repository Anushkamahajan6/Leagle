"use client"

import { useAppStore } from '../store/appStore'
import { Bell, BellOff, AlertTriangle, AlertCircle, Info, ChevronRight, Activity } from 'lucide-react'

export default function AlertsPanel() {
    const { alerts, unreadCount, markRead } = useAppStore()

    const getIcon = (severity) => {
        switch (severity) {
            case 'HIGH': return <AlertTriangle className="text-red-500" size={18} />
            case 'MEDIUM': return <AlertCircle className="text-amber-500" size={18} />
            default: return <Info className="text-blue-500" size={18} />
        }
    }

    const getBg = (severity) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-500/5 border-red-200/20'
            case 'MEDIUM': return 'bg-amber-500/5 border-amber-200/20'
            default: return 'bg-blue-500/5 border-blue-200/20'
        }
    }

    return (
        <div className="glass rounded-[2rem] border border-blue-100/20 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-12 duration-700 h-full">
            <div className="p-6 bg-gradient-to-r from-blue-600/10 to-transparent flex justify-between items-center border-b border-blue-100/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="text-blue-600" size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-4 ring-white shadow-lg animate-bounce"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-800 tracking-tight">Active Monitoring</h2>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Live Compliance Stream</p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markRead}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full"
                    >
                        Clear Markers
                    </button>
                )}
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="p-12 text-center">
                        <BellOff className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-medium text-sm">No recent alerts. System optimized.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100/50">
                        {alerts.map((alert, idx) => (
                            <div
                                key={alert.id || idx}
                                className={`p-5 flex gap-4 transition-all hover:bg-white/40 group ${getBg(alert.severity)}`}
                            >
                                <div className="mt-1">{getIcon(alert.severity)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                            {alert.severity} PRIORITY
                                        </p>
                                        <span className="text-[10px] text-gray-300 font-medium">Just now</span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                                        {alert.message}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100/50 text-blue-600 border border-blue-200/30">
                                            {alert.regulation_title?.slice(0, 30) || 'Compliance Update'}...
                                        </div>
                                        <ChevronRight size={12} className="text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Connection: Open</span>
                </div>
                <Activity size={14} className="text-blue-200" />
            </div>
        </div>
    )
}
