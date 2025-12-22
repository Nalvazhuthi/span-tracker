import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { StatsCards } from '@/components/StatsCards';
import { ProgressChart } from '@/components/ProgressChart';
import { CategoryProgress } from '@/components/CategoryProgress';
import { ConsistencyCalendar } from '@/components/ConsistencyCalendar';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';

const Analytics: React.FC = () => {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (tasks.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Progress</h1>
            <p className="text-muted-foreground mt-1">
              Track your completion rates and consistency
            </p>
          </div>
          <EmptyState
            icon={BarChart3}
            title="No Data Yet"
            description="Create some tasks and track your progress to see analytics here."
            action={
              <Button asChild>
                <Link to="/tasks">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your completion rates and consistency
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ProgressChart />
          <CategoryProgress />
        </div>

        {/* Calendar */}
        <ConsistencyCalendar />
      </div>
    </Layout>
  );
};

export default Analytics;
