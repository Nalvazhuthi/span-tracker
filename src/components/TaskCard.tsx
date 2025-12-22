import React from 'react';
import { Task, CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDisplayDate, formatShortDate, getTotalDays, getToday } from '@/utils/dateUtils';
import { Edit2, Trash2, Calendar, Target, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

const priorityBadge: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-priority-high/10', text: 'text-priority-high' },
  medium: { bg: 'bg-priority-medium/10', text: 'text-priority-medium' },
  low: { bg: 'bg-priority-low/10', text: 'text-priority-low' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, compact = false }) => {
  const { getTaskProgress } = useTasks();
  const progress = getTaskProgress(task.id);
  const totalDays = getTotalDays(task.startDate, task.endDate);
  const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];
  const priority = task.priority || 'medium';
  const today = getToday();
  const isActive = task.startDate <= today && task.endDate >= today;
  const isUpcoming = task.startDate > today;
  const isCompleted = task.endDate < today;

  if (compact) {
    return (
      <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20">
        {/* Category Indicator */}
        <div className={cn('h-10 w-1.5 rounded-full shrink-0', categoryColors[task.category])} />
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{task.name}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium shrink-0', priorityBadge[priority].bg, priorityBadge[priority].text)}>
              {priority.charAt(0).toUpperCase()}
            </span>
            {isActive && (
              <span className="rounded-full bg-status-done-bg px-2 py-0.5 text-xs font-medium text-status-done shrink-0">
                Active
              </span>
            )}
            {isUpcoming && (
              <span className="rounded-full bg-status-partial-bg px-2 py-0.5 text-xs font-medium text-status-partial shrink-0">
                Upcoming
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{categoryLabel}</span>
            <span>{formatShortDate(task.startDate)} - {formatShortDate(task.endDate)}</span>
            <span>{totalDays}d</span>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="w-24">
            <Progress value={progress.percentage} className="h-2" />
          </div>
          <span className="text-sm font-medium w-10 text-right">{progress.percentage}%</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(task)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', categoryColors[task.category])} />
          <span className="text-xs font-medium text-muted-foreground">{categoryLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="rounded-full bg-status-done-bg px-2 py-0.5 text-xs font-medium text-status-done">
              Active
            </span>
          )}
          {isUpcoming && (
            <span className="rounded-full bg-status-partial-bg px-2 py-0.5 text-xs font-medium text-status-partial">
              Upcoming
            </span>
          )}
          {isCompleted && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Ended
            </span>
          )}
          <div className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityBadge[priority].bg, priorityBadge[priority].text)}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </div>
        </div>
      </div>

      {/* Task Name */}
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 line-clamp-2">{task.name}</h3>

      {/* Date Range */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
        <Calendar className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {formatDisplayDate(task.startDate)} - {formatDisplayDate(task.endDate)}
        </span>
        <span className="sm:hidden">
          {formatShortDate(task.startDate)} - {formatShortDate(task.endDate)}
        </span>
        <span className="text-xs">({totalDays}d)</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span>Progress</span>
          </div>
          <span className="font-semibold text-foreground">{progress.percentage}%</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {progress.completed} of {progress.total} days completed
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-9 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(task)}
        >
          <Edit2 className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-9 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
};
