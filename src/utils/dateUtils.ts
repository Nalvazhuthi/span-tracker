import { format, parseISO, eachDayOfInterval, isWithinInterval, startOfDay, differenceInDays } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: string): string => {
  return format(parseISO(date), 'MMM d, yyyy');
};

export const formatShortDate = (date: string): string => {
  return format(parseISO(date), 'MMM d');
};

export const getToday = (): string => {
  return formatDate(startOfDay(new Date()));
};

export const getDaysInRange = (startDate: string, endDate: string): string[] => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (start > end) return [];
  
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  const d = parseISO(date);
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  return isWithinInterval(d, { start, end });
};

export const getTotalDays = (startDate: string, endDate: string): number => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return differenceInDays(end, start) + 1;
};

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return start <= end;
};

export const getWeekday = (date: string): string => {
  return format(parseISO(date), 'EEEE');
};

export const getMonthYear = (date: string): string => {
  return format(parseISO(date), 'MMMM yyyy');
};
