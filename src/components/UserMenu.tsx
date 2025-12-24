import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Cloud, LogIn, Settings } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { avatar, displayName, getInitials } = useProfile();
  const { isSyncing } = useSettings();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback 
              className="text-xs text-white font-medium"
              style={{ backgroundColor: avatar.color }}
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Cloud className={`h-4 w-4 ${isSyncing ? 'text-amber-500 animate-pulse' : 'text-green-500'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">
            {displayName || user.email}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Cloud className={`h-3 w-3 ${isSyncing ? 'text-amber-500' : 'text-green-500'}`} />
            {isSyncing ? 'Syncing...' : 'Synced to cloud'}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
