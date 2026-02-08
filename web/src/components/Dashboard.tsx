import React, { useEffect, useState } from 'react';
import { fetchTasks, fetchAgents, createTask, spawnAgent } from '../api/client';
import { AgentSurface } from './AgentSurface';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useGoogleAccount } from '../contexts/GoogleAccountContext';

export function Dashboard() {
    const { currentUser } = useGoogleAccount();
    const [tasks, setTasks] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

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

    const handleSpawn = async () => {
        const name = prompt("Agent Name:");
        if (name) await spawnAgent(name);
    };

    const handleCreateTask = async () => {
        const title = prompt("Task Title:");
        const priority = prompt("Priority (HIGH/MEDIUM/LOW):", "MEDIUM");
        if (title) await createTask(title, priority || 'MEDIUM');
    };

    const selectedAgent = agents.find(a => a.id === selectedAgentId);

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left: Kanban / Tasks */}
            <div className="flex-1 flex flex-col border-r border-secondary/20 min-w-[300px] max-w-2xl bg-surface/10 p-6 gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <List /> Work Items
                    </h2>
                    <button onClick={handleCreateTask} className="flex items-center gap-2 px-3 py-1.5 bg-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus size={16} /> New Task
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2">
                    {tasks.map(task => (
                        <div key={task.id} className="p-4 rounded-xl bg-surface border border-secondary/20 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${task.priority === 'HIGH' ? 'bg-error/20 text-error' :
                                        task.priority === 'LOW' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                                    }`}>
                                    {task.priority}
                                </span>
                                <span className="text-secondary text-xs font-mono">{task.id.slice(0, 6)}</span>
                            </div>
                            <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{task.title}</h3>
                            <div className="mt-2 text-xs text-secondary flex justify-between">
                                <span>{task.status}</span>
                                {task.assignedAgentId && <span>Assigned</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Welcome Msg (Personal Touch) */}
                <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                    <h3 className="font-bold text-accent">Welcome back, {currentUser.name}!</h3>
                    <p className="text-sm text-secondary mt-1">
                        {agents.length} agents are ready for your commands.
                    </p>
                </div>
            </div>

            {/* Right: Agents & Surface */}
            <div className="flex-1 flex flex-col p-6 bg-[#0a0a0a]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid /> Agent Swarm
                    </h2>
                    <button onClick={handleSpawn} className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-secondary/20 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                        <Plus size={16} /> Spawn Agent
                    </button>
                </div>

                {/* Agent Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {agents.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgentId(agent.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${selectedAgentId === agent.id
                                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                    : 'bg-surface/50 border-secondary/20 hover:bg-surface hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="font-bold truncate">{agent.name}</div>
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${agent.status === 'WORKING' ? 'bg-success animate-pulse' : 'bg-secondary'}`} />
                            </div>
                            <div className="text-xs text-secondary mt-1 font-mono">{agent.id.slice(0, 6)}</div>
                            <div className="mt-3 text-xs">
                                {agent.status === 'WORKING' ? (
                                    <span className="text-success">Executing Task...</span>
                                ) : (
                                    <span className="text-secondary">Idle</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Selected Agent Surface */}
                <div className="flex-1 min-h-0">
                    {selectedAgent ? (
                        <AgentSurface
                            agentId={selectedAgent.id}
                            agentName={selectedAgent.name}
                            status={selectedAgent.status}
                            currentTask={tasks.find((t: any) => t.id === selectedAgent.currentTaskId)?.title}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-secondary/20 rounded-xl">
                            <div className="text-center text-secondary">
                                <p>Select an agent to access its Neural Surface</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
