import '../entities/task.dart';
import '../entities/daily_progress.dart';

/// Abstract definition of the Task Data Source.
/// Implementations (Data Layer) will handle Local DB (Isar) + Remote (Supabase).
abstract class TaskRepository {
  // --- Tasks ---
  
  /// Get all tasks.
  Future<List<Task>> getAllTasks();

  /// Get a specific task by ID.
  Future<Task?> getTaskById(String id);

  /// Create or Update a task.
  Future<void> saveTask(Task task);

  /// Delete a task.
  Future<void> deleteTask(String id);

  // --- Progress ---

  /// Get progress for a specific task on a specific date.
  Future<DailyProgress?> getProgress(String taskId, DateTime date);

  /// Get all progress entries for a specific task.
  Future<List<DailyProgress>> getTaskHistory(String taskId);

  /// Save (upsert) a daily progress entry.
  Future<void> saveProgress(DailyProgress progress);

  /// Get all progress entries for a specific date range (for analytics).
  Future<List<DailyProgress>> getProgressInRange(DateTime start, DateTime end);

  // --- Sync / Bulk ---
  
  /// Watch tasks stream (for reactive UI updates).
  Stream<List<Task>> watchTasks();

  /// Watch progress stream for a specific day.
  Stream<List<DailyProgress>> watchProgressForDate(DateTime date);
}
