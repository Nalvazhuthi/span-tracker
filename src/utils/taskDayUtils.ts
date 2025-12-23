import { Task, DayPattern, Weekday } from '@/types/task';
import { parseISO, getDay } from 'date-fns';

/**
 * Check if a task should be active on a specific date based on its day pattern
 */
export const isTaskActiveOnDate = (task: Task, dateStr: string): boolean => {
  // First check if date is within task's date range
  if (dateStr < task.startDate || dateStr > task.endDate) {
    return false;
  }

  const date = parseISO(dateStr);
  const dayOfWeek = getDay(date) as Weekday; // 0 = Sunday, 6 = Saturday

  const pattern = task.dayPattern || 'daily';

  switch (pattern) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    case 'custom':
      return task.customDays?.includes(dayOfWeek) ?? true;
    default:
      return true;
  }
};

/**
 * Get the days a task is active for (considering day pattern)
 */
export const getActiveTaskDays = (task: Task, days: string[]): string[] => {
  return days.filter((day) => isTaskActiveOnDate(task, day));
};

/**
 * Get display text for a day pattern
 */
export const getDayPatternDisplayText = (pattern: DayPattern, customDays?: Weekday[]): string => {
  const dayNames: Record<Weekday, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };

  switch (pattern) {
    case 'daily':
      return 'Every day';
    case 'weekdays':
      return 'Mon-Fri';
    case 'weekends':
      return 'Sat-Sun';
    case 'custom':
      if (!customDays || customDays.length === 0) return 'No days selected';
      if (customDays.length === 7) return 'Every day';
      return customDays
        .sort((a, b) => a - b)
        .map((d) => dayNames[d])
        .join(', ');
    default:
      return 'Every day';
  }
};
