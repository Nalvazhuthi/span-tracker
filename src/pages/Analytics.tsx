import React, { useState, useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { StatsCards } from '@/components/StatsCards';
import { ProgressChart } from '@/components/ProgressChart';
import { CategoryProgress } from '@/components/CategoryProgress';
import { ConsistencyCalendar } from '@/components/ConsistencyCalendar';
import { DailyTrendChart } from '@/components/DailyTrendChart';
import { StreakDisplay } from '@/components/StreakDisplay';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { BarChart3, Plus, BarChart2, LineChart, AreaChart } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { getToday, formatDate } from '@/utils/dateUtils';

type ChartType = 'bar' | 'line' | 'area';
type TimeRange = '5d' | '1w' | '2w' | '1m' | '3m' | 'all';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '5d', label: 'Last 5 days' },
  { value: '1w', label: 'Last 1 week' },
  { value: '2w', label: 'Last 2 weeks' },
  { value: '1m', label: 'Last 1 month' },
  { value: '3m', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
];

const Analytics: React.FC = () => {
  const { tasks, isLoading } = useTasks();
  const [timeRange, setTimeRange] = useState<TimeRange>('1w');
  const [chartType, setChartType] = useState<ChartType>('area');
  const today = getToday();

  const dateRange = useMemo(() => {
    const end = today;
    let start: string;

    switch (timeRange) {
      case '5d':
        start = formatDate(subDays(new Date(), 4));
        break;
      case '1w':
        start = formatDate(subDays(new Date(), 6));
        break;
      case '2w':
        start = formatDate(subDays(new Date(), 13));
        break;
      case '1m':
        start = formatDate(subDays(new Date(), 29));
        break;
      case '3m':
        start = formatDate(subDays(new Date(), 89));
        break;
      case 'all':
        // Find earliest task start date
        if (tasks.length > 0) {
          const earliest = tasks.reduce((min, task) => 
            task.startDate < min ? task.startDate : min, 
            tasks[0].startDate
          );
          start = earliest;
        } else {
          start = formatDate(subDays(new Date(), 29));
        }
        break;
      default:
        start = formatDate(subDays(new Date(), 6));
    }

    return { start, end };
  }, [timeRange, today, tasks]);

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
        {/* Header with Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Progress</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chart Type Selector */}
            <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <TabsList className="h-9">
                <TabsTrigger value="bar" className="px-3">
                  <BarChart2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="line" className="px-3">
                  <LineChart className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="area" className="px-3">
                  <AreaChart className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards dateRange={dateRange} />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Daily Trend Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Completion Trend</h3>
            <DailyTrendChart chartType={chartType} dateRange={dateRange} />
          </div>

          {/* Task Progress Chart */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Task Completion</h3>
            <ProgressChart chartType={"bar"} dateRange={dateRange} />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Streak Display */}
          <StreakDisplay dateRange={dateRange} />
          
          {/* Category Progress */}
          <CategoryProgress />
        </div>

        {/* Calendar */}
        <ConsistencyCalendar />
      </div>
    </Layout>
  );
};

export default Analytics;
