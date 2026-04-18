import LandingNavbar from '../components/LandingNavbar';
import { Zap, Shield, Target, ArrowRight, Check, Globe, Users } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white">
            <LandingNavbar />

            <main className="pt-40">
                {/* Hero section */}
                <section className="relative px-6 pb-40 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)] -z-10" />
                    <div className="max-w-7xl mx-auto text-center">
                        <header className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <h2 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em] font-sans">Institutional Protocols</h2>
                            <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">Scalable Intelligence for <span className="text-gradient">Risk Ecosystems</span></h1>
                            <p className="text-xl text-gray-500 font-serif italic leading-relaxed font-medium">From individual monitoring to institutional-grade risk shield and API infrastructure.</p>
                        </header>
                    </div>
                </section>

                <section className="py-20 px-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">
                            {/* Pulse Subscription */}
                            <div className="p-10 glass-card border-indigo-400/10 bg-white/2 rounded-sm flex flex-col items-center group hover:border-indigo-400/40 transition-all text-center">
                                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-400/20 rounded-full flex items-center justify-center mb-8 text-indigo-400">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-black text-white">Pulse Protocol</h3>
                                <p className="text-gray-500 text-[10px] mb-10 font-black uppercase tracking-widest italic">Base Intelligence</p>
                                <div className="text-4xl font-serif italic mb-10">$29<span className="text-sm text-gray-600 font-sans not-italic">/mo</span></div>
                                <ul className="text-left space-y-5 mb-12 flex-1 w-full">
                                    {["Real-time Alerting (1 Region)", "Premium Global Search", "UK Regulation Sync", "AI Context Persistence"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                            <Check size={14} className="text-indigo-400" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-5 border border-indigo-400/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-black transition-all">Initialize Pulse</button>
                            </div>

                            {/* Usage-Based Briefings */}
                            <div className="p-10 glass-card border-leagle-accent/10 bg-white/2 rounded-sm flex flex-col items-center group hover:border-leagle-accent/40 transition-all text-center">
                                <div className="w-12 h-12 bg-leagle-accent/10 border border-leagle-accent/20 rounded-full flex items-center justify-center mb-8 text-leagle-accent">
                                    <Zap size={20} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-black text-white">Strategic Briefs</h3>
                                <p className="text-gray-500 text-[10px] mb-10 font-black uppercase tracking-widest text-leagle-accent italic">Deep-Dive Analysis</p>
                                <div className="text-4xl font-serif italic mb-10">$49<span className="text-sm text-gray-600 font-sans not-italic">/ea</span></div>
                                <ul className="text-left space-y-5 mb-12 flex-1 w-full">
                                    {["Neural Gap Analysis", "Institutional Compliance Score", "Remediation Documentation", "PDF Executive Summary", "Audit Trail Preservation"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                            <Check size={14} className="text-leagle-accent" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-5 border border-leagle-accent/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-leagle-accent hover:text-black transition-all">Acquire Briefing</button>
                            </div>

                            {/* Risk Shield (Institutional) */}
                            <div className="p-10 glass-card border-leagle-accent/40 bg-leagle-accent/5 rounded-sm flex flex-col items-center relative overflow-hidden group text-center">
                                <div className="absolute top-0 right-0 py-2 px-5 bg-leagle-accent text-black text-[8px] font-black uppercase tracking-[0.2em]">Risk Neutral</div>
                                <div className="w-12 h-12 bg-leagle-accent/20 border border-leagle-accent/40 rounded-full flex items-center justify-center mb-8 text-leagle-accent">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-black text-white">Risk Shield</h3>
                                <p className="text-gray-500 text-[10px] mb-10 font-black uppercase tracking-widest text-leagle-accent italic">Institutional Suite</p>
                                <div className="text-4xl font-serif italic mb-10">$299<span className="text-sm text-gray-600 font-sans not-italic">/mo</span></div>
                                <ul className="text-left space-y-5 mb-12 flex-1 w-full">
                                    {["Certified Insurance Reporting", "Professional Liability Credit", "Shared Remiation Hub", "Admin Governance Protocol", "Institutional Multi-Region Sync"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-100 font-bold">
                                            <Check size={14} className="text-leagle-accent" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-5 bg-leagle-accent text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-leagle-accent/20">Deploy Shield</button>
                            </div>

                            {/* Neural Engine (API/Licensing) */}
                            <div className="p-10 glass-card border-white/5 bg-white/1 rounded-sm flex flex-col items-center group hover:border-white/20 transition-all text-center">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8">
                                    <Globe className="text-gray-500" size={20} />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest mb-2 font-black text-white">Neural Engine</h3>
                                <p className="text-gray-600 text-[10px] mb-10 font-black uppercase tracking-widest italic text-indigo-400">Infrastructure Layer</p>
                                <div className="text-4xl font-serif italic mb-10">Custom</div>
                                <ul className="text-left space-y-5 mb-12 flex-1 w-full">
                                    {["VPC Neural Deployment", "Regulatory API Licensing", "Portfolio Compliance Aggregators", "Unlimited Engine Inference", "SLA-Backed Performance"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <Check size={14} className="text-gray-600" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/enterprise" className="w-full py-5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Request License</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-40 px-6 border-t border-white/5 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-20">
                            <h4 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em] mb-4">Developer Protocols</h4>
                            <h5 className="text-4xl font-serif italic text-white leading-tight">Build on the Semantic Layer</h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                            <div className="p-12 border border-white/5 bg-white/2 rounded-sm text-left group hover:border-white/20 transition-all">
                                <h6 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 font-sans">Sandbox Protocol</h6>
                                <div className="text-3xl font-serif italic text-white mb-6">Free</div>
                                <ul className="space-y-4 mb-10">
                                    {["100 API Credits /mo", "Standard Latency", "Public Regulatory Set", "Community Support"].map((f, i) => (
                                        <li key={i} className="text-xs text-gray-400 flex items-center gap-2"><Check size={12} className="text-gray-500" /> {f}</li>
                                    ))}
                                </ul>
                                <button className="px-8 py-3 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest">Register Access</button>
                            </div>

                            <div className="p-12 border border-leagle-accent/20 bg-leagle-accent/5 rounded-sm text-left group hover:border-leagle-accent/40 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 py-2 px-5 bg-leagle-accent text-black text-[8px] font-black uppercase tracking-[0.2em]">High Throughput</div>
                                <h6 className="text-xs font-black uppercase tracking-widest text-leagle-accent mb-6 font-sans">Heavy Usage</h6>
                                <div className="text-3xl font-serif italic text-white mb-6">$0.05<span className="text-sm font-sans not-italic text-gray-500">/request</span></div>
                                <ul className="space-y-4 mb-10">
                                    {["Unlimited Throughput", "Priority Compute Queue", "Full Jurisdictional Sync", "Dedicated Dev Support"].map((f, i) => (
                                        <li key={i} className="text-xs text-gray-200 flex items-center gap-2"><Check size={12} className="text-leagle-accent" /> {f}</li>
                                    ))}
                                </ul>
                                <button className="px-8 py-3 bg-leagle-accent text-black text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all">Generate API Key</button>
                            </div>
                        </div>

                        <div className="p-16 border border-white/5 bg-white/2 rounded-sm flex flex-col md:flex-row items-center gap-12 justify-between text-left relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50" />
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Protocol Integration</h4>
                                <h5 className="text-4xl font-serif italic text-white leading-tight">Complex Institutional Ecosystems</h5>
                                <p className="text-lg text-gray-500 font-serif italic">Deploy the Leagle Neural Engine directly within your VPC for maximum sovereignty and portfolio-wide regulatory intelligence.</p>
                            </div>
                            <Link href="/enterprise" className="shrink-0 px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all text-center shadow-2xl">Partner Consultation</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Leagle Logo" className="w-7 h-7" />
                        <span className="text-lg font-bold font-serif italic">Leagle <span className="text-leagle-accent">Intelligence</span></span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© 2026 Leagle OS. All protocols active.</p>
                </div>
            </footer>
        </div>
    );
}
