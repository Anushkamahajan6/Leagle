import QueryProvider from './components/QueryProvider'
import Navigation from './components/Navigation'
import './globals.css'

export const metadata = {
    title: 'Leagle Compliance Operations',
    description: 'Regulation analysis and policy impact assessment',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased min-h-screen selection:bg-leagle-accent/30 cm-shell-bg">
                <QueryProvider>
                    {/* ✅ Socket.IO disabled - removed WebSocketInitializer */}
                    <Navigation />
                    <div className="pl-[76px] min-h-screen flex flex-col">
                        <header className="cm-shell-header sticky top-0 z-20 px-7 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue-700 to-sky-700 text-[10px] font-black text-sky-100 flex items-center justify-center shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_4px_16px_rgba(29,78,216,0.4)]">LG</div>
                                <h1 className="text-[26px] leading-none font-extrabold tracking-[-0.5px] text-slate-100">
                                    <span className="text-gradient">Leagle</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)] animate-[cm-pulse_2s_ease-in-out_infinite]" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-green-400">System Active</span>
                            </div>
                        </header>

                        <main className="flex-1 p-6">
                            <section className="max-w-[1400px] mx-auto cm-shell-frame p-6 min-h-[70vh]">
                                {children}
                            </section>
                        </main>
                    </div>
                </QueryProvider>
            </body>
        </html>
    )
}
