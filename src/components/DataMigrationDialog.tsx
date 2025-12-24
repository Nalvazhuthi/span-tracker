import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Download, AlertTriangle } from 'lucide-react';
import { MergeStrategy } from '@/services/syncService';

interface DataMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (strategy: MergeStrategy) => Promise<void>;
  hasLocalData: boolean;
  hasCloudData: boolean;
  localTaskCount: number;
  cloudTaskCount: number;
}

export const DataMigrationDialog: React.FC<DataMigrationDialogProps> = ({
  open,
  onClose,
  onSelect,
  hasLocalData,
  hasCloudData,
  localTaskCount,
  cloudTaskCount,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (strategy: MergeStrategy) => {
    setLoading(true);
    setError(null);
    try {
      await onSelect(strategy);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred during sync');
    } finally {
      setLoading(false);
    }
  };

  // If only local data exists, just upload it
  if (hasLocalData && !hasCloudData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Sync Your Data</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have {localTaskCount} task{localTaskCount !== 1 ? 's' : ''} stored locally. 
              Would you like to upload them to the cloud?
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => handleSelect('upload-local')} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload to Cloud
            </Button>
            <Button variant="outline" onClick={() => handleSelect('cancel')} disabled={loading}>
              Keep Local Only
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If only cloud data exists, just download it
  if (!hasLocalData && hasCloudData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Welcome Back!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have {cloudTaskCount} task{cloudTaskCount !== 1 ? 's' : ''} in the cloud. 
              Loading them now...
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Both have data - show choice
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Data Conflict Detected</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You have data in both locations. How would you like to proceed?
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>Local:</strong> {localTaskCount} task{localTaskCount !== 1 ? 's' : ''}<br />
            <strong>Cloud:</strong> {cloudTaskCount} task{cloudTaskCount !== 1 ? 's' : ''}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={() => handleSelect('upload-local')} 
            disabled={loading}
            className="justify-start"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            <div className="text-left">
              <div>Upload Local Data</div>
              <div className="text-xs opacity-70">Replace cloud data with your local tasks</div>
            </div>
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => handleSelect('replace-with-cloud')} 
            disabled={loading}
            className="justify-start"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            <div className="text-left">
              <div>Use Cloud Data</div>
              <div className="text-xs opacity-70">Replace local data with cloud tasks</div>
            </div>
          </Button>

          <Button variant="outline" onClick={() => handleSelect('cancel')} disabled={loading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
