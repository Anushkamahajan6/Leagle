"use client"

import { useState, useEffect } from 'react'
import { getRegulations, getAlerts, getHeatmap } from '../api/client'
import { AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({ regs: 0, alerts: 0, highRisk: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const [regRes, alertRes] = await Promise.all([
                    getRegulations(),
                    getAlerts()
                ])
                const regs = regRes.data || []
                const alerts = alertRes.data || []

                setStats({
                    regs: regs.length,
                    alerts: alerts.length,
                    highRisk: alerts.filter(a => a.severity === 'HIGH' && !a.acknowledged).length
                })
            } catch (err) {
                console.error('Failed to load dashboard data', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <div className="p-6">Loading dashboard...</div>

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Monitored Regulations</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.regs}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Alerts</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.alerts}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Unacknowledged High Risk</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">{stats.highRisk}</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-sm border">
                            + Add New Regulation
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-sm border">
                            + Add Internal Policy
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-sm border text-blue-600">
                            Run Compliance Check
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
