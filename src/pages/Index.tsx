import React, { useState, useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { DailyTaskItem } from '@/components/DailyTaskItem';
import { EmptyState } from '@/components/EmptyState';
import { getToday, formatDisplayDate, getWeekday, formatDate, getDaysInRange } from '@/utils/dateUtils';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Sparkles, Target, Clock, TrendingUp, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Task, CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { cn } from '@/lib/utils';
import { addDays, subDays, parseISO, format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { generateProgressKey } from '@/utils/storageUtils';

const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

const Index: React.FC = () => {
  const { tasks, getTasksForDate, dailyProgress, isLoading } = useTasks();
  const realToday = getToday();
  const [selectedDate, setSelectedDate] = useState(realToday);
  
  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const isViewingToday = selectedDate === realToday;

  // Calculate quick stats for today
  const todayStats = useMemo(() => {
    const todayTasks = getTasksForDate(realToday);
    const completed = todayTasks.filter((task) => {
      const key = generateProgressKey(task.id, realToday);
      return dailyProgress[key]?.status === 'done';
    }).length;
    
    return {
      total: todayTasks.length,
      completed,
      remaining: todayTasks.length - completed,
    };
  }, [tasks, dailyProgress, realToday, getTasksForDate]);

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const upcoming: { date: string; tasks: Task[]; label: string }[] = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = formatDate(addDays(parseISO(realToday), i));
      const dayTasks = getTasksForDate(date);
      
      if (dayTasks.length > 0) {
        let label = format(parseISO(date), 'EEEE, MMM d');
        if (i === 1) label = 'Tomorrow';
        
        upcoming.push({ date, tasks: dayTasks, label });
      }
    }
    
    return upcoming;
  }, [tasks, realToday, getTasksForDate]);

  // Get tasks starting soon (within next 3 days)
  const startingSoon = useMemo(() => {
    return tasks.filter((task) => {
      const startDate = parseISO(task.startDate);
      const today = parseISO(realToday);
      const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 3;
    });
  }, [tasks, realToday]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = parseISO(selectedDate);
    const newDate = direction === 'next' ? addDays(current, 1) : subDays(current, 1);
    setSelectedDate(formatDate(newDate));
  };

  const goToToday = () => {
    setSelectedDate(realToday);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Quick Stats - Only show when viewing today */}
        {isViewingToday && tasks.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">{todayStats.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">Today's Tasks</p>
            </div>
            <div className="rounded-xl border border-border bg-status-done-bg p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-status-done" />
                <span className="text-xl sm:text-2xl font-bold text-status-done">{todayStats.completed}</span>
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-xl border border-border bg-status-skipped-bg p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-status-skipped" />
                <span className="text-xl sm:text-2xl font-bold text-status-skipped">{todayStats.remaining}</span>
              </div>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        )}

        {/* Date Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>{getWeekday(selectedDate)}</span>
                {isViewingToday && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Today
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {formatDisplayDate(selectedDate)}
              </h1>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isViewingToday && (
              <Button variant="outline" size="sm" onClick={goToToday}>
                Go to Today
              </Button>
            )}
            <Button asChild size="sm">
              <Link to="/tasks">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {isViewingToday ? "Today's Tasks" : "Tasks for this day"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
            </span>
          </div>

          {tasksForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {tasksForSelectedDate.map((task) => (
                <DailyTaskItem key={task.id} task={task} date={selectedDate} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No Tasks Scheduled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isViewingToday 
                  ? "You're all clear for today! Create a task to get started."
                  : "No tasks scheduled for this date."}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Starting Soon Section */}
        {isViewingToday && startingSoon.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-status-partial" />
              Starting Soon
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {startingSoon.map((task) => {
                const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn('h-2.5 w-2.5 rounded-full', categoryColors[task.category])} />
                      <span className="text-xs text-muted-foreground">{categoryLabel}</span>
                    </div>
                    <h3 className="font-medium text-foreground mb-1 line-clamp-1">{task.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Starts {format(parseISO(task.startDate), 'EEEE, MMM d')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Tasks Section */}
        {isViewingToday && upcomingTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-category-math" />
              Upcoming Week
            </h2>
            <div className="space-y-4">
              {upcomingTasks.slice(0, 4).map(({ date, tasks: dayTasks, label }) => (
                <div
                  key={date}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedDate(date)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <div
                            key={task.id}
                            className={cn(
                              'h-6 w-6 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium text-primary-foreground',
                              categoryColors[task.category]
                            )}
                            style={{ zIndex: 3 - i }}
                          >
                            {task.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{dayTasks.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for New Users */}
        {tasks.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Welcome to TaskFlow!"
            description="Create your first long-range task to start tracking your daily progress and build consistent habits."
            action={
              <Button asChild>
                <Link to="/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Link>
              </Button>
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;
