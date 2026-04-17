import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function useWebSocket() {
    const addAlerts = useAppStore((s) => s.addAlerts)

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/api/alerts/ws')

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'alerts') {
                addAlerts(data.data)
            }
        }

        ws.onerror = (e) => console.error('WebSocket error:', e)
        ws.onclose = () => console.log('WebSocket closed')

        return () => ws.close()
    }, [addAlerts])
}
