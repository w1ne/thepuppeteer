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
                    <div className="p-2 bg-accent/20 rounded-xl">
                        <Sparkles className="text-accent" size={24} />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">
                        Antigravity
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
