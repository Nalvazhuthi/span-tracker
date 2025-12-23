import React from 'react';
import { Layout } from '@/components/Layout';
import { DataManagement } from '@/components/DataManagement';
import { useTheme, THEME_OPTIONS, Theme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Sun, Moon, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const lightThemes = THEME_OPTIONS.filter((t) => !t.isDark);
  const darkThemes = THEME_OPTIONS.filter((t) => t.isDark);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your app preferences and data</p>
        </div>

        {/* Theme Selection */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          
          {/* Light Themes */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Sun className="h-4 w-4" />
              <span>Light Themes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lightThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 text-left transition-all',
                    theme === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {theme === t.value && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                  <div className="flex gap-1 mt-2">
                    <div className={cn('w-4 h-4 rounded', t.value === 'ocean-light' ? 'bg-blue-500' : 'bg-green-500')} />
                    <div className={cn('w-4 h-4 rounded', t.value === 'ocean-light' ? 'bg-blue-200' : 'bg-green-200')} />
                    <div className="w-4 h-4 rounded bg-gray-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Themes */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Moon className="h-4 w-4" />
              <span>Dark Themes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {darkThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 text-left transition-all',
                    theme === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {theme === t.value && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                  <div className="flex gap-1 mt-2">
                    <div className={cn('w-4 h-4 rounded', t.value === 'ocean-dark' ? 'bg-blue-400' : 'bg-purple-500')} />
                    <div className={cn('w-4 h-4 rounded', t.value === 'ocean-dark' ? 'bg-blue-700' : 'bg-purple-700')} />
                    <div className="w-4 h-4 rounded bg-gray-800" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DataManagement />

        <div className="rounded-xl border border-border bg-card p-6">
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
