import { supabase } from "@/integrations/supabase/client";
import { Task, DailyProgress, AppData } from "@/types/task";
import {
  loadAppData,
  saveAppData,
  getDefaultAppData,
} from "@/utils/storageUtils";

export type MergeStrategy = "upload-local" | "replace-with-cloud" | "cancel";

interface CloudTask {
  id: string;
  user_id: string;
  name: string;
  category: string;
  custom_category: string | null;
  start_date: string;
  end_date: string;
  day_pattern: string | null;
  custom_days: number[] | null;
  color: string | null;
  priority: string | null;
  is_paused: boolean | null;
  auto_carry_forward: boolean | null;
  created_at: string;
  updated_at: string;
}

interface CloudProgress {
  id: string;
  user_id: string;
  task_id: string;
  date: string;
  status: string;
  time_spent: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Convert local task to cloud format
const localToCloudTask = (
  task: Task,
  userId: string
): Omit<CloudTask, "created_at" | "updated_at"> => ({
  id: task.id,
  user_id: userId,
  name: task.name,
  category: task.category,
  custom_category: task.customCategory || null,
  start_date: task.startDate,
  end_date: task.endDate,
  day_pattern: task.dayPattern || "daily",
  custom_days: task.customDays || [],
  color: task.color || null,
  priority: task.priority || "medium",
  is_paused: task.isPaused || false,
  auto_carry_forward: task.autoCarryForward || false,
});

// Convert cloud task to local format
const cloudToLocalTask = (task: CloudTask): Task => ({
  id: task.id,
  name: task.name,
  category: task.category as Task["category"],
  customCategory: task.custom_category || undefined,
  startDate: task.start_date,
  endDate: task.end_date,
  dayPattern: (task.day_pattern as Task["dayPattern"]) || "daily",
  customDays: (task.custom_days as Task["customDays"]) || undefined,
  color: task.color || undefined,
  priority: (task.priority as Task["priority"]) || undefined,
  isPaused: task.is_paused || false,
  autoCarryForward: task.auto_carry_forward || false,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
});

// Convert local progress to cloud format
const localToCloudProgress = (
  progress: DailyProgress,
  userId: string
): Omit<CloudProgress, "id" | "created_at" | "updated_at"> => ({
  user_id: userId,
  task_id: progress.taskId,
  date: progress.date,
  status: progress.status,
  time_spent: progress.timeSpent || 0,
  notes: progress.notes || null,
});

// Convert cloud progress to local format
const cloudToLocalProgress = (progress: CloudProgress): DailyProgress => ({
  taskId: progress.task_id,
  date: progress.date,
  status: progress.status as DailyProgress["status"],
  timeSpent: progress.time_spent || undefined,
  notes: progress.notes || undefined,
});

// Generate progress key for local storage
const generateProgressKey = (taskId: string, date: string): string =>
  `${taskId}-${date}`;

export const syncService = {
  // Check if user has local data
  hasLocalData: (): boolean => {
    const data = loadAppData();
    return data.tasks.length > 0 || Object.keys(data.dailyProgress).length > 0;
  },

  // Check if user has cloud data
  hasCloudData: async (userId: string): Promise<boolean> => {
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return (count || 0) > 0;
  },

  // Get local data
  getLocalData: (): AppData => {
    return loadAppData();
  },

  // Get cloud data
  getCloudData: async (userId: string): Promise<AppData> => {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    if (tasksError) {
      console.error("Error fetching cloud tasks:", tasksError);
      throw tasksError;
    }

    const { data: progress, error: progressError } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error fetching cloud progress:", progressError);
      throw progressError;
    }

    const localTasks = (tasks || []).map(cloudToLocalTask);
    const dailyProgress: Record<string, DailyProgress> = {};

    (progress || []).forEach((p) => {
      const key = generateProgressKey(p.task_id, p.date);
      dailyProgress[key] = cloudToLocalProgress(p);
    });

    return {
      tasks: localTasks,
      dailyProgress,
      version: "1.0.0",
    };
  },

