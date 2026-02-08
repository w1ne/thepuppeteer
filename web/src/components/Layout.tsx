import React from 'react';
import { AccountSwitcher } from './AccountSwitcher';
import { Sparkles } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            {/* Navbar */}
            <header className="h-16 border-b border-secondary/20 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        <Sparkles className="animate-pulse" size={24} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-white/80 to-blue-400 bg-clip-text text-transparent">
                        TheMusketeer
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Add other global controls here */}
                    <AccountSwitcher />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
