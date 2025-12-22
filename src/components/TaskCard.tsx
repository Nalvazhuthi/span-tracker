import React from 'react';
import { Task, CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { useTasks } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDisplayDate, getTotalDays } from '@/utils/dateUtils';
import { Edit2, Trash2, Calendar, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
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

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { getTaskProgress } = useTasks();
  const progress = getTaskProgress(task.id);
  const totalDays = getTotalDays(task.startDate, task.endDate);
  const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];
  const priority = task.priority || 'medium';

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', categoryColors[task.category])} />
          <span className="text-xs font-medium text-muted-foreground">{categoryLabel}</span>
        </div>
        <div className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityBadge[priority].bg, priorityBadge[priority].text)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </div>
      </div>

      {/* Task Name */}
      <h3 className="text-lg font-semibold text-foreground mb-3">{task.name}</h3>

      {/* Date Range */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Calendar className="h-4 w-4" />
        <span>
          {formatDisplayDate(task.startDate)} - {formatDisplayDate(task.endDate)}
        </span>
        <span className="text-xs">({totalDays} days)</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-4 w-4" />
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
          className="flex-1 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(task)}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};
