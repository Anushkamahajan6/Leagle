"use client"

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAppStore } from '../store/appStore'
import { getAlerts } from '../api/client'

export function useWebSocket() {
    const { addAlerts, setAlerts } = useAppStore()

    useEffect(() => {
        // Initial Fetch
        async function fetchInitial() {
            try {
                const res = await getAlerts()
                setAlerts(res.data || [])
            } catch (err) {
                console.error('Failed to seed alerts:', err)
            }
        }
        fetchInitial()

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

        // Connect to Socket.io gateway
        const socket = io(API_BASE_URL, {
            path: '/ws/socket.io'
        })

        socket.on('new_alert', (data) => {
            console.log('📣 New Real-time Alert:', data)
            addAlerts([data])
        })

        socket.on('connect', () => console.log('✅ Connected to Real-time Feed'))
        socket.on('disconnect', () => console.log('❌ Disconnected from Feed'))

        return () => socket.disconnect()
    }, [addAlerts, setAlerts])
}