  // Smart upsert task that adapts to the database schema dynamically
  // It learns which columns are missing and avoids sending them in future requests
  smartUpsertTask: async (
    cloudTask: Omit<CloudTask, "created_at" | "updated_at">
  ): Promise<void> => {
    // Known new columns that might cause issues in legacy DBs
    const POTENTIAL_NEW_COLUMNS = ["is_paused", "auto_carry_forward"];

    // Create a payload that excludes known missing columns
    const payload: any = { ...cloudTask };

    // Remove fields that we already know are missing from the DB
    // @ts-ignore - globalMissingColumns is defined at module scope
    if (typeof globalMissingColumns !== "undefined") {
      globalMissingColumns.forEach((col: string) => {
        delete payload[col];
      });
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Try upsert
        const { error } = await supabase
          .from("tasks")
          .upsert(payload, { onConflict: "id" });

        if (!error) return; // Success!

        // Check for schema mismatch error
        if (
          error.code === "PGRST204" ||
          error.message?.includes("Could not find the")
        ) {
          // Extract column name from error message
          const match = error.message.match(/'(\w+)' column/);
          if (match && match[1]) {
            const missingColumn = match[1];
            console.warn(
              `Schema adaptation: Database is missing column '${missingColumn}'. Switching to legacy mode.`
            );

            // Aggressive Fallback: If one new column is missing, likely ALL are missing.
            // Remove the specific missing one AND all other potential new columns to save round trips.
            // @ts-ignore
            if (typeof globalMissingColumns !== "undefined") {
              globalMissingColumns.add(missingColumn);
              POTENTIAL_NEW_COLUMNS.forEach((col) =>
                globalMissingColumns.add(col)
              );
            }

            delete payload[missingColumn];
            POTENTIAL_NEW_COLUMNS.forEach((col) => delete payload[col]);

            attempt++;
            continue;
          }
        }

        // If we get here, it's a different error
        throw error;
      } catch (error: any) {
        if (attempt >= maxRetries) {
          console.error(
            "Final sync failure after schema adaptation attempts:",
            error
          );
          throw error;
        }
        throw error;
      }
    }
  },

  // Upload local data to cloud
  uploadLocalToCloud: async (userId: string): Promise<void> => {
    const localData = loadAppData();

    // Upload tasks
    for (const task of localData.tasks) {
      const cloudTask = localToCloudTask(task, userId);
      await syncService.smartUpsertTask(cloudTask);
    }

    // Upload progress
    for (const [key, progress] of Object.entries(localData.dailyProgress)) {
      const cloudProgress = localToCloudProgress(progress, userId);
      const { error } = await supabase
        .from("daily_progress")
        .upsert(cloudProgress, { onConflict: "task_id,date" });

      if (error) {
        console.error("Error uploading progress:", error);
        throw error;
      }
    }
  },

  // Replace local data with cloud data
  replaceLocalWithCloud: async (userId: string): Promise<AppData> => {
    const cloudData = await syncService.getCloudData(userId);
    saveAppData(cloudData);
    return cloudData;
  },

  // Sync a single task to cloud
  syncTask: async (task: Task, userId: string): Promise<void> => {
    const cloudTask = localToCloudTask(task, userId);
    await syncService.smartUpsertTask(cloudTask);
  },

  // Delete a task from cloud
  deleteTaskFromCloud: async (
    taskId: string,
    userId: string
  ): Promise<void> => {
    // First delete all associated progress entries
    const { error: progressError } = await supabase
      .from("daily_progress")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error deleting task progress from cloud:", progressError);
      throw progressError;
    }

    // Then delete the task itself
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting task from cloud:", error);
      throw error;
    }
  },

  // Sync progress to cloud
  syncProgress: async (
    progress: DailyProgress,
    userId: string
  ): Promise<void> => {
    const cloudProgress = localToCloudProgress(progress, userId);
    const { error } = await supabase
      .from("daily_progress")
      .upsert(cloudProgress, { onConflict: "task_id,date" });

    if (error) {
      console.error("Error syncing progress:", error);
      throw error;
    }
  },

  // Full sync from cloud to local
  syncFromCloud: async (userId: string): Promise<AppData> => {
    const cloudData = await syncService.getCloudData(userId);
    saveAppData(cloudData);
    return cloudData;
  },

  // Clear all cloud data for a user
  clearCloudData: async (userId: string): Promise<void> => {
    // First delete all progress entries
    const { error: progressError } = await supabase
      .from("daily_progress")
      .delete()
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error clearing cloud progress:", progressError);
      throw progressError;
    }

    // Then delete all tasks
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (tasksError) {
      console.error("Error clearing cloud tasks:", tasksError);
      throw tasksError;
    }
  },
};

// Track missing columns globally for the session to avoid repeated errors
const globalMissingColumns = new Set<string>();
