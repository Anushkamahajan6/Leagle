'use client'

import Ingest from '../components/Ingest'

export default function IngestPage() {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">↑</span>
                Document Intelligence Ingestion
            </h2>
            <Ingest />
        </div>
    )
}
