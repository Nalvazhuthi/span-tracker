import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Task, DailyProgress, AppData, TaskStatus } from '@/types/task';
import { loadAppData, saveAppData, generateProgressKey, getDefaultAppData } from '@/utils/storageUtils';
import { getToday, isDateInRange, getDaysInRange } from '@/utils/dateUtils';

interface TaskState {
  tasks: Task[];
  dailyProgress: Record<string, DailyProgress>;
  isLoading: boolean;
}

type TaskAction =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: DailyProgress }
  | { type: 'IMPORT_DATA'; payload: AppData }
  | { type: 'CLEAR_DATA' };

interface TaskContextValue extends TaskState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateProgress: (taskId: string, date: string, status: TaskStatus, timeSpent?: number, notes?: string) => void;
  getTasksForDate: (date: string) => Task[];
  getProgressForTask: (taskId: string, date: string) => DailyProgress | undefined;
  getTaskProgress: (taskId: string) => { completed: number; total: number; percentage: number };
  importData: (data: AppData) => void;
  exportData: () => AppData;
  clearData: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        dailyProgress: action.payload.dailyProgress,
        isLoading: false,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TASK':
      const taskId = action.payload;
      const newProgress = { ...state.dailyProgress };
      Object.keys(newProgress).forEach((key) => {
        if (key.startsWith(`${taskId}-`)) {
          delete newProgress[key];
        }
      });
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== taskId),
        dailyProgress: newProgress,
      };
    case 'UPDATE_PROGRESS':
      const key = generateProgressKey(action.payload.taskId, action.payload.date);
      return {
        ...state,
        dailyProgress: {
          ...state.dailyProgress,
          [key]: action.payload,
        },
      };
    case 'IMPORT_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        dailyProgress: action.payload.dailyProgress,
      };
    case 'CLEAR_DATA':
      return {
        tasks: [],
        dailyProgress: {},
        isLoading: false,
      };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    dailyProgress: {},
    isLoading: true,
  });

  useEffect(() => {
    const data = loadAppData();
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveAppData({
        tasks: state.tasks,
        dailyProgress: state.dailyProgress,
        version: '1.0.0',
      });
    }
  }, [state.tasks, state.dailyProgress, state.isLoading]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback((task: Task) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { ...task, updatedAt: new Date().toISOString() },
    });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const updateProgress = useCallback(
    (taskId: string, date: string, status: TaskStatus, timeSpent?: number, notes?: string) => {
      const progress: DailyProgress = {
        taskId,
        date,
        status,
        timeSpent,
        notes,
      };
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
    },
    []
  );

  const getTasksForDate = useCallback(
    (date: string): Task[] => {
      return state.tasks.filter((task) =>
        isDateInRange(date, task.startDate, task.endDate)
      );
    },
    [state.tasks]
  );

  const getProgressForTask = useCallback(
    (taskId: string, date: string): DailyProgress | undefined => {
      const key = generateProgressKey(taskId, date);
      return state.dailyProgress[key];
    },
    [state.dailyProgress]
  );

  const getTaskProgress = useCallback(
    (taskId: string): { completed: number; total: number; percentage: number } => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return { completed: 0, total: 0, percentage: 0 };

      const days = getDaysInRange(task.startDate, task.endDate);
      const today = getToday();
      
      // Only count days up to today
      const relevantDays = days.filter((d) => d <= today);
      const total = relevantDays.length;

      const completed = relevantDays.filter((date) => {
        const key = generateProgressKey(taskId, date);
        const progress = state.dailyProgress[key];
        return progress?.status === 'done';
      }).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    },
    [state.tasks, state.dailyProgress]
  );

  const importData = useCallback((data: AppData) => {
    dispatch({ type: 'IMPORT_DATA', payload: data });
  }, []);

  const exportData = useCallback((): AppData => {
    return {
      tasks: state.tasks,
      dailyProgress: state.dailyProgress,
      version: '1.0.0',
    };
  }, [state.tasks, state.dailyProgress]);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addTask,
      updateTask,
      deleteTask,
      updateProgress,
      getTasksForDate,
      getProgressForTask,
      getTaskProgress,
      importData,
      exportData,
      clearData,
    }),
    [
      state,
      addTask,
      updateTask,
      deleteTask,
      updateProgress,
      getTasksForDate,
      getProgressForTask,
      getTaskProgress,
      importData,
      exportData,
      clearData,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
