import React, { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { getToday, formatDate } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';

export const ConsistencyCalendar: React.FC = () => {
  const { tasks, dailyProgress } = useTasks();
  const today = getToday();
  const currentMonth = parseISO(today);

  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((day) => {
      const dateStr = formatDate(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isToday = dateStr === today;

      // Get all tasks active on this day
      const activeTasks = tasks.filter(
        (task) => dateStr >= task.startDate && dateStr <= task.endDate
      );

      if (activeTasks.length === 0) {
        return { date: day, dateStr, isCurrentMonth, isToday, status: 'no-tasks' as const };
      }

      // Calculate completion ratio
      const completedCount = activeTasks.filter((task) => {
        const key = generateProgressKey(task.id, dateStr);
        return dailyProgress[key]?.status === 'done';
      }).length;

      const ratio = completedCount / activeTasks.length;

      let status: 'complete' | 'partial' | 'incomplete' | 'no-tasks';
      if (ratio === 1) {
        status = 'complete';
      } else if (ratio > 0) {
        status = 'partial';
      } else {
        status = 'incomplete';
      }

      return { date: day, dateStr, isCurrentMonth, isToday, status, ratio };
    });
  }, [tasks, dailyProgress, currentMonth, today]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const statusStyles = {
    complete: 'bg-status-done text-status-done-bg',
    partial: 'bg-status-partial text-status-partial-bg',
    incomplete: 'bg-status-pending-bg text-status-pending',
    'no-tasks': 'bg-muted text-muted-foreground',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">
        {format(currentMonth, 'MMMM yyyy')} Consistency
      </h3>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map(({ date, dateStr, isCurrentMonth, isToday, status }) => (
          <div
            key={dateStr}
            className={cn(
              'aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all',
              !isCurrentMonth && 'opacity-30',
              isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
              statusStyles[status]
            )}
            title={`${format(date, 'MMM d, yyyy')} - ${status.replace('-', ' ')}`}
          >
            {format(date, 'd')}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded bg-status-done" />
          <span className="text-muted-foreground">Complete</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded bg-status-partial" />
          <span className="text-muted-foreground">Partial</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded bg-status-pending-bg" />
          <span className="text-muted-foreground">Incomplete</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="h-3 w-3 rounded bg-muted" />
          <span className="text-muted-foreground">No tasks</span>
        </div>
      </div>
    </div>
  );
};
