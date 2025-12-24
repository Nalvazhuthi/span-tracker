import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, X, Circle, Clock, ChevronDown, ChevronUp, MessageSquare, ShieldCheck } from 'lucide-react';
import { subDays, format } from 'date-fns';

interface DailyTaskItemProps {
  task: Task;
  date: string;
}

const statusConfig: Record<TaskStatus, { icon: React.ElementType; label: string; bgClass: string; textClass: string }> = {
  done: { icon: Check, label: 'Done', bgClass: 'bg-green-100 dark:bg-green-900/30', textClass: 'text-green-600 dark:text-green-400' },
  skipped: { icon: X, label: 'Skipped', bgClass: 'bg-red-100 dark:bg-red-900/30', textClass: 'text-red-600 dark:text-red-400' },
  partial: { icon: Circle, label: 'Partial', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30', textClass: 'text-yellow-600 dark:text-yellow-400' },
  pending: { icon: Clock, label: 'Pending', bgClass: 'bg-secondary', textClass: 'text-muted-foreground' },
  'saved-the-day': { icon: ShieldCheck, label: 'Saved the Day', bgClass: 'bg-blue-100 dark:bg-blue-900/30', textClass: 'text-blue-600 dark:text-blue-400' },
};

const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

export const DailyTaskItem: React.FC<DailyTaskItemProps> = ({ task, date }) => {
  const { getProgressForTask, updateProgress } = useTasks();
  const progress = getProgressForTask(task.id, date);
  const currentStatus = progress?.status || 'pending';
  const [expanded, setExpanded] = useState(false);
  const [timeSpent, setTimeSpent] = useState(progress?.timeSpent?.toString() || '');
  const [notes, setNotes] = useState(progress?.notes || '');

  // Auto Carry Forward Logic
  useEffect(() => {
    if (task.autoCarryForward && !progress && !timeSpent && !notes) {
      // Check yesterday
      const yesterday = format(subDays(new Date(date), 1), 'yyyy-MM-dd');
      const prevProgress = getProgressForTask(task.id, yesterday);
      if (prevProgress) {
        if (prevProgress.timeSpent) setTimeSpent(prevProgress.timeSpent.toString());
        if (prevProgress.notes) setNotes(prevProgress.notes);
      }
    }
  }, [task.autoCarryForward, task.id, date, progress, getProgressForTask]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateProgress(task.id, date, newStatus, timeSpent ? parseInt(timeSpent) : undefined, notes || undefined);
  };

  const handleDetailsUpdate = () => {
    updateProgress(
      task.id,
      date,
      currentStatus,
      timeSpent ? parseInt(timeSpent) : undefined,
      notes || undefined
    );
  };

  const StatusIcon = statusConfig[currentStatus].icon;
  const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all duration-200',
        'hover:shadow-md',
        (currentStatus === 'done' || currentStatus === 'saved-the-day') && 'border-status-done/30 bg-status-done-bg/30'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', categoryColors[task.category])} />
            <span className="text-xs font-medium text-muted-foreground">{categoryLabel}</span>
            {task.priority === 'high' && (
              <span className="rounded-full bg-priority-high/10 px-2 py-0.5 text-xs font-medium text-priority-high">
                High
              </span>
            )}
          </div>

          {/* Task Name */}
          <h3 className={cn(
            'font-semibold text-foreground transition-all text-sm sm:text-base',
            (currentStatus === 'done' || currentStatus === 'saved-the-day') && 'line-through opacity-60'
          )}>
            {task.name}
          </h3>

          {/* Current Status Badge */}
          <div className={cn(
            'inline-flex items-center gap-1.5 mt-2 rounded-full px-2.5 py-1 text-xs font-medium',
            statusConfig[currentStatus].bgClass,
            statusConfig[currentStatus].textClass
          )}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig[currentStatus].label}
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {(['done', 'saved-the-day', 'partial', 'skipped'] as TaskStatus[]).map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = currentStatus === status;
            return (
              <Button
                key={status}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 sm:h-9 sm:w-9 rounded-lg transition-all',
                  isActive
                    ? cn(config.bgClass, config.textClass)
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => handleStatusChange(status)}
                title={config.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Hide details' : 'Add time & notes'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 space-y-3 animate-fade-in border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="number"
                placeholder="Minutes spent"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                onBlur={handleDetailsUpdate}
                className="h-9"
                min="0"
              />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
            <Textarea
              placeholder="Add notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleDetailsUpdate}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
