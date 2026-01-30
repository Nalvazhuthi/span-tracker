import React from 'react';
import { Layout } from '@/components/Layout';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { PreferencesSection } from '@/components/settings/PreferencesSection';
import { DataSection } from '@/components/settings/DataSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, preferences, and data</p>
        </div>

        {/* Sign in prompt for guests */}
        {!user && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Sign in to sync your settings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your settings are saved locally. Sign in to sync across devices.
                </p>
              </div>
              <Button onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Profile Section - only show if logged in */}
        {user && <ProfileSection />}

        {/* Preferences Section */}
        <PreferencesSection />

        {/* Data Management Section */}
        <DataSection />

        {/* Account Section */}
        <AccountSection />

        {/* About Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">About TaskFlow</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>A personal task planning and progress tracking app.</p>
            <p>{user ? 'Your data syncs with the cloud.' : 'All data is stored locally in your browser.'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
