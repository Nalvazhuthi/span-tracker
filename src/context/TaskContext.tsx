import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import { Task, DailyProgress, AppData, TaskStatus } from '@/types/task';
import { loadAppData, saveAppData, generateProgressKey, getDefaultAppData } from '@/utils/storageUtils';
import { getToday, getDaysInRange } from '@/utils/dateUtils';
import { isTaskActiveOnDate, getActiveTaskDays } from '@/utils/taskDayUtils';
import { useAuth } from './AuthContext';
import { syncService, MergeStrategy } from '@/services/syncService';
import { DataMigrationDialog } from '@/components/DataMigrationDialog';

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
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    dailyProgress: {},
    isLoading: true,
  });

  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationInfo, setMigrationInfo] = useState({
    hasLocalData: false,
    hasCloudData: false,
    localTaskCount: 0,
    cloudTaskCount: 0,
  });
  const [syncChecked, setSyncChecked] = useState(false);

  // Load local data on mount
  useEffect(() => {
    const data = loadAppData();
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  // Check for sync when user logs in
  useEffect(() => {
    const checkSync = async () => {
      if (!user || syncChecked) return;
      
      setSyncChecked(true);
      
      const hasLocal = syncService.hasLocalData();
      const hasCloud = await syncService.hasCloudData(user.id);
      
      if (hasLocal || hasCloud) {
        const localData = syncService.getLocalData();
        let cloudTaskCount = 0;
        
        if (hasCloud) {
          const cloudData = await syncService.getCloudData(user.id);
          cloudTaskCount = cloudData.tasks.length;
          
          // If only cloud data, auto-sync
          if (!hasLocal) {
            dispatch({ type: 'LOAD_DATA', payload: cloudData });
            saveAppData(cloudData);
            return;
          }
        }
        
        // If only local data, auto-upload
        if (hasLocal && !hasCloud) {
          await syncService.uploadLocalToCloud(user.id);
          return;
        }
        
        // Both have data - show dialog
        if (hasLocal && hasCloud) {
          setMigrationInfo({
            hasLocalData: hasLocal,
            hasCloudData: hasCloud,
            localTaskCount: localData.tasks.length,
            cloudTaskCount,
          });
          setShowMigrationDialog(true);
        }
      }
    };
    
    checkSync();
  }, [user, syncChecked]);

  // Reset sync check when user logs out
  useEffect(() => {
    if (!user) {
      setSyncChecked(false);
    }
  }, [user]);

  // Save to localStorage and sync to cloud on changes
  useEffect(() => {
    if (!state.isLoading) {
      const data: AppData = {
        tasks: state.tasks,
        dailyProgress: state.dailyProgress,
        version: '1.0.0',
      };
      saveAppData(data);
    }
  }, [state.tasks, state.dailyProgress, state.isLoading]);

  const handleMigrationSelect = async (strategy: MergeStrategy) => {
    if (!user) return;
    
    if (strategy === 'upload-local') {
      await syncService.uploadLocalToCloud(user.id);
    } else if (strategy === 'replace-with-cloud') {
      const cloudData = await syncService.replaceLocalWithCloud(user.id);
      dispatch({ type: 'LOAD_DATA', payload: cloudData });
    }
    // 'cancel' - do nothing, keep local data
  };

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
    
    // Sync to cloud if logged in
    if (user) {
      syncService.syncTask(task, user.id).catch(console.error);
    }
  }, [user]);

  const updateTask = useCallback((task: Task) => {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    
    // Sync to cloud if logged in
    if (user) {
      syncService.syncTask(updatedTask, user.id).catch(console.error);
    }
  }, [user]);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
    
    // Sync to cloud if logged in
    if (user) {
      syncService.deleteTaskFromCloud(taskId).catch(console.error);
    }
  }, [user]);

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
      
      // Sync to cloud if logged in
      if (user) {
        syncService.syncProgress(progress, user.id).catch(console.error);
      }
    },
    [user]
  );

  const getTasksForDate = useCallback(
    (date: string): Task[] => {
      return state.tasks.filter((task) => isTaskActiveOnDate(task, date));
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
      
      // Only count days up to today that match the day pattern
      const relevantDays = getActiveTaskDays(task, days).filter((d) => d <= today);
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
    
    // Sync all to cloud if logged in
    if (user) {
      syncService.uploadLocalToCloud(user.id).catch(console.error);
    }
  }, [user]);

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

  return (
    <TaskContext.Provider value={value}>
      {children}
      <DataMigrationDialog
        open={showMigrationDialog}
        onClose={() => setShowMigrationDialog(false)}
        onSelect={handleMigrationSelect}
        hasLocalData={migrationInfo.hasLocalData}
        hasCloudData={migrationInfo.hasCloudData}
        localTaskCount={migrationInfo.localTaskCount}
        cloudTaskCount={migrationInfo.cloudTaskCount}
      />
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
