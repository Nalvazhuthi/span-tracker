import React, { useState, useEffect } from 'react';
import { useProfile, useSettings } from '@/context/SettingsContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AVATAR_COLORS } from '@/types/settings';
import { cn } from '@/lib/utils';
import { Check, User } from 'lucide-react';

export const ProfileSection: React.FC = () => {
  const { displayName, username, avatar, email, updateProfile, getInitials } = useProfile();
  const { isSyncing } = useSettings();
  
  const [localDisplayName, setLocalDisplayName] = useState(displayName);
  const [localUsername, setLocalUsername] = useState(username || '');
  const [selectedColor, setSelectedColor] = useState(avatar.color);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalDisplayName(displayName);
    setLocalUsername(username || '');
    setSelectedColor(avatar.color);
  }, [displayName, username, avatar.color]);

  const handleSave = async () => {
    await updateProfile({
      displayName: localDisplayName,
      username: localUsername || undefined,
      avatar: { type: 'initials', color: selectedColor },
    });
    setIsDirty(false);
  };

  const handleChange = (field: string, value: string) => {
    setIsDirty(true);
    if (field === 'displayName') setLocalDisplayName(value);
    if (field === 'username') setLocalUsername(value);
    if (field === 'color') setSelectedColor(value);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Profile</h3>
      </div>

      <div className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: selectedColor }}
          >
            {getInitials() || 'U'}
          </div>
          <div>
            <p className="font-medium">{localDisplayName || 'Your Name'}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Avatar Color */}
        <div className="space-y-2">
          <Label>Avatar Color</Label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleChange('color', color)}
                className={cn(
                  'h-8 w-8 rounded-full transition-all relative',
                  selectedColor === color && 'ring-2 ring-offset-2 ring-primary'
                )}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={localDisplayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            placeholder="Enter your name"
            maxLength={50}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username (optional)</Label>
          <Input
            id="username"
            value={localUsername}
            onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            maxLength={30}
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and underscores only
          </p>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        {/* Save Button */}
        {isDirty && (
          <Button onClick={handleSave} disabled={isSyncing} className="w-full">
            {isSyncing ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
};
