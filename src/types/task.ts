export type TaskStatus = 'done' | 'skipped' | 'partial' | 'pending';

export type TaskCategory = 'digital-twin' | 'hacking' | 'math' | 'custom';

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  customCategory?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface DailyProgress {
  taskId: string;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  timeSpent?: number; // minutes
  notes?: string;
}

export interface AppData {
  tasks: Task[];
  dailyProgress: Record<string, DailyProgress>; // key: `${taskId}-${date}`
  version: string;
  exportedAt?: string;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  'digital-twin': 'Digital Twin',
  'hacking': 'Hacking',
  'math': 'Math',
  'custom': 'Custom',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  done: 'Done',
  skipped: 'Skipped',
  partial: 'Partial',
  pending: 'Pending',
};
