import React, { useEffect, useState } from 'react';
import { fetchTasks, fetchAgents, createTask, spawnAgent } from '../api/client';
import { AgentSurface } from './AgentSurface';
import { Plus, LayoutGrid, List, X, Loader2 } from 'lucide-react';
import { useGoogleAccount } from '../contexts/GoogleAccountContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
    const { currentUser } = useGoogleAccount();
    const [tasks, setTasks] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [taskTitle, setTaskTitle] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [agentName, setAgentName] = useState("");

    // Polling for data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [t, a] = await Promise.all([fetchTasks(), fetchAgents()]);
                setTasks(t);
                setAgents(a);
            } catch (e) { console.error(e); }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle) return;
        setIsLoading(true);
        try {
            await createTask(taskTitle, taskPriority);
            setIsTaskModalOpen(false);
            setTaskTitle("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpawnAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agentName) return;
        setIsLoading(true);
        try {
            await spawnAgent(agentName);
            setIsAgentModalOpen(false);
            setAgentName("");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    return (
        <div className="h-full flex overflow-hidden bg-slate-950 text-slate-100">
            {/* Left: Kanban / Tasks */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex-1 flex flex-col border-r border-white/5 min-w-[350px] max-w-xl bg-slate-900/40 backdrop-blur-md p-6 gap-6"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <List size={20} />
                        </div>
                        Mission Control
                    </h2>
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> New Task
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {tasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:via-blue-500/5 transition-all" />
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                            task.priority === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <span className="text-slate-500 text-[10px] font-mono opacity-50">#{task.id.slice(0, 6)}</span>
                                </div>
                                <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug">{task.title}</h3>
                                <div className="mt-4 text-xs text-slate-400 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                                    </div>
                                    {task.assignedAgentId && (
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">Assigned</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Welcome Msg */}
                <div className="mt-auto p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
                    <h3 className="font-bold text-indigo-300">Welcome back, {currentUser?.name}!</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        The swarm is operational. {agents.length} Musketeers are standing by.
                    </p>
                </div>
            </motion.div>

            {/* Right: Agents & Surface */}
            <div className="flex-1 flex flex-col p-8 bg-slate-950 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10">
                    <h2 className="text-3xl font-black flex items-center gap-4 tracking-tighter">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <LayoutGrid size={24} />
                        </div>
                        Neural Swarm
                    </h2>
                    <button
                        onClick={() => setIsAgentModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-2xl"
                    >
                        <Plus size={18} /> Spawn Musketeer
                    </button>
                </div>

                {/* Agent Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 mb-8 relative z-10">
                    {agents.map(agent => (
                        <motion.button
                            key={agent.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedAgentId(agent.id)}
                            className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden ${selectedAgentId === agent.id
                                    ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)]'
                                    : 'bg-slate-900/60 border-white/5 hover:border-white/20 shadow-xl'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-black text-lg tracking-tight truncate pr-4">{agent.name}</div>
                                <div className={`w-3 h-3 rounded-full ${agent.status === 'WORKING' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-slate-600'}`} />
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-4">ID: {agent.id.slice(0, 8)}</div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${agent.status === 'WORKING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {agent.status}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Selected Agent Surface */}
                <div className="flex-1 min-h-0 relative z-10">
                    <AnimatePresence mode="wait">
                        {selectedAgent ? (
                            <motion.div
                                key={selectedAgent.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <AgentSurface
                                    agentId={selectedAgent.id}
                                    agentName={selectedAgent.name}
                                    status={selectedAgent.status}
                                    currentTask={tasks.find((t: any) => t.id === selectedAgent.currentTaskId)?.title}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/20 backdrop-blur-sm"
                            >
                                <div className="p-6 bg-slate-800/50 rounded-full mb-4 text-slate-600">
                                    <LayoutGrid size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400">Neural Interface Offline</h3>
                                <p className="text-sm text-slate-600 mt-2">Activate a Musketeer to begin synchronization</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Task Modal */}
                {isTaskModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl shadow-blue-500/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black tracking-tight">Create Task</h3>
                                <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateTask} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                                    <input
                                        autoFocus
                                        value={taskTitle}
                                        onChange={e => setTaskTitle(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Analyze the target..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setTaskPriority(p)}
                                                className={`py-3 rounded-xl text-xs font-bold border transition-all ${taskPriority === p ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-950 border-white/10 text-slate-500 hover:border-white/20'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    disabled={isLoading}
                                    className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Deploy Task"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Agent Modal */}
                {isAgentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl shadow-indigo-500/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black tracking-tight">Spawn Musketeer</h3>
                                <button onClick={() => setIsAgentModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSpawnAgent} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Agent Name</label>
                                    <input
                                        autoFocus
                                        value={agentName}
                                        onChange={e => setAgentName(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. Athos, Porthos, Aramis..."
                                    />
                                </div>
                                <button
                                    disabled={isLoading}
                                    className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Summon Agent"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
