import React from 'react';
import { Layout } from '@/components/Layout';
import { DataManagement } from '@/components/DataManagement';

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your app preferences and data
          </p>
        </div>

        {/* Data Management */}
        <DataManagement />

        {/* App Info */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">About TaskFlow</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>A personal task planning and progress tracking app.</p>
            <p>All data is stored locally in your browser.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
