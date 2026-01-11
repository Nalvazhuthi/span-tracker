import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTasks } from '@/context/TaskContext';
import { format, eachDayOfInterval, parseISO, getDay, startOfWeek, startOfYear, endOfYear, getYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { getToday, formatDate } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';
import { isTaskActiveOnDate } from '@/utils/taskDayUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const currentYear = new Date().getFullYear();

export const ConsistencyCalendar: React.FC = () => {
  const { tasks, dailyProgress } = useTasks();
  const today = getToday();
  const [timeRange, setTimeRange] = useState<string>(String(currentYear));
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(12);
  const [cellGap, setCellGap] = useState(2);

  // Calculate cell size based on container width
  useEffect(() => {
    const calculateCellSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const dayLabelWidth = 28; // Width for day labels
      const availableWidth = containerWidth - dayLabelWidth - 16; // padding

      // Calculate number of weeks based on time range
      let numWeeks: number;
      // All year views show ~53 weeks
      numWeeks = 53;

      // Calculate optimal cell size to fit all weeks
      const minGap = 2;
      const maxCellSize = 16;
      const minCellSize = 8;

      const optimalCellSize = Math.floor((availableWidth - (numWeeks - 1) * minGap) / numWeeks);
      const newCellSize = Math.min(maxCellSize, Math.max(minCellSize, optimalCellSize));

      setCellSize(newCellSize);
      setCellGap(newCellSize >= 12 ? 2 : 1);
    };

    calculateCellSize();
    window.addEventListener('resize', calculateCellSize);
    return () => window.removeEventListener('resize', calculateCellSize);
  }, [timeRange]);

  const years = useMemo(() => {
    if (tasks.length === 0) return [currentYear];
    const startYears = tasks.map(t => new Date(t.startDate).getFullYear());
    const minYear = Math.min(...startYears, currentYear);
    const yearsArr = [];
    for (let y = currentYear; y >= minYear; y--) {
      yearsArr.push(y);
    }
    return yearsArr;
  }, [tasks]);

  const { calendarData, weeks, monthLabels } = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    const year = parseInt(timeRange);
    startDate = startOfYear(new Date(year, 0, 1));
    endDate = endOfYear(new Date(year, 0, 1));

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
    <div ref={containerRef} className="rounded-xl border border-border bg-card p-4 sm:p-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold">Consistency</h3>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full">
        {/* Month labels */}
        <div
          className="flex mb-1 text-xs text-muted-foreground"
          style={{ marginLeft: `${28 + cellGap}px` }}
        >
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              style={{
                marginLeft: idx === 0 ? `${label.colStart * (cellSize + cellGap)}px` : undefined,
                width: idx < monthLabels.length - 1
                  ? `${(monthLabels[idx + 1].colStart - label.colStart) * (cellSize + cellGap)}px`
                  : 'auto',
              }}
              className="flex-shrink-0 truncate"
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex" style={{ gap: `${cellGap}px` }}>
          {/* Day labels */}
          <div className="flex flex-col text-xs text-muted-foreground" style={{ gap: `${cellGap}px`, width: '28px' }}>
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className="flex items-center justify-end pr-1"
                style={{ height: `${cellSize}px`, fontSize: cellSize <= 10 ? '9px' : '11px' }}
              >
                {idx % 2 === 1 ? day.slice(0, cellSize <= 10 ? 1 : 3) : ''}
              </div>
            ))}
          </div>

          {/* Contribution squares */}
          <TooltipProvider delayDuration={100}>
            <div className="flex flex-1" style={{ gap: `${cellGap}px` }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                  {/* Fill empty days at start of first week */}
                  {weekIdx === 0 &&
                    Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="rounded-sm"
                        style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                      />
                    ))}
                  {week.map((day) => (
                    <Tooltip key={day.dateStr}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'rounded-[3px] transition-colors cursor-default',
                            getLevelClass(day.level),
                            day.isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-card'
                          )}
                          style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
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

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[1px] bg-muted" />
          <div className="w-3 h-3 rounded-[1px] bg-contribution-level-1" />
          <div className="w-3 h-3 rounded-[1px] bg-contribution-level-2" />
          <div className="w-3 h-3 rounded-[1px] bg-contribution-level-3" />
          <div className="w-3 h-3 rounded-[1px] bg-contribution-level-4" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
