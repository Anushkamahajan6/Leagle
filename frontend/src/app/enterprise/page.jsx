import LandingNavbar from '../components/LandingNavbar';
import { Lock, Shield, Globe, ArrowRight } from 'lucide-react';

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white">
            <LandingNavbar />

            <main className="pt-40">
                {/* Hero section */}
                <section className="relative px-6 pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)] -z-10" />
                    <div className="max-w-7xl mx-auto">
                        <header className="max-w-3xl mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <h2 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em] mb-6">Enterprise Protocol</h2>
                            <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">Sovereign Compliance for <span className="text-gradient">Global Operations</span></h1>
                            <p className="text-xl text-gray-500 font-serif italic leading-relaxed">Dedicated infrastructure, custom jurisdictional mapping, and Tier-IV security for the world's most demanding legal environments.</p>
                        </header>
                    </div>
                </section>

                <section className="py-40 px-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="glass-card p-24 border-leagle-accent/20 bg-leagle-accent/5 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 py-2 px-6 bg-leagle-accent text-black text-[10px] font-black uppercase tracking-[0.2em]">High Impact Protocol</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-serif italic">VPC Neural Deployment</h3>
                                        <p className="text-gray-500 font-serif italic leading-relaxed text-lg">
                                            Execute the Leagle Intelligence engine entirely within your own firewalled infrastructure. Zero data leakage, full air-gapped compatibility, and multi-tenant isolation.
                                        </p>
                                    </div>
                                    <ul className="space-y-6">
                                        {[
                                            { icon: <Lock size={16} />, text: "Custom HSM Key Management" },
                                            { icon: <Shield size={16} />, text: "FEDRAMP High / SOC2 Type II Alignment" },
                                            { icon: <Globe size={16} />, text: "Jurisdictional Data Residency Selection" }
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400">
                                                <div className="text-leagle-accent">{item.icon}</div>
                                                {item.text}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="px-12 py-5 bg-leagle-accent text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl shadow-leagle-accent/20">
                                        Request Protocol Briefing
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="aspect-square bg-leagle-accent/10 border border-leagle-accent/20 flex flex-col items-center justify-center p-12 text-center space-y-6">
                                        <Lock size={60} className="text-leagle-accent opacity-50" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Architecture Visualization</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-40 px-6 border-t border-white/5">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em]">Scalable Solutions</h2>
                        <h3 className="text-4xl font-serif italic">Designed for Complexity.</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left pt-12">
                            {[
                                { title: "On-Premise", desc: "Full hardware-accelerated neural local instances." },
                                { title: "Custom RAG", desc: "Private vector databases tuned to your firm's case history." },
                                { title: "API Fabric", desc: "Direct neural endpoints for integration with internal GRC tools." }
                            ].map((p, i) => (
                                <div key={i} className="space-y-4">
                                    <h4 className="text-white font-serif italic text-xl border-b border-leagle-accent/20 pb-4">{p.title}</h4>
                                    <p className="text-gray-500 text-sm font-serif italic leading-relaxed">{p.desc}</p>
                                </div>
                            ))}
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
