import React from "react";
import { Task, CATEGORY_LABELS, TaskCategory } from "@/types/task";
import { useTasks } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  formatShortDate,
  getTotalDays,
  getToday,
  getDaysInRange,
} from "@/utils/dateUtils";
import { getActiveTaskDays } from "@/utils/taskDayUtils";
import {
  Edit2,
  Trash2,
  Calendar,
  Target,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

const categoryColors: Record<TaskCategory, string> = {
  "digital-twin": "bg-category-digital-twin",
  hacking: "bg-category-hacking",
  math: "bg-category-math",
  custom: "bg-category-custom",
};

const priorityBadge: Record<string, { bg: string; text: string }> = {
  high: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  low: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const today = getToday();
  const { getTaskProgress } = useTasks();
  const { completed, total, percentage } = getTaskProgress(task.id);

  const progress = {
    completed,
    total,
    percentage,
  };

  const totalDays = getTotalDays(task.startDate, task.endDate);
  const categoryLabel =
    task.category === "custom"
      ? task.customCategory
      : CATEGORY_LABELS[task.category];
  const priority = task.priority || "medium";
  const isActive = task.startDate <= today && task.endDate >= today;
  const isUpcoming = task.startDate > today;
  const isCompleted = task.endDate < today;

  if (compact) {
    return (
      <div className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:bg-muted/30 transition-all duration-200">
        {/* Status Strip */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
            categoryColors[task.category],
          )}
        />

        <div className="pl-3 flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-4 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground truncate text-sm">
                {task.name}
              </span>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatShortDate(task.startDate)} -{" "}
                {formatShortDate(task.endDate)}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-muted text-[10px] uppercase font-medium tracking-wider">
                {categoryLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mini Progress */}
            <div className="hidden sm:flex flex-col items-end gap-1 min-w-[80px]">
              <div className="flex items-center gap-1 text-xs font-medium">
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-1.5 w-20" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                priorityBadge[priority].bg,
                priorityBadge[priority].text,
              )}
            >
              {priority} Priority
            </span>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                categoryColors[task.category],
              )}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {categoryLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(task)}
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>

      {/* Task Name */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {task.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatShortDate(task.startDate)} —{" "}
              {formatShortDate(task.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{totalDays} days</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-end justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium mb-0.5">
              Completion
            </span>
            <span className="font-bold text-xl">{progress.percentage}%</span>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <span className="font-medium text-foreground">
              {progress.completed}
            </span>{" "}
            / {progress.total} days
          </div>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>

      {/* Footer / Hover Action visual cue */}
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ArrowUpRight className="h-5 w-5 text-muted-foreground/50" />
      </div>
    </div>
  );
};
