import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useTasks } from '@/context/TaskContext';
import { CATEGORY_LABELS, TaskCategory } from '@/types/task';

type ChartType = 'bar' | 'line' | 'area';

const categoryColorMap: Record<TaskCategory, string> = {
  'digital-twin': 'hsl(262, 83%, 58%)',
  'hacking': 'hsl(142, 71%, 45%)',
  'math': 'hsl(199, 89%, 48%)',
  'custom': 'hsl(340, 82%, 52%)',
};

interface ProgressChartProps {
  chartType: ChartType;
  dateRange: { start: string; end: string };
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ chartType, dateRange }) => {
  const { tasks, getTaskProgress } = useTasks();

  const data = useMemo(() => {
    return tasks
      .filter((task) => {
        // Only include tasks that overlap with the date range
        return task.startDate <= dateRange.end && task.endDate >= dateRange.start;
      })
      .map((task) => {
        const progress = getTaskProgress(task.id);
        const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];
        return {
          name: task.name.length > 12 ? task.name.slice(0, 12) + '...' : task.name,
          fullName: task.name,
          percentage: progress.percentage,
          completed: progress.completed,
          total: progress.total,
          category: task.category,
          categoryLabel,
          fill: categoryColorMap[task.category],
        };
      });
  }, [tasks, getTaskProgress, dateRange]);

  if (data.length === 0) {
    return null;
  }

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '14px',
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name: string, props: any) => [
                `${value}% (${props.payload.completed}/${props.payload.total} days)`,
                props.payload.fullName,
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name: string, props: any) => [
                `${value}% (${props.payload.completed}/${props.payload.total} days)`,
                props.payload.fullName,
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name: string, props: any) => [
                `${value}% (${props.payload.completed}/${props.payload.total} days)`,
                props.payload.fullName,
              ]}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
