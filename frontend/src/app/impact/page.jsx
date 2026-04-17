'use client'

import { Construction } from 'lucide-react'

export default function ImpactPage() {
    return (
        <div className="glass-card p-12 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-leagle-accent/10 border border-leagle-accent/20 mx-auto flex items-center justify-center text-leagle-accent">
                <Construction size={30} />
            </div>
            <h2 className="text-3xl font-black text-white">Impact Analysis</h2>
            <p className="text-gray-400 font-medium">This module is currently in progress and will be available in a future update.</p>
        </div>
    )
}
