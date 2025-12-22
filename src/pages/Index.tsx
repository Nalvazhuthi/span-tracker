import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { DailyTaskItem } from '@/components/DailyTaskItem';
import { EmptyState } from '@/components/EmptyState';
import { getToday, formatDisplayDate, getWeekday } from '@/utils/dateUtils';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  const { getTasksForDate, isLoading } = useTasks();
  const today = getToday();
  const tasksForToday = getTasksForDate(today);

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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CalendarDays className="h-4 w-4" />
            <span>{getWeekday(today)}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {formatDisplayDate(today)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {tasksForToday.length > 0
              ? `${tasksForToday.length} task${tasksForToday.length > 1 ? 's' : ''} for today`
              : 'No tasks scheduled for today'}
          </p>
        </div>

        {/* Tasks */}
        {tasksForToday.length > 0 ? (
          <div className="space-y-4">
            {tasksForToday.map((task) => (
              <DailyTaskItem key={task.id} task={task} date={today} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No Tasks Today"
            description="You don't have any tasks scheduled for today. Create a new task to get started!"
            action={
              <Button asChild>
                <Link to="/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
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
