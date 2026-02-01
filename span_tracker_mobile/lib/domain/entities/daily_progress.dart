import 'package:freezed_annotation/freezed_annotation.dart';
import 'enums.dart';

part 'daily_progress.freezed.dart';
part 'daily_progress.g.dart';

@freezed
class DailyProgress with _$DailyProgress {
  const factory DailyProgress({
    required String taskId,
    required DateTime date,
    required TaskStatus status,
    int? timeSpent, // minutes
    String? notes,
  }) = _DailyProgress;

  factory DailyProgress.fromJson(Map<String, dynamic> json) => _$DailyProgressFromJson(json);
}
