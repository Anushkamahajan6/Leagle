import { useAppStore } from '../store/appStore'
import { acknowledgeAlert } from '../api/client'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function AlertsPanel() {
    const { alerts, markRead } = useAppStore()

    // Auto clear unread count when opening the tab
    import('react').then(({ useEffect }) => {
        useEffect(() => { markRead() }, [markRead])
    })

    const handleAcknowledge = async (id) => {
        try {
            await acknowledgeAlert(id)
            // Optimistically update the store list status to acknowledged
            useAppStore.setState(state => ({
                alerts: state.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
            }))
        } catch (e) {
            console.error('Failed to acknowledge alert', e)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Real-Time Alerts Feed</h2>

            {alerts.length === 0 ? (
                <p className="text-gray-500">No recent alerts.</p>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${!alert.acknowledged && alert.severity === 'HIGH' ? 'bg-red-50 border-red-200'
                                    : !alert.acknowledged && alert.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200'
                                        : 'bg-white border-gray-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${alert.severity === 'HIGH' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${alert.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {alert.severity} RISK
                                        </span>
                                    </div>
                                    <p className="text-gray-900 font-medium">{alert.message}</p>
                                </div>
                            </div>

                            {!alert.acknowledged ? (
                                <button
                                    onClick={() => handleAcknowledge(alert.id)}
                                    className="px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Confirm View
                                </button>
                            ) : (
                                <div className="flex items-center text-green-600 gap-1 mt-1">
                                    <CheckCircle size={16} />
                                    <span className="text-xs font-medium">Acknowledged</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
