import React, { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { getDaysInRange, formatDate } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';
import { isTaskActiveOnDate } from '@/utils/taskDayUtils';
import { Flame, Award, Calendar, TrendingUp } from 'lucide-react';
import { subDays, parseISO, format } from 'date-fns';

interface StreakDisplayProps {
  dateRange: { start: string; end: string };
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ dateRange }) => {
  const { tasks, dailyProgress } = useTasks();

  const streakData = useMemo(() => {
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = dateRange.end;
    const startLimit = subDays(parseISO(dateRange.end), 365);

    while (parseISO(checkDate) >= startLimit) {
      // Filter tasks that should be active on this specific date
      const tasksOnDate = tasks.filter(
        (task) => 
          !task.isPaused && 
          isTaskActiveOnDate(task, checkDate)
      );

      if (tasksOnDate.length === 0) {
        const prevDate = subDays(parseISO(checkDate), 1);
        checkDate = formatDate(prevDate);
        continue;
      }

      const allDone = tasksOnDate.every((task) => {
        const key = generateProgressKey(task.id, checkDate);
        return dailyProgress[key]?.status === 'done';
      });

      if (!allDone) {
        // If checking today and it's not done, don't break streak yet
        // just don't count today
        if (checkDate === dateRange.end) {
          const prevDate = subDays(parseISO(checkDate), 1);
          checkDate = formatDate(prevDate);
          continue;
        }
        break;
      }
      currentStreak++;

      const prevDate = subDays(parseISO(checkDate), 1);
      checkDate = formatDate(prevDate);
    }

    // Calculate all streaks and find longest
    let longestStreak = 0;
    let longestStreakStart = '';
    let longestStreakEnd = '';
    let tempStreak = 0;
    let tempStreakStart = '';
    
    const allDates = getDaysInRange(dateRange.start, dateRange.end);
    const streakHistory: { start: string; end: string; length: number }[] = [];

    allDates.forEach((date, index) => {
      const tasksOnDate = tasks.filter(
        (task) => 
          !task.isPaused && 
          isTaskActiveOnDate(task, date)
      );

      if (tasksOnDate.length === 0) {
        if (tempStreak > 0) {
          streakHistory.push({
            start: tempStreakStart,
            end: allDates[index - 1] || date,
            length: tempStreak,
          });
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
            longestStreakStart = tempStreakStart;
            longestStreakEnd = allDates[index - 1] || date;
          }
          tempStreak = 0;
        }
        return;
      }

      const allDone = tasksOnDate.every((task) => {
        const key = generateProgressKey(task.id, date);
        return dailyProgress[key]?.status === 'done';
      });

      if (allDone) {
        if (tempStreak === 0) {
          tempStreakStart = date;
        }
        tempStreak++;
      } else {
        if (tempStreak > 0) {
          streakHistory.push({
            start: tempStreakStart,
            end: allDates[index - 1] || date,
            length: tempStreak,
          });
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
            longestStreakStart = tempStreakStart;
            longestStreakEnd = allDates[index - 1] || date;
          }
        }
        tempStreak = 0;
      }
    });

    // Handle final streak
    if (tempStreak > 0) {
      streakHistory.push({
        start: tempStreakStart,
        end: allDates[allDates.length - 1],
        length: tempStreak,
      });
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStart = tempStreakStart;
        longestStreakEnd = allDates[allDates.length - 1];
      }
    }

    // Calculate weekly average
    const weeks = Math.ceil(allDates.length / 7);
    const totalStreakDays = streakHistory.reduce((sum, s) => sum + s.length, 0);
    const weeklyAverage = weeks > 0 ? Math.round(totalStreakDays / weeks * 10) / 10 : 0;

    return {
      currentStreak,
      longestStreak,
      longestStreakStart,
      longestStreakEnd,
      weeklyAverage,
      totalStreaks: streakHistory.length,
      recentStreaks: streakHistory.slice(-5).reverse(),
    };
  }, [tasks, dailyProgress, dateRange]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-status-skipped fill-current" />
        Streak Tracking
      </h3>

      {/* Main Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-gradient-to-br from-status-skipped-bg to-status-skipped/10 p-4 text-center">
          <div className="text-3xl font-bold text-status-skipped mb-1 flex items-center justify-center gap-2">
            {streakData.currentStreak} <Flame className="h-8 w-8 fill-current" />
          </div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-category-digital-twin/10 to-category-digital-twin/5 p-4 text-center">
          <div className="text-3xl font-bold text-category-digital-twin mb-1 flex items-center justify-center gap-2">
            {streakData.longestStreak} <Award className="h-8 w-8" />
          </div>
          <div className="text-sm text-muted-foreground">Longest Streak</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{streakData.weeklyAverage}</div>
            <div className="text-xs text-muted-foreground">Avg streak days/week</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{streakData.totalStreaks}</div>
            <div className="text-xs text-muted-foreground">Total streaks</div>
          </div>
        </div>
      </div>

      {/* Longest Streak Details */}
      {streakData.longestStreak > 0 && streakData.longestStreakStart && (
        <div className="mb-4 p-3 rounded-lg border border-border bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Best streak period</div>
          <div className="text-sm font-medium">
            {format(parseISO(streakData.longestStreakStart), 'MMM d')} - {format(parseISO(streakData.longestStreakEnd), 'MMM d, yyyy')}
          </div>
        </div>
      )}

      {/* Recent Streaks */}
      {streakData.recentStreaks.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Recent Streaks</div>
          <div className="space-y-2">
            {streakData.recentStreaks.map((streak, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
              >
                <span className="text-muted-foreground">
                  {format(parseISO(streak.start), 'MMM d')} - {format(parseISO(streak.end), 'MMM d')}
                </span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  {streak.length} days <Flame className="h-3 w-3 fill-current text-status-skipped" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
