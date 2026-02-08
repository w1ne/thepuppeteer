import React from 'react';
import { GoogleAccountProvider } from './contexts/GoogleAccountContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

function App() {
    return (
        <GoogleAccountProvider>
            <Layout>
                <Dashboard />
            </Layout>
        </GoogleAccountProvider>
    );
}

export default App;
