import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Play, Square, Cpu, Activity } from 'lucide-react';
import { fetchLogs, startAgent, stopAgent } from '../api/client';

interface AgentSurfaceProps {
    agentId: string | null; // If null, maybe show "Select Agent"
    agentName: string;
    status: string;
    currentTask?: string;
    onClose?: () => void;
}

import { motion, AnimatePresence } from 'framer-motion';

export function AgentSurface({ agentId, agentName, status, currentTask }: AgentSurfaceProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for logs
    useEffect(() => {
        if (!agentId) return;

        const interval = setInterval(async () => {
            try {
                const allLogs = await fetchLogs();
                // Filter logs for this agent if the API returns objects, 
                // but handle both string and object formats for robustness.
                const agentLogs = allLogs.filter((l: any) => {
                    if (typeof l === 'string') return l.includes(agentId);
                    return l.agentId === agentId;
                });
                setLogs(agentLogs);
            } catch (e) {
                console.error(e);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [agentId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [logs]);

    const handleStart = async () => {
        if (agentId) await startAgent(agentId);
    };

    const handleStop = async () => {
        if (agentId) await stopAgent(agentId);
    };

    return (
        <div className="h-full flex flex-col glass-card rounded-3xl overflow-hidden border-white/5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-white">{agentName}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                            <span className={`w-2 h-2 rounded-full ${status === 'WORKING' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-slate-600'}`} />
                            <span className={status === 'WORKING' ? 'text-emerald-400' : 'text-slate-500'}>
                                {status || 'OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleStart}
                        disabled={status === 'WORKING'}
                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl disabled:opacity-20 transition-all text-emerald-400 group active:scale-95"
                        title="Initiate Neural Loop"
                    >
                        <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={status !== 'WORKING'}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl disabled:opacity-20 transition-all text-red-400 group active:scale-95"
                        title="Terminate Loop"
                    >
                        <Square size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Task Info */}
            <AnimatePresence>
                {currentTask && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-3 overflow-hidden"
                    >
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter shrink-0">MISSION:</span>
                        <span className="text-xs font-medium text-blue-100 truncate">{currentTask}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terminal */}
            <div className="flex-1 p-6 bg-slate-950/80 font-mono text-[13px] overflow-y-auto custom-scrollbar" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50">
                        <Terminal size={32} className="mb-2" />
                        <div className="text-xs uppercase tracking-widest font-bold">Awaiting Telemetry...</div>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="mb-2 flex gap-4 group"
                        >
                            <span className="text-slate-600 select-none shrink-0 group-hover:text-slate-400 transition-colors">
                                {typeof log === 'string' ? log.split(']')[0].replace('[', '') : new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-slate-100 leading-relaxed font-medium">
                                {typeof log === 'string' ? log.split(']').slice(1).join(']') : log.content}
                            </span>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-2 text-[10px] font-black text-center text-slate-600 bg-white/5 border-t border-white/5 uppercase tracking-[0.2em]">
                Musketeer Protocol Syncing • v1.0.0
            </div>
        </div>
    );
}
