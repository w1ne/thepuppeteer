import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUser } from '../api/client';

export interface GoogleProfile {
    name: string;
    email: string;
    avatar: string;
}

interface GoogleAccountContextType {
    currentUser: GoogleProfile;
    accounts: GoogleProfile[];
    switchAccount: (email: string) => void;
}

const GoogleAccountContext = createContext<GoogleAccountContextType | undefined>(undefined);

export function GoogleAccountProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<GoogleProfile>({
        name: 'Guest',
        email: 'loading...',
        avatar: ''
    });

    // For now, only 1 account from API
    const [accounts, setAccounts] = useState<GoogleProfile[]>([]);

    // Load from API on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await fetchUser();
                setCurrentUser(user);
                setAccounts([user]); // In future, API could return list
            } catch (e) {
                console.error("Failed to load user", e);
            }
        };
        loadUser();

        // Poll for changes (if CLI logs in a new user)
        const interval = setInterval(loadUser, 5000);
        return () => clearInterval(interval);
    }, []);

    const switchAccount = (email: string) => {
        // In a real app with multi-account support, we'd POST /api/auth/switch
        console.log('Switching account (not implemented in backend yet):', email);
    };

    return (
        <GoogleAccountContext.Provider value={{ currentUser, accounts, switchAccount }}>
            {children}
        </GoogleAccountContext.Provider>
    );
}

export function useGoogleAccount() {
    const context = useContext(GoogleAccountContext);
    if (context === undefined) {
        throw new Error('useGoogleAccount must be used within a GoogleAccountProvider');
    }
    return context;
}
