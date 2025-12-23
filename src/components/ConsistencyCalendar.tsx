import React, { useMemo, useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { format, subDays, subWeeks, subMonths, subYears, eachDayOfInterval, parseISO, getDay, startOfWeek, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { getToday, formatDate } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';
import { isTaskActiveOnDate } from '@/utils/taskDayUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '1w', label: 'Last Week' },
  { value: '1m', label: 'Last Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: 'Last Year' },
];

export const ConsistencyCalendar: React.FC = () => {
  const { tasks, dailyProgress } = useTasks();
  const today = getToday();
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');

  const { calendarData, weeks, monthLabels } = useMemo(() => {
    const endDate = parseISO(today);
    let startDate: Date;

    switch (timeRange) {
      case '1w':
        startDate = subWeeks(endDate, 1);
        break;
      case '1m':
        startDate = subMonths(endDate, 1);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subMonths(endDate, 3);
    }

    // Align to start of week (Sunday)
    const alignedStart = startOfWeek(startDate);
    const days = eachDayOfInterval({ start: alignedStart, end: endDate });

    const data = days.map((day) => {
      const dateStr = formatDate(day);
      const isToday = dateStr === today;

      // Get all tasks active on this day
      const activeTasks = tasks.filter((task) => isTaskActiveOnDate(task, dateStr));

      if (activeTasks.length === 0) {
        return { date: day, dateStr, isToday, level: 0 as const, count: 0, total: 0 };
      }

      // Calculate completion ratio
      const completedCount = activeTasks.filter((task) => {
        const key = generateProgressKey(task.id, dateStr);
        return dailyProgress[key]?.status === 'done';
      }).length;

      const ratio = completedCount / activeTasks.length;
      let level: 0 | 1 | 2 | 3 | 4;
      if (ratio === 0) level = 0;
      else if (ratio < 0.25) level = 1;
      else if (ratio < 0.5) level = 2;
      else if (ratio < 1) level = 3;
      else level = 4;

      return { date: day, dateStr, isToday, level, count: completedCount, total: activeTasks.length };
    });

    // Group by weeks (columns)
    const weeksArr: (typeof data)[] = [];
    let currentWeek: typeof data = [];

    data.forEach((day) => {
      const dayOfWeek = getDay(day.date);
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    // Generate month labels
    const labels: { month: string; colStart: number }[] = [];
    let lastMonth = '';
    weeksArr.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const monthName = format(firstDay.date, 'MMM');
      if (monthName !== lastMonth) {
        labels.push({ month: monthName, colStart: weekIndex });
        lastMonth = monthName;
      }
    });

    return { calendarData: data, weeks: weeksArr, monthLabels: labels };
  }, [tasks, dailyProgress, today, timeRange]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getLevelClass = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0:
        return 'bg-muted hover:bg-muted/80';
      case 1:
        return 'bg-contribution-level-1 hover:bg-contribution-level-1/80';
      case 2:
        return 'bg-contribution-level-2 hover:bg-contribution-level-2/80';
      case 3:
        return 'bg-contribution-level-3 hover:bg-contribution-level-3/80';
      case 4:
        return 'bg-contribution-level-4 hover:bg-contribution-level-4/80';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold">Consistency</h3>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex mb-1 ml-8 text-xs text-muted-foreground">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                style={{
                  marginLeft: idx === 0 ? `${label.colStart * 14}px` : undefined,
                  width: idx < monthLabels.length - 1 
                    ? `${(monthLabels[idx + 1].colStart - label.colStart) * 14}px` 
                    : 'auto',
                }}
                className="flex-shrink-0"
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] text-xs text-muted-foreground pr-1">
              {weekDays.map((day, idx) => (
                <div key={day} className="h-3 flex items-center justify-end" style={{ height: '12px' }}>
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Contribution squares */}
            <TooltipProvider delayDuration={100}>
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2px]">
                    {/* Fill empty days at start of first week */}
                    {weekIdx === 0 &&
                      Array.from({ length: 7 - week.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-3 h-3 rounded-sm" />
                      ))}
                    {week.map((day) => (
                      <Tooltip key={day.dateStr}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'w-3 h-3 rounded-sm transition-colors cursor-default',
                              getLevelClass(day.level),
                              day.isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-card'
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{format(day.date, 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {day.total === 0
                              ? 'No tasks'
                              : `${day.count}/${day.total} completed`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-contribution-level-1" />
          <div className="w-3 h-3 rounded-sm bg-contribution-level-2" />
          <div className="w-3 h-3 rounded-sm bg-contribution-level-3" />
          <div className="w-3 h-3 rounded-sm bg-contribution-level-4" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
