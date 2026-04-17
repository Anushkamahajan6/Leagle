import { create } from 'zustand'

export const useAppStore = create((set) => ({
    alerts: [],
    unreadCount: 0,
    addAlerts: (newAlerts) =>
        set((state) => ({
            alerts: [...newAlerts, ...state.alerts].slice(0, 100),
            unreadCount: state.unreadCount + newAlerts.length,
        })),
    markRead: () => set({ unreadCount: 0 }),
}))
