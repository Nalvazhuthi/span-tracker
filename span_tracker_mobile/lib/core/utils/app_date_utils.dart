import 'package:intl/intl.dart';

class AppDateUtils {
  static final DateFormat _isoFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _displayFormat = DateFormat('MMM d, yyyy');
  static final DateFormat _shortFormat = DateFormat('MMM d');

  static DateTime parse(String dateStr) {
    return DateTime.parse(dateStr);
  }

  static String formatIso(DateTime date) {
    return _isoFormat.format(date);
  }

  static String formatDisplay(DateTime date) {
    return _displayFormat.format(date);
  }

  static String formatShort(DateTime date) {
    return _shortFormat.format(date);
  }

  static DateTime getToday() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  static bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  /// Returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  static int getWeekdayIndex(DateTime date) {
    // Dart: 1 = Mon, 7 = Sun
    // Target: 0 = Sun, 1 = Mon, ...
    return date.weekday == 7 ? 0 : date.weekday;
  }

  static List<DateTime> getDaysInRange(DateTime start, DateTime end) {
    if (start.isAfter(end)) return [];
    
    final days = <DateTime>[];
    // Normalize to start of day
    var current = DateTime(start.year, start.month, start.day);
    final endDate = DateTime(end.year, end.month, end.day);

    while (!current.isAfter(endDate)) {
      days.add(current);
      current = current.add(const Duration(days: 1));
    }
    return days;
  }
}
