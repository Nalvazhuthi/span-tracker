enum TaskCategory {
  digitalTwin,
  hacking,
  math,
  custom,
}

enum TaskStatus {
  done,
  skipped,
  partial,
  pending,
  savedTheDay, // Mapped from 'saved-the-day'
}

enum DayPattern {
  daily,
  weekdays,
  weekends,
  custom,
}

enum TaskPriority {
  low,
  medium,
  high,
}

enum Weekday {
  sunday,    // 0
  monday,    // 1
  tuesday,   // 2
  wednesday, // 3
  thursday,  // 4
  friday,    // 5
  saturday,  // 6
}
