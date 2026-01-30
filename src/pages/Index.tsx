import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { Layout } from "@/components/Layout";
import { DailyTaskItem } from "@/components/DailyTaskItem";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { getToday, formatDate } from "@/utils/dateUtils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Rocket,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, subDays, parseISO, format, isSameDay } from "date-fns";
import { generateProgressKey } from "@/utils/storageUtils";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  const { tasks, getTasksForDate, dailyProgress, isLoading } = useTasks();
  const realToday = getToday();
  const [selectedDate, setSelectedDate] = useState(realToday);
  const [formOpen, setFormOpen] = useState(false);

  // Selected date tasks
  const tasksForSelectedDate = getTasksForDate(selectedDate);

  // Calculate stats for the selected date
  const stats = useMemo(() => {
    const dayTasks = getTasksForDate(selectedDate);
    const completed = dayTasks.filter((task) => {
      const key = generateProgressKey(task.id, selectedDate);
      return dailyProgress[key]?.status === "done";
    }).length;

    const total = dayTasks.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      remaining: total - completed,
      percentage,
    };
  }, [tasks, dailyProgress, selectedDate, getTasksForDate]);

  // Navigate dates
  const navigateDate = (direction: "prev" | "next") => {
    const current = parseISO(selectedDate);
    const newDate =
      direction === "next" ? addDays(current, 1) : subDays(current, 1);
    setSelectedDate(formatDate(newDate));
  };

  const selectedDateObj = parseISO(selectedDate);
  const monthYear = format(selectedDateObj, "MMMM yyyy");

  // Generate calendar strip (week view centered on selected date approx)
  // Let's show a fixed window or a window around selected.
  // Screenshot shows roughly a week. Let's do -3 to +3 days from selected, or just a static week if we want simple.
  // Dynamic window around selected date is best.
  const calendarDays = useMemo(() => {
    const center = parseISO(selectedDate);
    const days = [];
    for (let i = -3; i <= 3; i++) {
      days.push(addDays(center, i));
    }
    return days;
  }, [selectedDate]);

  const handleTaskCreate = (newTask: Task) => {
    // If created, force refresh or just close
    setFormOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto space-y-8 p-4 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Rocket className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium">Good Afternoon</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Today's Focus
            </h1>
            <p className="text-slate-400 mt-1 font-medium">
              {format(selectedDateObj, "MMMM d, yyyy")}
            </p>
          </div>

          <Button
            onClick={() => setFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Hero Progress Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1e2e] to-[#14141f] border border-white/5 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <div className="h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-6 flex-1 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {stats.remaining === 0 && stats.total > 0
                    ? "All done for today!"
                    : "You're making progress!"}
                </h2>
                <p className="text-slate-400 max-w-md">
                  {stats.remaining === 0 && stats.total > 0
                    ? "Great job! You've completed all your tasks."
                    : `You have ${stats.remaining} tasks remaining for ${selectedDate === realToday ? "today" : "this day"}. Keep the momentum going!`}
                </p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-green-400 text-sm font-medium">
                  <Rocket className="h-3.5 w-3.5" />
                  <span>{stats.completed} Completed</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-orange-400 text-sm font-medium">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{stats.total} Total</span>
                </div>
              </div>
            </div>

            {/* Circular Progress (CSS Simulated) */}
            <div className="relative h-32 w-32 flex-shrink-0">
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                <circle
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * stats.percentage) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-white block">
                  {stats.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Daily Goal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-2 font-semibold text-lg text-slate-200">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
              {monthYear}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-transparent border-slate-700"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-transparent border-slate-700"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {calendarDays.map((date, i) => {
              const isSelected = isSameDay(date, selectedDateObj);
              const dayNum = format(date, "d");
              const dayName = format(date, "EEE");

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(formatDate(date))}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[3rem]",
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-105"
                      : "bg-[#15151c] border border-white/5 text-slate-400 hover:bg-[#1e1e2e]",
                  )}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {dayName}
                  </span>
                  <span
                    className={cn(
                      "text-xl font-bold mt-1",
                      isSelected ? "text-white" : "text-slate-200",
                    )}
                  >
                    {dayNum}
                  </span>
                  {isSelected && (
                    <div className="mt-1 h-1 w-1 rounded-full bg-white/50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasksForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {tasksForSelectedDate.map((task) => (
                <DailyTaskItem key={task.id} task={task} date={selectedDate} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                <Rocket className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-200">
                No tasks for this day
              </h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Enjoy your free time or schedule some tasks to stay productive.
              </p>
              <Button
                variant="link"
                onClick={() => setFormOpen(true)}
                className="mt-2 text-blue-400"
              >
                Add a task now
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Section (Simplified) */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Upcoming Week
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2].map((offset) => {
              const futureDate = addDays(realToday, offset);
              const futureDateStr = formatDate(futureDate);
              const tasksCount = getTasksForDate(futureDateStr).length;
              const label =
                offset === 1 ? "Tomorrow" : format(futureDate, "EEE, MMM d");

              return (
                <div
                  key={offset}
                  className="bg-[#15151c] border border-white/5 p-4 rounded-xl"
                >
                  <div className="text-sm font-medium text-slate-400 mb-2">
                    {label}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {tasksCount}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                    Tasks
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <TaskForm
          open={formOpen}
          onOpenChange={setFormOpen}
          editTask={undefined} // Create mode
        />
      </div>
    </Layout>
  );
};

export default Index;
