import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Task, DailyProgress, AppData, TaskStatus } from "@/types/task";
import { useAuth } from "./AuthContext";
import { syncService } from "@/services/syncService";
import { generateId } from "@/utils/idUtils";

interface TaskState {
  tasks: Task[];
  dailyProgress: Record<string, DailyProgress>;
  isLoading: boolean;
}

type TaskAction =
  | { type: "LOAD_DATA"; payload: AppData }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "UPDATE_PROGRESS"; payload: DailyProgress }
  | { type: "IMPORT_DATA"; payload: AppData }
  | { type: "CLEAR_DATA" };

interface TaskContextValue extends TaskState {
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateProgress: (
    taskId: string,
    date: string,
    status: TaskStatus,
    timeSpent?: number,
    notes?: string
  ) => void;
  getTasksForDate: (date: string) => Task[];
  getProgressForTask: (
    taskId: string,
    date: string
  ) => DailyProgress | undefined;
  getTaskProgress: (taskId: string) => {
    completed: number;
    total: number;
    percentage: number;
  };
  importData: (data: AppData) => void;
  exportData: () => AppData;
  clearData: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        tasks: action.payload.tasks,
        dailyProgress: action.payload.dailyProgress,
        isLoading: false,
      };
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TASK":
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
    case "UPDATE_PROGRESS":
      const key = generateProgressKey(
        action.payload.taskId,
        action.payload.date
      );
      return {
        ...state,
        dailyProgress: {
          ...state.dailyProgress,
          [key]: action.payload,
        },
      };
    case "IMPORT_DATA":
      return {
        ...state,
        tasks: action.payload.tasks,
        dailyProgress: action.payload.dailyProgress,
      };
    case "CLEAR_DATA":
      return {
        tasks: [],
        dailyProgress: {},
        isLoading: false,
      };
    default:
      return state;
  }
};

import { generateProgressKey, clearAppData } from "@/utils/storageUtils";
import { getToday, getDaysInRange } from "@/utils/dateUtils";
import { isTaskActiveOnDate, getActiveTaskDays } from "@/utils/taskDayUtils";

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    dailyProgress: {},
    isLoading: true,
  });

  // Load cloud data when user changes
  // Load cloud data when user logs in
  useEffect(() => {
    const fetchCloudData = async () => {
      if (!user) {
        dispatch({ type: "CLEAR_DATA" });
        return;
      }

      try {
        const cloudData = await syncService.getCloudData(user.id);
        dispatch({ type: "LOAD_DATA", payload: cloudData });
      } catch (error) {
        console.error("Failed to load cloud data:", error);
        // Start with empty data if cloud fetch fails
        dispatch({ type: "CLEAR_DATA" });
      }
    };

    fetchCloudData();
  }, [user]);

  // Note: Local storage persistence has been disabled.
  // Data is only stored in the cloud for logged-in users.
  // Anonymous users will lose their data on page refresh.

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const task: Task = {
        ...taskData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "ADD_TASK", payload: task });

      // Sync to cloud if logged in
      if (user) {
        syncService.syncTask(task, user.id).catch(console.error);
      }
    },
    [user]
  );

  const updateTask = useCallback(
    (task: Task) => {
      const updatedTask = { ...task, updatedAt: new Date().toISOString() };
      dispatch({ type: "UPDATE_TASK", payload: updatedTask });

      // Sync to cloud if logged in
      if (user) {
        syncService.syncTask(updatedTask, user.id).catch(console.error);
      }
    },
    [user]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      dispatch({ type: "DELETE_TASK", payload: taskId });

      // Sync to cloud if logged in
      if (user) {
        syncService.deleteTaskFromCloud(taskId, user.id).catch(console.error);
      }
    },
    [user]
  );

  const updateProgress = useCallback(
    (
      taskId: string,
      date: string,
      status: TaskStatus,
      timeSpent?: number,
      notes?: string
    ) => {
      const progress: DailyProgress = {
        taskId,
        date,
        status,
        timeSpent,
        notes,
      };
      dispatch({ type: "UPDATE_PROGRESS", payload: progress });

      // Sync to cloud if logged in
      if (user) {
        syncService.syncProgress(progress, user.id).catch(console.error);
      }
    },
    [user]
  );

  const getTasksForDate = useCallback(
    (date: string): Task[] => {
      // Filter out paused tasks unless we are editing/viewing in settings (viewing all)
      // The requirement says "Do not appear in daily tasks"
      return state.tasks
        .filter((task) => !task.isPaused)
        .filter((task) => isTaskActiveOnDate(task, date));
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
    (
      taskId: string
    ): { completed: number; total: number; percentage: number } => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return { completed: 0, total: 0, percentage: 0 };

      // Paused tasks shouldn't affect analytics, so if paused, maybe return 0/0?
      // Requirement: "Do not affect streaks or analytics"
      if (task.isPaused) return { completed: 0, total: 0, percentage: 0 };

      const days = getDaysInRange(task.startDate, task.endDate);

      // Count all days in range that match the day pattern
      const relevantDays = getActiveTaskDays(task, days);
      const total = relevantDays.length;

      const completed = relevantDays.filter((date) => {
        const key = generateProgressKey(taskId, date);
        const progress = state.dailyProgress[key];
        return (
          progress?.status === "done" || progress?.status === "saved-the-day"
        );
      }).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    },
    [state.tasks, state.dailyProgress]
  );

  const importData = useCallback(
    (data: AppData) => {
      dispatch({ type: "IMPORT_DATA", payload: data });

      // Sync all to cloud if logged in
      if (user) {
        syncService.uploadLocalToCloud(user.id).catch(console.error);
      }
    },
    [user]
  );

  const exportData = useCallback((): AppData => {
    return {
      tasks: state.tasks,
      dailyProgress: state.dailyProgress,
      version: "1.0.0",
    };
  }, [state.tasks, state.dailyProgress]);

  const clearData = useCallback(() => {
    dispatch({ type: "CLEAR_DATA" });

    // Clear local storage (if any residual data exists)
    clearAppData();

    // Clear cloud data if logged in
    if (user) {
      syncService.clearCloudData(user.id).catch(console.error);
    }
  }, [user]);

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
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
