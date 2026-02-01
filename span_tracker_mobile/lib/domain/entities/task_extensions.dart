import '../entities/task.dart';
import '../entities/enums.dart';
import '../../core/utils/app_date_utils.dart';

extension TaskLogic on Task {
  /// Checks if the task is scheduled for the given [date].
  /// Takes [startDate], [endDate], and [dayPattern] into account.
  bool isActiveOnDate(DateTime date) {
    // 1. Check Date Range
    // Normalize dates to remove time components
    final checkDate = DateTime(date.year, date.month, date.day);
    final start = DateTime(startDate.year, startDate.month, startDate.day);
    final end = DateTime(endDate.year, endDate.month, endDate.day);

    if (checkDate.isBefore(start) || checkDate.isAfter(end)) {
      return false;
    }

    // 2. Check Day Pattern
    final dayIndex = AppDateUtils.getWeekdayIndex(checkDate); // 0=Sun, 6=Sat

    switch (dayPattern) {
      case DayPattern.daily:
        return true;
      case DayPattern.weekdays:
        // Mon(1) to Fri(5)
        return dayIndex >= 1 && dayIndex <= 5;
      case DayPattern.weekends:
        // Sun(0) or Sat(6)
        return dayIndex == 0 || dayIndex == 6;
      case DayPattern.custom:
        if (customDays == null || customDays!.isEmpty) return true; // Default to true if specified but empty? Or false? TS says `?? true`
        return customDays!.contains(dayIndex);
    }
  }

  /// Returns a list of dates within the range [start] to [end] where this task is active.
  List<DateTime> getActiveDates(DateTime start, DateTime end) {
    final allDays = AppDateUtils.getDaysInRange(start, end);
    return allDays.where((date) => isActiveOnDate(date)).toList();
  }

  /// Returns a human-readable string for the schedule (e.g., "Mon, Wed, Fri")
  String getScheduleText() {
    switch (dayPattern) {
      case DayPattern.daily:
        return 'Every day';
      case DayPattern.weekdays:
        return 'Mon-Fri';
      case DayPattern.weekends:
        return 'Sat-Sun';
      case DayPattern.custom:
        if (customDays == null || customDays!.isEmpty) return 'No days selected';
        if (customDays!.length == 7) return 'Every day';
        
        final dayNames = {
          0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
        };
        
        final sortedDays = List<int>.from(customDays!)..sort();
        return sortedDays.map((d) => dayNames[d]).join(', ');
    }
  }
}
