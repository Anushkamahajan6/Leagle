import LandingNavbar from '../components/LandingNavbar';
import { Target, Search, FileText, ArrowRight } from 'lucide-react';

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white">
            <LandingNavbar />

            <main className="pt-40">
                {/* Hero section */}
                <section className="relative px-6 pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)] -z-10" />
                    <div className="max-w-7xl mx-auto">
                        <header className="max-w-3xl mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <h2 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em] mb-6">Strategic Applications</h2>
                            <h1 className="text-5xl md:text-7xl font-serif italic mb-8 leading-tight">Tailored Intelligence for <span className="text-gradient">Every Department</span></h1>
                            <p className="text-xl text-gray-500 font-serif italic leading-relaxed">Specific compliance modules architected for the unique pressures of legal counsel, risk officers, and board executives.</p>
                        </header>
                    </div>
                </section>

                {/* Solutions Grid */}
                <section className="py-40 px-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {[
                                { title: "Legal Counsel", desc: "Automate policy-to-reg alignment and remediation roadmap generation.", icon: <FileText /> },
                                { title: "Risk & Compliance", desc: "Real-time alert monitoring across institutional data silos.", icon: <Search /> },
                                { title: "Executive Audit", desc: "High-level briefings and strategic impact verdicts for board members.", icon: <Target /> },
                                { title: "Policy Ingest", desc: "Rapid normalization of internal documents into queryable intelligence.", icon: <ArrowRight /> }
                            ].map((sol, i) => (
                                <div key={i} className="glass-card p-16 flex gap-10 hover:border-leagle-accent/30 transition-all rounded-sm group">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-leagle-accent group-hover:bg-leagle-accent/5 transition-all shrink-0">
                                        {sol.icon}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-serif italic">{sol.title}</h3>
                                        <p className="text-gray-500 font-serif italic leading-relaxed">{sol.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-40 px-6 border-t border-white/5 relative overflow-hidden">
                    <div className="max-w-3xl mx-auto text-center space-y-12">
                        <h2 className="text-leagle-accent text-[10px] font-black uppercase tracking-[0.3em]">Institutional Trust</h2>
                        <h3 className="text-4xl font-serif italic">Beyond Software. Legal Certainty.</h3>
                        <p className="text-lg text-gray-500 font-serif italic leading-relaxed">
                            "Leagle Intelligence gives our firm the horizontal oversight required to manage multi-jurisdictional compliance without expanding our headcount."
                        </p>
                        <div className="pt-8">
                            <div className="h-px w-20 bg-leagle-accent mx-auto mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white italic">General Counsel, Tier-1 Global Financial Hub</p>
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
