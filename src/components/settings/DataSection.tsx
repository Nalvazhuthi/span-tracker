import React, { useState, useRef } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { exportAppData, importAppData } from '@/utils/storageUtils';
import { toast } from 'sonner';
import { Download, Upload, Trash2, AlertTriangle, Database } from 'lucide-react';
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

export const DataSection: React.FC = () => {
  const { exportData, importData, clearData, tasks } = useTasks();
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [showClearWarning, setShowClearWarning] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const jsonString = exportAppData(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (tasks.length > 0) {
        setPendingImportData(content);
        setShowImportWarning(true);
      } else {
        performImport(content);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const performImport = (jsonString: string) => {
    const data = importAppData(jsonString);
    if (data) {
      importData(data);
      toast.success(`Imported ${data.tasks.length} tasks successfully`);
    } else {
      toast.error('Failed to import data. Invalid file format.');
    }
    setPendingImportData(null);
  };

  const handleClear = () => {
    clearData();
    toast.success('All data cleared');
    setShowClearWarning(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Data Management</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Export your data for backup or import a previous backup to restore your tasks and progress.
      </p>

      <div className="space-y-4">
        {/* Export */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <h4 className="font-medium">Export Data</h4>
            <p className="text-sm text-muted-foreground">Download all tasks and progress as JSON</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Import */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <h4 className="font-medium">Import Data</h4>
            <p className="text-sm text-muted-foreground">Restore from a JSON backup file</p>
          </div>
          <Button onClick={handleImportClick} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Clear */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div>
            <h4 className="font-medium text-destructive">Clear All Data</h4>
            <p className="text-sm text-muted-foreground">Permanently delete all tasks and progress</p>
          </div>
          <Button onClick={() => setShowClearWarning(true)} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Import Warning Dialog */}
      <AlertDialog open={showImportWarning} onOpenChange={setShowImportWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Replace Existing Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have existing tasks in your app. Importing will replace all current data with the backup file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImportData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingImportData && performImport(pendingImportData)}>
              Replace Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Warning Dialog */}
      <AlertDialog open={showClearWarning} onOpenChange={setShowClearWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your tasks and progress. This action cannot be undone. Consider exporting a backup first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
