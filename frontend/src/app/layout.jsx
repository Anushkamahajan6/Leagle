import './globals.css'

export const metadata = {
    title: 'AI Compliance Management System',
    description: 'Semantic regulation analysis and policy impact assessment',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
