import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const AccountSection: React.FC = () => {
  const { user, signOut } = useAuth();
  const { resetPreferences, isSyncing, syncWithCloud } = useSettings();
  
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleResetPreferences = async () => {
    await resetPreferences();
    setShowResetDialog(false);
  };

  const handleDeleteAccount = () => {
    // UI only - no backend logic
    toast.info('Account deletion is not yet available. Please contact support.');
    setShowDeleteDialog(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-6">Account</h3>

      <div className="space-y-4">
        {/* Sync Status */}
        {user && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium">Cloud Sync</h4>
              <p className="text-sm text-muted-foreground">
                {isSyncing ? 'Syncing...' : 'Your data is synced'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => syncWithCloud()}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        )}

        {/* Reset Preferences */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <h4 className="font-medium">Reset Preferences</h4>
            <p className="text-sm text-muted-foreground">
              Restore all settings to defaults
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowResetDialog(true)}
          >
            Reset
          </Button>
        </div>

        {/* Logout */}
        {user && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        )}

        {/* Delete Account */}
        {user && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and data
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Reset Preferences Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Reset All Preferences?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all your settings to their default values. Your tasks and progress will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPreferences}>
              Reset Preferences
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
