import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'task.freezed.dart';
part 'task.g.dart';

@freezed
class Task with _$Task {
  const factory Task({
    required String id,
    required String name,
    required TaskCategory category,
    String? customCategory,
    required DateTime startDate,
    required DateTime endDate,
    @Default(DayPattern.daily) DayPattern dayPattern,
    List<int>? customDays, // 0 = Sunday, 6 = Saturday
    String? color,
    @Default(TaskPriority.medium) TaskPriority priority,
    @Default(false) bool isPaused,
    @Default(false) bool autoCarryForward,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Task;

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
}
