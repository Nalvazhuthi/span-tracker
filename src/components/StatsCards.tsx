import React, { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Target, CheckCircle, Clock, TrendingUp, Flame, Award } from 'lucide-react';
import { getDaysInRange, formatDate } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';
import { subDays, parseISO } from 'date-fns';

interface StatsCardsProps {
  dateRange: { start: string; end: string };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ dateRange }) => {
  const { tasks, dailyProgress } = useTasks();

  const stats = useMemo(() => {
    let totalDays = 0;
    let completedDays = 0;
    let partialDays = 0;
    let skippedDays = 0;
    let totalTimeSpent = 0;

    tasks.forEach((task) => {
      // Get days within both the task range and the selected date range
      const taskDays = getDaysInRange(task.startDate, task.endDate);
      const filteredDays = taskDays.filter(
        (d) => d >= dateRange.start && d <= dateRange.end
      );
      
      totalDays += filteredDays.length;

      filteredDays.forEach((date) => {
        const key = generateProgressKey(task.id, date);
        const progress = dailyProgress[key];
        if (progress?.status === 'done') {
          completedDays++;
        } else if (progress?.status === 'partial') {
          partialDays++;
        } else if (progress?.status === 'skipped') {
          skippedDays++;
        }
        if (progress?.timeSpent) {
          totalTimeSpent += progress.timeSpent;
        }
      });
    });

    const overallPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const hoursSpent = Math.round(totalTimeSpent / 60 * 10) / 10;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = dateRange.end;
    const startLimit = subDays(parseISO(dateRange.end), 365); // Max 1 year back

    while (parseISO(checkDate) >= startLimit) {
      const tasksOnDate = tasks.filter(
        (task) => checkDate >= task.startDate && checkDate <= task.endDate
      );

      if (tasksOnDate.length === 0) {
        // Skip days with no tasks
        const prevDate = subDays(parseISO(checkDate), 1);
        checkDate = formatDate(prevDate);
        continue;
      }

      const allDone = tasksOnDate.every((task) => {
        const key = generateProgressKey(task.id, checkDate);
        return dailyProgress[key]?.status === 'done';
      });

      if (!allDone) break;
      currentStreak++;

      const prevDate = subDays(parseISO(checkDate), 1);
      checkDate = formatDate(prevDate);
    }

    // Calculate longest streak ever
    let longestStreak = 0;
    let tempStreak = 0;
    const allDates = getDaysInRange(dateRange.start, dateRange.end);

    allDates.forEach((date) => {
      const tasksOnDate = tasks.filter(
        (task) => date >= task.startDate && date <= task.endDate
      );

      if (tasksOnDate.length === 0) {
        return; // Skip days with no tasks
      }

      const allDone = tasksOnDate.every((task) => {
        const key = generateProgressKey(task.id, date);
        return dailyProgress[key]?.status === 'done';
      });

      if (allDone) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return {
      activeTasks: tasks.length,
      completedDays,
      partialDays,
      skippedDays,
      totalDays,
      overallPercentage,
      hoursSpent,
      currentStreak,
      longestStreak,
    };
  }, [tasks, dailyProgress, dateRange]);

  const cards = [
    {
      title: 'Completion Rate',
      value: `${stats.overallPercentage}%`,
      subtitle: `${stats.completedDays}/${stats.totalDays} days`,
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      subtitle: 'consecutive days',
      icon: Flame,
      color: 'text-status-skipped',
      bg: 'bg-status-skipped-bg',
    },
    {
      title: 'Longest Streak',
      value: stats.longestStreak,
      subtitle: 'best record',
      icon: Award,
      color: 'text-category-digital-twin',
      bg: 'bg-category-digital-twin/10',
    },
    {
      title: 'Hours Tracked',
      value: stats.hoursSpent,
      subtitle: 'total time',
      icon: Clock,
      color: 'text-status-partial',
      bg: 'bg-status-partial-bg',
    },
    {
      title: 'Completed',
      value: stats.completedDays,
      subtitle: 'task days done',
      icon: CheckCircle,
      color: 'text-status-done',
      bg: 'bg-status-done-bg',
    },
    {
      title: 'Partial / Skipped',
      value: `${stats.partialDays} / ${stats.skippedDays}`,
      subtitle: 'needs attention',
      icon: TrendingUp,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
