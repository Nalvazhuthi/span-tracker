export type TaskStatus = 'done' | 'skipped' | 'partial' | 'pending';

export type TaskCategory = 'digital-twin' | 'hacking' | 'math' | 'custom';

export type DayPattern = 'daily' | 'weekdays' | 'weekends' | 'custom';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Saturday = 6

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  customCategory?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dayPattern?: DayPattern;
  customDays?: Weekday[]; // Only used when dayPattern is 'custom'
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

export const DAY_PATTERN_LABELS: Record<DayPattern, string> = {
  daily: 'Every Day',
  weekdays: 'Weekdays Only',
  weekends: 'Weekends Only',
  custom: 'Custom Days',
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const WEEKDAY_FULL_LABELS: Record<Weekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
