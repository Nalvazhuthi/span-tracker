import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-full fixed bottom-4 right-4 z-50 rounded-lg shadow-lg">
            <WifiOff className="h-4 w-4" />
            <span>You are currently offline. Changes may not be saved.</span>
        </div>
    );
};
