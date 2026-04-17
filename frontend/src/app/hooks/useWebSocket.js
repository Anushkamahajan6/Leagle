"use client"

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAppStore } from '../store/appStore'

export function useWebSocket() {
    const addAlerts = useAppStore((s) => s.addAlerts)

    useEffect(() => {
        // Connect to Socket.io gateway
        const socket = io('http://localhost:8000', {
            path: '/ws/socket.io'
        })

        socket.on('new_alert', (data) => {
            console.log('📣 New Real-time Alert:', data)
            addAlerts([data])
        })

        socket.on('connect', () => console.log('✅ Connected to Real-time Feed'))
        socket.on('disconnect', () => console.log('❌ Disconnected from Feed'))

        return () => socket.disconnect()
    }, [addAlerts])
}
