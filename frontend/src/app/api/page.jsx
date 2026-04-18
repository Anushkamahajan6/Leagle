'use client';

import LandingNavbar from '../components/LandingNavbar';
import { Terminal, BookOpen, Key, Link as LinkIcon, Database, Shield, Zap, Check, Plus, Copy, RefreshCw, Search, ArrowRight, Play, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE = `${API_BASE_URL}/api/v1/neural`;

export default function APIPage() {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('LGL_PROTOCOL_DEFAULT_SANDBOX');
    const [query, setQuery] = useState('UK financial compliance 2026');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingKeys, setIsFetchingKeys] = useState(true);
    const [copied, setCopied] = useState(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setIsFetchingKeys(true);
        try {
            const response = await axios.get(`${API_BASE}/keys`);
            setKeys(response.data);
        } catch (error) {
            console.error('Failed to fetch keys:', error);
        } finally {
            setIsFetchingKeys(false);
        }
    };

    const handleGenerateKey = async () => {
        if (!newKeyName) return;
        try {
            const response = await axios.post(`${API_BASE}/keys`, { name: newKeyName });
            setKeys([response.data, ...keys]);
            setNewKeyName('');
            setShowKeyModal(false);
        } catch (error) {
            console.error('Failed to generate key:', error);
        }
    };

    const handleDeleteKey = async (id) => {
        try {
            await axios.delete(`${API_BASE}/keys/${id}`);
            setKeys(keys.filter(k => k.id !== id));
            if (selectedKey === keys.find(k => k.id === id)?.key) {
                setSelectedKey('LGL_PROTOCOL_DEFAULT_SANDBOX');
            }
        } catch (error) {
            console.error('Failed to delete key:', error);
        }
    };

    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const runNeuralTest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/search?query=${encodeURIComponent(query)}&limit=3`, {
                headers: { 'X-Protocol-Key': selectedKey }
            });
            setResults(response.data);
        } catch (error) {
            console.error('Neural Search Failed:', error);
            setResults(error.response?.data || { error: 'Failed to connect to Neural Engine.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--leagle-bg)] text-white">
            <LandingNavbar />

            <main className="pt-40 pb-40 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <header className="mb-32 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-leagle-accent/10 border border-leagle-accent/20 text-leagle-accent text-[9px] font-black uppercase tracking-widest rounded-sm">Institutional Protocol</span>
                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Live Storage Engine</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif italic leading-tight tracking-tighter">Protocol <span className="text-gradient">Console</span></h1>
                        <p className="text-xl text-gray-500 font-serif italic max-w-2xl leading-relaxed">
                            Manage your persistent institutional credentials and audit neural throughput in real-time.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* LEFT: Documentation (4 cols) */}
                        <div className="lg:col-span-4 space-y-16">
                            <section>
                                <h3 className="text-[10px] font-black text-leagle-accent uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <BookOpen size={12} /> Documentation
                                </h3>
                                <nav className="space-y-6 text-gray-600">
                                    {['Introduction', 'Authentication', 'Neural Search', 'Compliance Audits', 'Key Lifecycles'].map((item, idx) => (
                                        <div key={item} className={`text-sm font-serif italic cursor-pointer transition-all hover:text-white ${idx === 0 ? 'text-white translate-x-1' : ''}`}>
                                            {item}
                                        </div>
                                    ))}
                                </nav>
                            </section>

                            <section className="p-8 border border-white/5 bg-white/[0.01] rounded-sm space-y-6">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Storage Status</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-gray-600 uppercase font-black">Storage Mode</span>
                                        <span className="text-xs font-mono text-white">PostgreSQL/Async</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-gray-600 uppercase font-black">Active Keys</span>
                                        <span className="text-xs font-mono text-white">{keys.length + 1}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 w-full mt-2">
                                        <div className="h-full bg-leagle-accent w-full" />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT: Console & Playground (8 cols) */}
                        <div className="lg:col-span-8 space-y-24">

                            {/* Key Management */}
                            <section className="space-y-8">
                                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-serif italic text-white text-gradient">Protocol Keys</h2>
                                        <p className="text-xs text-gray-500 font-serif italic mt-1">Institutional credentials with persistent storage.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowKeyModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-leagle-accent transition-all"
                                    >
                                        <Plus size={14} /> Generate New Key
                                    </button>
                                </div>

                                {showKeyModal && (
                                    <div className="p-8 border border-leagle-accent/20 bg-leagle-accent/[0.02] rounded-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-2">Key Name (e.g., Compliance_Prod)</label>
                                            <input
                                                type="text"
                                                value={newKeyName}
                                                onChange={(e) => setNewKeyName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-sm py-4 px-6 text-sm font-serif italic focus:outline-none focus:border-leagle-accent transition-all"
                                                placeholder="Enter identifier..."
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleGenerateKey}
                                                className="px-6 py-3 bg-leagle-accent text-black text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all"
                                            >
                                                Generate Protocol Access
                                            </button>
                                            <button
                                                onClick={() => setShowKeyModal(false)}
                                                className="px-6 py-3 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="overflow-hidden border border-white/5 rounded-sm bg-white/[0.01]">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="px-6 py-4">Credential</th>
                                                <th className="px-6 py-4">Secret Protocol Key</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {/* Default Sandbox Key */}
                                            <tr className={`transition-colors ${selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'bg-leagle-accent/[0.03]' : ''}`}>
                                                <td className="px-6 py-5">
                                                    <div className="text-xs font-serif italic text-white">System Default</div>
                                                    <div className="text-[9px] text-gray-600 font-black mt-1">READ-ONLY SANDBOX</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <code className="text-[10px] font-mono text-indigo-400">LGL_PROTOCOL_DEFAULT...</code>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
                                                </td>
                                                <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedKey('LGL_PROTOCOL_DEFAULT_SANDBOX')}
                                                        className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'bg-leagle-accent text-black' : 'border border-white/10 text-gray-500 hover:text-white'}`}
                                                    >
                                                        {selectedKey === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? 'Using' : 'Use'}
                                                    </button>
                                                    <button onClick={() => handleCopy('LGL_PROTOCOL_DEFAULT_SANDBOX')} className="p-1.5 text-gray-600 hover:text-white transition-colors">
                                                        {copied === 'LGL_PROTOCOL_DEFAULT_SANDBOX' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* User keys */}
                                            {keys.map((k) => (
                                                <tr key={k.id} className={`transition-colors ${selectedKey === k.key ? 'bg-leagle-accent/[0.03]' : ''}`}>
                                                    <td className="px-6 py-5">
                                                        <div className="text-xs font-serif italic text-white">{k.name}</div>
                                                        <div className="text-[9px] text-gray-600 font-black mt-1">CREATED {new Date(k.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <code className="text-[10px] font-mono text-indigo-400">
                                                            {k.key.substring(0, 15)}...
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Institutional</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedKey(k.key)}
                                                            className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all ${selectedKey === k.key ? 'bg-leagle-accent text-black' : 'border border-white/10 text-gray-500 hover:text-white'}`}
                                                        >
                                                            {selectedKey === k.key ? 'Using' : 'Use'}
                                                        </button>
                                                        <button onClick={() => handleCopy(k.key)} className="p-1.5 text-gray-600 hover:text-white transition-colors">
                                                            {copied === k.key ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                        <button onClick={() => handleDeleteKey(k.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {isFetchingKeys && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-[10px] font-serif italic text-gray-600 animate-pulse">
                                                        Syncing with Neural Storage...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Neural Playground */}
                            <section className="space-y-8">
                                <div className="border-b border-white/5 pb-6 flex justify-between items-end">
                                    <div>
                                        <h2 className="text-2xl font-serif italic text-white text-gradient">Neural Playground</h2>
                                        <p className="text-xs text-gray-500 font-serif italic mt-1">Live Sandbox testing for semantic retrieval.</p>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                                        Using Key: <span className="text-leagle-accent font-mono ml-2">{selectedKey.substring(0, 15)}...</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-6 flex items-center text-gray-500 group-focus-within:text-leagle-accent transition-colors">
                                            <Search size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-6 pl-16 pr-32 text-lg font-serif italic placeholder:text-gray-700 focus:outline-none focus:border-leagle-accent transition-all"
                                            placeholder="Enter neural query..."
                                        />
                                        <button
                                            onClick={runNeuralTest}
                                            disabled={isLoading}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-leagle-accent text-black text-[9px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                                            Run Protocol
                                        </button>
                                    </div>

                                    {/* Console Output */}
                                    <div className="bg-[#050505] rounded-sm border border-white/5 overflow-hidden">
                                        <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Terminal size={12} className="text-gray-600" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 font-sans italic flex items-center gap-2">
                                                    SIGNAL_OUTPUT.JSON {isLoading && <span className="text-leagle-accent animate-pulse">| INFERENCING...</span>}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setResults(null)}
                                                className="text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-white"
                                            >
                                                Flush Console
                                            </button>
                                        </div>
                                        <div className="p-8 min-h-[300px] max-h-[600px] overflow-y-auto custom-scrollbar">
                                            {results ? (
                                                <pre className="text-sm font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">
                                                    {JSON.stringify(results, null, 2)}
                                                </pre>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 grayscale opacity-30">
                                                    <Database size={40} className="text-gray-600" />
                                                    <p className="text-sm font-serif italic text-gray-500">Awaiting semantic pulse signal...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Institutional Verification Card */}
                            <section className="p-12 border border-leagle-accent/10 bg-leagle-accent/[0.01] rounded-sm flex flex-col md:flex-row items-center gap-12 justify-between">
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-serif italic text-white flex items-center gap-3">
                                        <Shield size={24} className="text-leagle-accent" /> Institutional Compliance
                                    </h4>
                                    <p className="text-gray-500 font-serif italic max-w-lg">
                                        Every request made through your Protocol Keys is audited and signed for insurance-backed liability reduction.
                                    </p>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Protocol Version</span>
                                    <span className="text-2xl font-serif italic text-indigo-400">P-256V4</span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
