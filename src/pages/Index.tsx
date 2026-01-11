import React, { useState, useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { DailyTaskItem } from '@/components/DailyTaskItem';
import { EmptyState } from '@/components/EmptyState';
import { getToday, formatDisplayDate, getWeekday, formatDate } from '@/utils/dateUtils';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Sparkles, Target, Clock, TrendingUp, CalendarCheck, Sun, Moon, CloudSun, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { cn } from '@/lib/utils';
import { addDays, subDays, parseISO, format } from 'date-fns';
import { generateProgressKey } from '@/utils/storageUtils';
import { CircularProgress } from '@/components/ui/CircularProgress';


const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'Good Night', icon: Moon };
  if (hour < 12) return { text: 'Good Morning', icon: Sun };
  if (hour < 17) return { text: 'Good Afternoon', icon: CloudSun };
  if (hour < 21) return { text: 'Good Evening', icon: Sunset };
  return { text: 'Good Night', icon: Moon };
};

// CircularProgress removed (imported from components)

const Index: React.FC = () => {
  const { tasks, getTasksForDate, dailyProgress, isLoading } = useTasks();
  const realToday = getToday();
  const [selectedDate, setSelectedDate] = useState(realToday);
  
  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const isViewingToday = selectedDate === realToday;
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

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
    const upcoming: { date: string; tasks: any[]; label: string }[] = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = formatDate(addDays(parseISO(realToday), i));
      const dayTasks = getTasksForDate(date);
      
      if (dayTasks.length > 0) {
        let label = format(parseISO(date), 'EEE, MMM d');
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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <div className="flex items-center gap-2 text-muted-foreground mb-1">
               <GreetingIcon className="h-4 w-4" />
               <span className="text-sm font-medium">{greeting.text}</span>
             </div>
             <h1 className="text-3xl font-bold tracking-tight">Today's Focus</h1>
             <p className="text-muted-foreground mt-1">
               {formatDisplayDate(getToday())}
             </p>
           </div>
           
           <div className="flex items-center gap-2">
             <Button asChild>
               <Link to="/tasks">
                 <Plus className="h-4 w-4 mr-2" />
                 New Task
               </Link>
             </Button>
           </div>
        </div>

        {/* Hero Quick Stats - Today Only */}
        {isViewingToday && tasks.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center sm:text-left">
                 <h2 className="text-xl font-semibold mb-2">You're making progress!</h2>
                 <p className="text-muted-foreground mb-6 max-w-md">
                   {todayStats.remaining === 0 
                     ? "All tasks completed! Amazing work today."
                     : `You have ${todayStats.remaining} tasks remaining for today. Keep the momentum going!`}
                 </p>
                 <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                   <div className="flex items-center gap-2 bg-status-done-bg/50 px-3 py-1.5 rounded-full border border-status-done/20">
                     <Sparkles className="h-4 w-4 text-status-done" />
                     <span className="text-sm font-medium">{todayStats.completed} Completed</span>
                   </div>
                   <div className="flex items-center gap-2 bg-status-skipped-bg/50 px-3 py-1.5 rounded-full border border-status-skipped/20">
                     <Target className="h-4 w-4 text-status-skipped" />
                     <span className="text-sm font-medium">{todayStats.total} Total</span>
                   </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center">
                  <CircularProgress completed={todayStats.completed} total={todayStats.total} size={88} />
                   <span className="text-xs text-muted-foreground mt-2 font-medium">Daily Goal</span>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Navigation Strip */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <span>{format(parseISO(selectedDate), 'MMMM yyyy')}</span>
            </h2>
            <div className="flex gap-2">
               {!isViewingToday && (
                  <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs h-7">
                    Back to Today
                  </Button>
                )}
               <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateDate('prev')}>
                   <ChevronLeft className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateDate('next')}>
                   <ChevronRight className="h-4 w-4" />
                 </Button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
              const dateObj = addDays(parseISO(selectedDate), offset);
              const dateStr = formatDate(dateObj);
              const isSelected = offset === 0;
              const isToday = dateStr === realToday;
              
              // Calculate status for dots
              const tasksOnDate = getTasksForDate(dateStr);
              const completedCount = tasksOnDate.filter(t => dailyProgress[generateProgressKey(t.id, dateStr)]?.status === 'done').length;
              const hasTasks = tasksOnDate.length > 0;
              const allDone = hasTasks && completedCount === tasksOnDate.length;
              const partialDone = hasTasks && completedCount > 0 && !allDone;
              
              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 relative",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-lg scale-110 z-10" 
                      : "bg-card hover:bg-muted/80 text-muted-foreground hover:scale-105",
                    isToday && !isSelected && "border border-primary/50"
                  )}
                >
                  <span className="text-[10px] font-medium uppercase opacity-80">{format(dateObj, 'EEE')}</span>
                  <span className={cn("text-lg font-bold", isSelected ? "text-primary-foreground" : "text-foreground")}>
                    {format(dateObj, 'd')}
                  </span>
                  
                  {/* Status Indicator Dot */}
                  <div className="h-1.5 w-1.5 rounded-full mt-1 transition-colors duration-300" 
                       style={{ 
                         backgroundColor: isSelected 
                           ? 'rgba(255,255,255,0.8)' 
                           : allDone ? 'var(--status-done)' 
                           : partialDone ? 'var(--status-partial)' 
                           : hasTasks ? 'var(--status-pending)' 
                           : 'transparent'
                       }} 
                  />
                </button>
              );
            })}
          </div>
        </div>

          <div className="bg-card/50 rounded-2xl border border-border/50 p-1 min-h-[300px]">
             {tasksForSelectedDate.length > 0 ? (
                <div className="space-y-3 p-2">
                   {tasksForSelectedDate.map((task, index) => (
                     <div 
                        key={task.id} 
                        className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                        style={{ animationDelay: `${index * 75}ms` }}
                     >
                        <DailyTaskItem task={task} date={selectedDate} />
                     </div>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="bg-muted/50 p-4 rounded-full mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No tasks scheduled</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    {isViewingToday 
                      ? "Enjoy your free time or add a new task to get productive!" 
                      : `No tasks scheduled for ${format(parseISO(selectedDate), 'MMMM do')}.`}
                  </p>
                  <Button asChild variant="outline" className="mt-6">
                    <Link to="/tasks">Add Task</Link>
                  </Button>
                </div>
             )}
          </div>


        {/* Start Soon & Upcoming Grid */}
        {(startingSoon.length > 0 || upcomingTasks.length > 0) && (
           <div className="grid lg:grid-cols-2 gap-8">
              {/* Starting Soon */}
              {startingSoon.length > 0 && (
                <div>
                   <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                     <TrendingUp className="h-4 w-4" /> Starting Soon
                   </h3>
                   <div className="space-y-3">
                      {startingSoon.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border">
                          <div className={cn('h-2 w-2 rounded-full shrink-0', categoryColors[task.category])} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{task.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Starts {format(parseISO(task.startDate), 'EEE, MMM d')}
                            </div>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Upcoming Week Horizontal Scroll / Grid */}
              {upcomingTasks.length > 0 && (
                <div className={cn(startingSoon.length === 0 && "lg:col-span-2")}>
                   <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                     <CalendarDays className="h-4 w-4" /> Upcoming Week
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {upcomingTasks.map(({ date, tasks: dayTasks, label }) => (
                         <div 
                           key={date}
                           onClick={() => setSelectedDate(date)}
                           className="bg-card hover:bg-muted/50 border border-border rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between h-24"
                         >
                            <div className="text-xs font-medium text-muted-foreground">{label}</div>
                            <div>
                               <div className="text-2xl font-bold">{dayTasks.length}</div>
                               <div className="text-[10px] text-muted-foreground uppercase">Tasks</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        )}

        {/* Empty State (Global) */}
        {tasks.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Welcome to TaskFlow!"
            description="Create your first long-range task to start tracking your daily progress."
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
