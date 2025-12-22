import React, { useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getToday, getDaysInRange } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';

export const StatsCards: React.FC = () => {
  const { tasks, dailyProgress } = useTasks();
  const today = getToday();

  const stats = useMemo(() => {
    let totalDays = 0;
    let completedDays = 0;
    let totalTimeSpent = 0;

    tasks.forEach((task) => {
      const days = getDaysInRange(task.startDate, task.endDate).filter((d) => d <= today);
      totalDays += days.length;

      days.forEach((date) => {
        const key = generateProgressKey(task.id, date);
        const progress = dailyProgress[key];
        if (progress?.status === 'done') {
          completedDays++;
        }
        if (progress?.timeSpent) {
          totalTimeSpent += progress.timeSpent;
        }
      });
    });

    const overallPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const hoursSpent = Math.round(totalTimeSpent / 60);

    // Calculate streak (consecutive days with all tasks completed)
    let streak = 0;
    let checkDate = today;
    while (true) {
      const tasksOnDate = tasks.filter(
        (task) => checkDate >= task.startDate && checkDate <= task.endDate
      );

      if (tasksOnDate.length === 0) {
        break;
      }

      const allDone = tasksOnDate.every((task) => {
        const key = generateProgressKey(task.id, checkDate);
        return dailyProgress[key]?.status === 'done';
      });

      if (!allDone) break;
      streak++;

      // Go to previous day
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = prevDate.toISOString().split('T')[0];
    }

    return {
      activeTasks: tasks.length,
      completedDays,
      totalDays,
      overallPercentage,
      hoursSpent,
      streak,
    };
  }, [tasks, dailyProgress, today]);

  const cards = [
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Days Completed',
      value: `${stats.completedDays}/${stats.totalDays}`,
      icon: CheckCircle,
      color: 'text-status-done',
      bg: 'bg-status-done-bg',
    },
    {
      title: 'Hours Tracked',
      value: stats.hoursSpent,
      icon: Clock,
      color: 'text-status-partial',
      bg: 'bg-status-partial-bg',
    },
    {
      title: 'Current Streak',
      value: `${stats.streak} days`,
      icon: TrendingUp,
      color: 'text-status-skipped',
      bg: 'bg-status-skipped-bg',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
