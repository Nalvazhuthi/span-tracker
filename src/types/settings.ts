// Settings & Profile Types

export interface AvatarSettings {
  type: 'initials' | 'color';
  color: string;
}

export interface AnalyticsPreferences {
  includeSkipped: boolean;
  showTimeSpent: boolean;
}

export interface UserPreferences {
  // Profile
  displayName: string;
  username?: string;
  avatar: AvatarSettings;
  
  // Task defaults
  defaultCategory: string;
  defaultColor: string;
  defaultPriority: 'high' | 'medium' | 'low';
  
  // App preferences
  weekStart: 'monday' | 'sunday';
  theme: 'light' | 'dark' | 'system';
  
  // Analytics
  analytics: AnalyticsPreferences;
  
  // Meta
  schemaVersion: number;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: '',
  username: undefined,
  avatar: {
    type: 'initials',
    color: '#6366f1',
  },
  defaultCategory: 'custom',
  defaultColor: '#6366f1',
  defaultPriority: 'medium',
  weekStart: 'monday',
  theme: 'system',
  analytics: {
    includeSkipped: false,
    showTimeSpent: true,
  },
  schemaVersion: 1,
  updatedAt: new Date().toISOString(),
};

export const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
];

export const CATEGORY_OPTIONS = [
  { value: 'custom', label: 'Custom' },
  { value: 'DigitalTwin', label: 'Digital Twin' },
  { value: 'Hacking', label: 'Hacking' },
  { value: 'Math', label: 'Math' },
];

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];
