import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useTheme, THEME_OPTIONS, Theme } from '@/context/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, AVATAR_COLORS } from '@/types/settings';
import { cn } from '@/lib/utils';
import { Settings, Sun, Moon, Laptop, Check } from 'lucide-react';

export const PreferencesSection: React.FC = () => {
  const { preferences, updatePreferences } = useSettings();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme === 'ocean-light' || newTheme === 'forest-light' ? 'light' : 'dark' });
  };

  const lightThemes = THEME_OPTIONS.filter((t) => !t.isDark);
  const darkThemes = THEME_OPTIONS.filter((t) => t.isDark);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Preferences</h3>
      </div>

      <div className="space-y-6">
        {/* Task Defaults */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Task Defaults
          </h4>

          {/* Default Category */}
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultCategory">Default Category</Label>
            <Select
              value={preferences.defaultCategory}
              onValueChange={(value) => updatePreferences({ defaultCategory: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Priority */}
          <div className="flex items-center justify-between">
            <Label htmlFor="defaultPriority">Default Priority</Label>
            <Select
              value={preferences.defaultPriority}
              onValueChange={(value) => updatePreferences({ defaultPriority: value as 'high' | 'medium' | 'low' })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Color */}
          <div className="space-y-2">
            <Label>Default Task Color</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.slice(0, 10).map((color) => (
                <button
                  key={color}
                  onClick={() => updatePreferences({ defaultColor: color })}
                  className={cn(
                    'h-6 w-6 rounded-full transition-all relative',
                    preferences.defaultColor === color && 'ring-2 ring-offset-2 ring-primary'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {preferences.defaultColor === color && (
                    <Check className="h-3 w-3 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            App Settings
          </h4>

          {/* Week Start */}
          <div className="flex items-center justify-between">
            <Label htmlFor="weekStart">Week Starts On</Label>
            <Select
              value={preferences.weekStart}
              onValueChange={(value) => updatePreferences({ weekStart: value as 'monday' | 'sunday' })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analytics Preferences */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Analytics
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeSkipped">Include Skipped Days</Label>
              <p className="text-xs text-muted-foreground">Show skipped days in analytics charts</p>
            </div>
            <Switch
              id="includeSkipped"
              checked={preferences.analytics.includeSkipped}
              onCheckedChange={(checked) =>
                updatePreferences({
                  analytics: { ...preferences.analytics, includeSkipped: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showTimeSpent">Show Time Spent</Label>
              <p className="text-xs text-muted-foreground">Display time tracking metrics</p>
            </div>
            <Switch
              id="showTimeSpent"
              checked={preferences.analytics.showTimeSpent}
              onCheckedChange={(checked) =>
                updatePreferences({
                  analytics: { ...preferences.analytics, showTimeSpent: checked },
                })
              }
            />
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Appearance
          </h4>

          {/* Light Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sun className="h-4 w-4" />
              <span>Light Themes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {lightThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 text-left transition-all',
                    theme === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {theme === t.value && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Moon className="h-4 w-4" />
              <span>Dark Themes</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {darkThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 text-left transition-all',
                    theme === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {theme === t.value && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
