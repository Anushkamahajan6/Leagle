import LandingNavbar from '../components/LandingNavbar';
import { Terminal, Code, BookOpen, Key, Link as LinkIcon, Database, Shield, Zap, Check } from 'lucide-react';
import Link from 'next/link';

export default function APIPage() {
    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white">
            <LandingNavbar />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <header className="mb-20 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-leagle-accent/10 border border-leagle-accent/20 text-leagle-accent text-[9px] font-black uppercase tracking-widest rounded-sm">Protocol Documentation</span>
                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Version 1.0.4-β</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif italic leading-tight">Leagle Neural <span className="text-gradient">API Ecosystem</span></h1>
                        <p className="text-xl text-gray-500 font-serif italic max-w-2xl leading-relaxed">
                            Integrate high-fidelity regulatory intelligence directly into your institutional workflows. Build sovereign compliance agents with neural context.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Sidebar Navigation */}
                        <aside className="hidden lg:block space-y-12">
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Fundamentals</h4>
                                <nav className="flex flex-col gap-4 text-xs font-medium text-gray-500">
                                    <a href="#introduction" className="hover:text-leagle-accent transition-colors flex items-center gap-2"><BookOpen size={14} /> Introduction</a>
                                    <a href="#authentication" className="hover:text-leagle-accent transition-colors flex items-center gap-2"><Key size={14} /> Authentication</a>
                                    <a href="#rate-limits" className="hover:text-leagle-accent transition-colors flex items-center gap-2"><Zap size={14} /> Rate Limits</a>
                                </nav>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Endpoints</h4>
                                <nav className="flex flex-col gap-4 text-xs font-medium text-gray-500">
                                    <a href="#search" className="hover:text-leagle-accent transition-colors flex items-center gap-2 font-mono italic">/v1/search</a>
                                    <a href="#compliance" className="hover:text-leagle-accent transition-colors flex items-center gap-2 font-mono italic">/v1/compliance</a>
                                    <a href="#impact" className="hover:text-leagle-accent transition-colors flex items-center gap-2 font-mono italic">/v1/impact</a>
                                    <a href="#monitor" className="hover:text-leagle-accent transition-colors flex items-center gap-2 font-mono italic">/v1/monitor</a>
                                </nav>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">SDKs</h4>
                                <nav className="flex flex-col gap-4 text-xs font-medium text-gray-500">
                                    <span className="opacity-50 cursor-not-allowed flex items-center gap-2 italic">Python (Coming Soon)</span>
                                    <span className="opacity-50 cursor-not-allowed flex items-center gap-2 italic">Node.js (Coming Soon)</span>
                                </nav>
                            </div>
                        </aside>

                        {/* Documentation Content */}
                        <div className="lg:col-span-3 space-y-24">
                            {/* Introduction */}
                            <section id="introduction" className="space-y-6">
                                <h2 className="text-3xl font-serif italic border-b border-white/5 pb-4">Introduction</h2>
                                <p className="text-gray-400 font-serif italic text-lg leading-relaxed">
                                    The Leagle Neural API provides programatic access to our Semantic Regulatory Index. It allows for advanced retrieval-augmented generation (RAG) workflows, automated policy auditing, and real-time risk synchronization outside of the Leagle Control Center.
                                </p>
                                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-sm space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-leagle-accent">Base Protocol URL</h3>
                                    <code className="block text-sm font-mono text-gray-300 select-all">https://api.leagle.ai/v1/neural</code>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section id="authentication" className="space-y-6">
                                <h2 className="text-3xl font-serif italic border-b border-white/5 pb-4">Authentication</h2>
                                <p className="text-gray-400 font-serif italic text-lg leading-relaxed">
                                    All API requests must be authenticated using an Institutional Protocol Key. These keys can be generated within the <Link href="/dashboard" className="text-leagle-accent hover:underline">Executive Dashboard</Link>.
                                </p>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 font-medium">Bear Authentication Header Example:</p>
                                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-sm overflow-x-auto">
                                        <pre className="text-sm font-mono text-indigo-400">
                                            {`Authorization: Bearer LGL_PROTOCOL_0x4f...892`}
                                        </pre>
                                    </div>
                                </div>
                            </section>

                            {/* Example Endpoint */}
                            <section id="search" className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-serif italic border-b border-white/5 pb-4">Semantic Search <span className="text-xs font-mono not-italic text-gray-600">GET /neural/search</span></h2>
                                    <p className="text-gray-400 font-serif italic leading-relaxed">
                                        Execute neural queries across the global regulatory mesh. Returns ranked vectors with attribution scores and institutional context.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Parameters</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                                <div>
                                                    <span className="text-sm font-mono text-leagle-accent">query</span>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">String | Required</p>
                                                </div>
                                                <p className="text-xs text-gray-400 font-serif italic">The semantic query string.</p>
                                            </div>
                                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                                <div>
                                                    <span className="text-sm font-mono text-leagle-accent">jurisdiction</span>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">Array | Optional</p>
                                                </div>
                                                <p className="text-xs text-gray-400 font-serif italic">Filter by regions (e.g. "uk", "eu").</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Example Request</h3>
                                        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-sm overflow-x-auto">
                                            <pre className="text-[11px] font-mono text-gray-400">
                                                {`curl -X GET "https://api.leagle.ai/v1/neural/search" \\
  -H "Authorization: Bearer $API_KEY" \\
  -d "query=UK financial compliance 2026" \\
  -d "limit=5"`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Sandbox Link */}
                            <section className="p-12 border border-leagle-accent/20 bg-leagle-accent/5 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 py-2 px-5 bg-leagle-accent text-black text-[8px] font-black uppercase tracking-[0.2em]">Sandbox Active</div>
                                <div className="space-y-6">
                                    <h4 className="text-2xl font-serif italic text-white leading-tight underline decoration-leagle-accent/40">Initialize API Sandbox</h4>
                                    <p className="text-gray-400 font-serif italic max-w-lg">
                                        Ready to build? Initialize your developer credentials and start building on our limited **Free Protocol** sandbox immediately.
                                    </p>
                                    <Link href="/pricing" className="inline-block px-10 py-5 bg-leagle-accent text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl">Create Developer Key</Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    <p>© 2026 Leagle API Protocols</p>
                    <div className="flex gap-8">
                        <Link href="/pricing" className="hover:text-white">Terms</Link>
                        <Link href="/api" className="hover:text-white">Uptime</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
