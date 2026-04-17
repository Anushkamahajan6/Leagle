import WebSocketInitializer from './components/WebSocketInitializer'
import QueryProvider from './components/QueryProvider'
import Navigation from './components/Navigation'
import './globals.css'

export const metadata = {
    title: 'AI Compliance Management System',
    description: 'Semantic regulation analysis and policy impact assessment',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-gray-50 text-gray-900">
                <QueryProvider>
                    <WebSocketInitializer />
                    <Navigation />
                    <main className="p-6 max-w-7xl mx-auto">
                        {children}
                    </main>
                </QueryProvider>
            </body>
        </html>
    )
}
