'use client';

import Link from 'next/link';
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function LandingNavbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-[var(--leagle-bg)]/80 backdrop-blur-md border-b border-leagle-accent/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="Leagle Logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold tracking-tight text-white font-serif italic">
                            Leagle <span className="text-leagle-accent">Intelligence</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Link href="/platform" className="hover:text-leagle-accent transition-colors">Platform</Link>
                        <Link href="/solutions" className="hover:text-leagle-accent transition-colors">Solutions</Link>
                        <Link href="/api" className="hover:text-leagle-accent transition-colors">API</Link>
                        <Link href="/enterprise" className="hover:text-leagle-accent transition-colors">Enterprise</Link>
                        <Link href="/pricing" className="hover:text-leagle-accent transition-colors text-white">Pricing</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white px-4 transition-colors cursor-pointer">
                                Executive Sign In
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="btn-premium px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer">
                                Access Hub
                            </button>
                        </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                        <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white px-4 transition-colors">
                            Control Center
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
    );
}
