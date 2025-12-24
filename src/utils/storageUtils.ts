import { AppData, Task, DailyProgress } from '@/types/task';
import { generateId } from './idUtils';

const STORAGE_KEY = 'task-planner-data';
const APP_VERSION = '1.0.0';

export const generateProgressKey = (taskId: string, date: string): string => {
  return `${taskId}-${date}`;
};

export const getDefaultAppData = (): AppData => ({
  tasks: [],
  dailyProgress: {},
  version: APP_VERSION,
});

const migrateData = (data: Partial<AppData>): { data: Partial<AppData>; migrated: boolean } => {
  let migrated = false;
  const idMap: Record<string, string> = {};
  const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const currentTasks = Array.isArray(data.tasks) ? data.tasks : [];

  // Migrate tasks
  const migratedTasks = currentTasks.map(task => {
    if (task.id && !isUuid(task.id)) {
      const newId = generateId();
      idMap[task.id] = newId;
      migrated = true;
      return { ...task, id: newId };
    }
    return task;
  });

  if (!migrated) {
    return { data, migrated: false };
  }

  // Migrate progress
  const migratedProgress: Record<string, DailyProgress> = {};
  const currentProgress = data.dailyProgress || {};

  Object.entries(currentProgress).forEach(([key, progress]) => {
    const oldTaskId = progress.taskId;
    if (oldTaskId && idMap[oldTaskId]) {
      const newTaskId = idMap[oldTaskId];
      const newKey = generateProgressKey(newTaskId, progress.date);
      migratedProgress[newKey] = { ...progress, taskId: newTaskId };
    } else {
      migratedProgress[key] = progress;
    }
  });

  return {
    data: {
      ...data,
      tasks: migratedTasks,
      dailyProgress: migratedProgress,
    },
    migrated: true,
  };
};

export const loadAppData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultAppData();

    const parsed = JSON.parse(stored);
    const { data, migrated } = migrateData(parsed);

    const finalData = {
      ...getDefaultAppData(),
      ...data,
    } as AppData;

    if (migrated) {
      saveAppData(finalData);
    }

    return finalData;
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
    const parsed = JSON.parse(jsonString);

    // Validate basic structure
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error('Invalid data structure: missing tasks array');
    }

    if (!parsed.dailyProgress || typeof parsed.dailyProgress !== 'object') {
      throw new Error('Invalid data structure: missing dailyProgress object');
    }

    // Migrate if needed
    const { data } = migrateData(parsed);

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



export const clearAppData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
