import React from 'react';
import { GoogleAccountProvider } from './contexts/GoogleAccountContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';

function App() {
    return (
        <Layout>
            <Dashboard />
        </Layout>
    );
}

export default App;
