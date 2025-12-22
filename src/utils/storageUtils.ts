import { AppData, Task, DailyProgress } from '@/types/task';

const STORAGE_KEY = 'task-planner-data';
const APP_VERSION = '1.0.0';

export const getDefaultAppData = (): AppData => ({
  tasks: [],
  dailyProgress: {},
  version: APP_VERSION,
});

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultAppData();
    
    const data = JSON.parse(stored) as AppData;
    return {
      ...getDefaultAppData(),
      ...data,
    };
  } catch (error) {
    console.error('Failed to load app data:', error);
    return getDefaultAppData();
  }
};

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      version: APP_VERSION,
    }));
  } catch (error) {
    console.error('Failed to save app data:', error);
  }
};

export const exportAppData = (data: AppData): string => {
  return JSON.stringify({
    ...data,
    exportedAt: new Date().toISOString(),
  }, null, 2);
};

export const importAppData = (jsonString: string): AppData | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate basic structure
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid data structure: missing tasks array');
    }
    
    if (!data.dailyProgress || typeof data.dailyProgress !== 'object') {
      throw new Error('Invalid data structure: missing dailyProgress object');
    }
    
    return {
      tasks: data.tasks as Task[],
      dailyProgress: data.dailyProgress as Record<string, DailyProgress>,
      version: data.version || APP_VERSION,
    };
  } catch (error) {
    console.error('Failed to import app data:', error);
    return null;
  }
};

export const generateProgressKey = (taskId: string, date: string): string => {
  return `${taskId}-${date}`;
};

export const clearAppData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
