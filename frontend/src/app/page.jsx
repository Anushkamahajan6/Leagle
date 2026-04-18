'use client';

import Link from 'next/link';
import { ChevronRight, Shield, Activity, Search, Globe, Lock, ArrowRight } from 'lucide-react';
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Home() {
    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white font-sans">
            {/* SaaS Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[var(--leagle-bg)]/80 backdrop-blur-md border-b border-leagle-accent/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img src="/logo.png" alt="Leagle Logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold tracking-tight text-white font-serif italic">
                                Leagle <span className="text-leagle-accent">Intelligence</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6 ml-4">
                            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Platform</Link>
                            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Solutions</Link>
                            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Enterprise</Link>
                            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium text-gray-400 hover:text-white px-4 transition-colors cursor-pointer">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-premium px-6 py-2.5 text-sm cursor-pointer">
                                    Get Started
                                </button>
                            </SignUpButton>
                        </Show>
                        <Show when="signed-in">
                            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white px-4 transition-colors">
                                Dashboard
                            </Link>
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-9 h-9 border border-leagle-accent/20"
                                    }
                                }}
                            />
                        </Show>
                    </div>
                </div>
            </nav>

            <main className="pt-32">
                {/* Hero Section */}
                <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden">
                    {/* Subtle Ambient Glow */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05)_0%,transparent_70%)] -z-10" />


                    <h1 className="text-5xl md:text-7xl font-serif font-medium mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Enterprise <span className="text-gradient">Regulatory Intelligence</span> & Compliance
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        Automate regulatory monitoring, risk assessment, and legal impact analysis with a high-fidelity intelligence platform built for global operations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        <Show when="signed-in">
                            <Link href="/dashboard" className="btn-premium px-8 py-4 text-base group">
                                Go to Control Center
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Show>
                        <Show when="signed-out">
                            <SignUpButton mode="modal">
                                <button className="btn-premium px-8 py-4 text-base group cursor-pointer">
                                    Start Scanning Now
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </SignUpButton>
                        </Show>
                        <Link href="#" className="px-8 py-4 text-base font-semibold border border-white/10 hover:bg-white/5 transition-all rounded-sm">
                            Request a Demo
                        </Link>
                    </div>

                    {/* Metrics / Trust Bar */}
                    <div className="mt-32 w-full grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5 animate-in fade-in duration-1000 delay-500">
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-serif font-bold text-leagle-accent">50+</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Active Jurisdictions</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-serif font-bold text-leagle-accent">Real-time</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Risk Synchronization</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-serif font-bold text-leagle-accent">99.9%</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Impact Precision</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-3xl font-serif font-bold text-leagle-accent">ISO</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Compliance Certified</span>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="px-6 py-24 bg-black/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <h2 className="text-3xl font-serif font-medium mb-4">Core Capabilities</h2>
                            <div className="h-1 w-20 bg-leagle-accent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <CapabilityCard
                                icon={<Search className="w-5 h-5 text-leagle-accent" />}
                                title="Semantic Ingest"
                                description="Advanced neural extraction of regulatory directives across global legal repositories."
                            />
                            <CapabilityCard
                                icon={<Activity className="w-5 h-5 text-leagle-accent" />}
                                title="Exposure Matrix"
                                description="Real-time heatmap of operational risks and compliance gaps in your policy framework."
                            />
                            <CapabilityCard
                                icon={<Lock className="w-5 h-5 text-leagle-accent" />}
                                title="Impact Analysis"
                                description="Predictive benchmarking of regulatory changes against internal company policies."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Leagle Logo" className="w-6 h-6" />
                        <span className="text-lg font-bold tracking-tight text-white font-serif italic">Leagle</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <span>&copy; 2026 Leagle Intelligence. All rights reserved.</span>
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function CapabilityCard({ icon, title, description }) {
    return (
        <div className="glass-card p-8 flex flex-col gap-4 hover:border-leagle-accent/30 transition-all group cursor-default">
            <div className="w-12 h-12 rounded-sm bg-leagle-accent/5 border border-leagle-accent/10 flex items-center justify-center group-hover:bg-leagle-accent/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-medium font-serif">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}
