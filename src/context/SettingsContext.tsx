import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/settings';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SettingsContextValue {
  preferences: UserPreferences;
  isLoading: boolean;
  isSyncing: boolean;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = 'taskflow-preferences';

// Convert DB row to UserPreferences
const dbToPreferences = (row: any): UserPreferences => ({
  displayName: row.display_name || '',
  username: row.username || undefined,
  avatar: {
    type: (row.avatar_type as 'initials' | 'color') || 'initials',
    color: row.avatar_color || '#6366f1',
  },
  defaultCategory: row.default_category || 'custom',
  defaultColor: row.default_color || '#6366f1',
  defaultPriority: (row.default_priority as 'high' | 'medium' | 'low') || 'medium',
  weekStart: (row.week_start as 'monday' | 'sunday') || 'monday',
  theme: (row.theme as 'light' | 'dark' | 'system') || 'system',
  analytics: row.analytics_preferences || { includeSkipped: false, showTimeSpent: true },
  schemaVersion: row.schema_version || 1,
  updatedAt: row.updated_at || new Date().toISOString(),
});

// Convert UserPreferences to DB format
const preferencesToDb = (prefs: UserPreferences, userId: string) => ({
  user_id: userId,
  display_name: prefs.displayName || null,
  username: prefs.username || null,
  avatar_type: prefs.avatar.type,
  avatar_color: prefs.avatar.color,
  default_category: prefs.defaultCategory,
  default_color: prefs.defaultColor,
  default_priority: prefs.defaultPriority,
  week_start: prefs.weekStart,
  theme: prefs.theme,
  analytics_preferences: prefs.analytics,
  schema_version: prefs.schemaVersion,
  updated_at: new Date().toISOString(),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Save to localStorage
  const saveLocal = useCallback((prefs: UserPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, []);

  // Load from cloud
  const loadFromCloud = useCallback(async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
    
    return data ? dbToPreferences(data) : null;
  }, [user]);

  // Save to cloud
  const saveToCloud = useCallback(async (prefs: UserPreferences) => {
    if (!user) return;
    
    const dbData = preferencesToDb(prefs, user.id);
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert(dbData as any, { onConflict: 'user_id' });
    if (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }, [user]);

  // Sync with cloud on login
  const syncWithCloud = useCallback(async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const cloudPrefs = await loadFromCloud();
      
      if (cloudPrefs) {
        // Compare timestamps - use newer data
        const localTime = new Date(preferences.updatedAt).getTime();
        const cloudTime = new Date(cloudPrefs.updatedAt).getTime();
        
        if (cloudTime > localTime) {
          setPreferences(cloudPrefs);
          saveLocal(cloudPrefs);
        } else if (localTime > cloudTime) {
          await saveToCloud(preferences);
        }
      } else {
        // No cloud data - upload local
        await saveToCloud(preferences);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, preferences, loadFromCloud, saveToCloud, saveLocal]);

  // Sync on user change
  useEffect(() => {
    if (user) {
      syncWithCloud();
    }
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPrefs: UserPreferences = {
      ...preferences,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    setPreferences(newPrefs);
    saveLocal(newPrefs);
    
    // Sync to cloud in background (debounced)
    if (user) {
      try {
        await saveToCloud(newPrefs);
      } catch (error) {
        // Silent fail - data is saved locally
        console.error('Cloud sync failed:', error);
      }
    }
  }, [preferences, user, saveLocal, saveToCloud]);

  // Reset preferences
  const resetPreferences = useCallback(async () => {
    const resetPrefs = { ...DEFAULT_PREFERENCES, updatedAt: new Date().toISOString() };
    setPreferences(resetPrefs);
    saveLocal(resetPrefs);
    
    if (user) {
      try {
        await saveToCloud(resetPrefs);
        toast.success('Preferences reset to defaults');
      } catch (error) {
        toast.error('Failed to sync reset preferences');
      }
    } else {
      toast.success('Preferences reset to defaults');
    }
  }, [user, saveLocal, saveToCloud]);

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        isLoading,
        isSyncing,
        updatePreferences,
        resetPreferences,
        syncWithCloud,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

// Convenience hook for profile-specific operations
export const useProfile = () => {
  const { preferences, updatePreferences } = useSettings();
  const { user } = useAuth();
  
  const updateProfile = useCallback(async (updates: {
    displayName?: string;
    username?: string;
    avatar?: { type: 'initials' | 'color'; color: string };
  }) => {
    await updatePreferences(updates);
  }, [updatePreferences]);

  const getInitials = useCallback(() => {
    const name = preferences.displayName || user?.email || 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [preferences.displayName, user?.email]);

  return {
    displayName: preferences.displayName,
    username: preferences.username,
    avatar: preferences.avatar,
    email: user?.email,
    updateProfile,
    getInitials,
  };
};
