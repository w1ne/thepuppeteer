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

export function AgentSurface({ agentId, agentName, status, currentTask }: AgentSurfaceProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for logs
    useEffect(() => {
        if (!agentId) return;

        const interval = setInterval(async () => {
            try {
                const allLogs = await fetchLogs();
                // Filter logs for this agent (simple string matching for now as API returns strings)
                // Ideally API should return objects with agentId
                // Current API response: ["timestamp [id] msg", ...] (Mock)
                // Let's just show all logs for the "Swarm" feeling or filter by ID if present

                // Basic filtering assumption based on log format "[id]"
                const agentLogs = allLogs.filter((l: string) => l.includes(agentId));
                setLogs(agentLogs);
            } catch (e) {
                console.error(e);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [agentId]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleStart = async () => {
        if (agentId) await startAgent(agentId);
    };

    const handleStop = async () => {
        if (agentId) await stopAgent(agentId);
    };

    return (
        <div className="h-full flex flex-col bg-black/50 rounded-xl border border-secondary/20 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-surface/50 border-b border-secondary/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Cpu className="text-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{agentName || 'No Agent Selected'}</h2>
                        <div className="flex items-center gap-2 text-xs text-secondary">
                            <span className={`w-2 h-2 rounded-full ${status === 'WORKING' ? 'bg-success animate-pulse' : 'bg-secondary'}`} />
                            {status || 'OFFLINE'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleStart}
                        disabled={status === 'WORKING'}
                        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors text-success"
                        title="Start Loop"
                    >
                        <Play size={20} />
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={status !== 'WORKING'}
                        className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors text-error"
                        title="Stop Loop"
                    >
                        <Square size={20} />
                    </button>
                </div>
            </div>

            {/* Task Info */}
            {currentTask && (
                <div className="px-4 py-2 bg-warning/10 border-b border-warning/20">
                    <span className="text-xs font-mono text-warning">CURRENT TASK: {currentTask}</span>
                </div>
            )}

            {/* Terminal */}
            <div className="flex-1 p-4 bg-black font-mono text-sm overflow-y-auto" ref={scrollRef}>
                {logs.length === 0 ? (
                    <div className="text-secondary italic">Waiting for logs...</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="mb-1 break-words">
                            <span className="text-secondary select-none">{log.split(']')[0]}]</span>
                            <span className="text-green-400">{log.split(']').slice(1).join(']')}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-2 text-xs text-center text-secondary bg-surface/30">
                AGENT SURFACED CONNECTED
            </div>
        </div>
    );
}
