import React, { useState } from 'react';
import { useGoogleAccount } from '../contexts/GoogleAccountContext';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function AccountSwitcher() {
    const { currentUser, accounts, switchAccount } = useGoogleAccount();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface transition-colors"
            >
                <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-surface"
                />
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">{currentUser.name}</div>
                    <div className="text-xs text-secondary">{currentUser.email}</div>
                </div>
                <ChevronDown size={16} className="text-secondary" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-secondary/20 rounded-lg shadow-xl z-50">
                    <div className="p-2 space-y-1">
                        {accounts.map(account => (
                            <button
                                key={account.email}
                                onClick={() => {
                                    switchAccount(account.email);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-md hover:bg-background transition-colors text-left",
                                    currentUser.email === account.email && "bg-background"
                                )}
                            >
                                <img src={account.avatar} alt={account.name} className="w-8 h-8 rounded-full" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{account.name}</div>
                                    <div className="text-xs text-secondary">{account.email}</div>
                                </div>
                                {currentUser.email === account.email && <Check size={16} className="text-primary" />}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-secondary/20 p-2">
                        <button className="w-full text-center text-xs text-secondary hover:text-white py-1">
                            Add another account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
