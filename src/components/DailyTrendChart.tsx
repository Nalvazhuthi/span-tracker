import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useTasks } from '@/context/TaskContext';
import { getDaysInRange } from '@/utils/dateUtils';
import { generateProgressKey } from '@/utils/storageUtils';
import { format, parseISO } from 'date-fns';

type ChartType = 'bar' | 'line' | 'area';

interface DailyTrendChartProps {
  chartType: ChartType;
  dateRange: { start: string; end: string };
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ chartType, dateRange }) => {
  const { tasks, dailyProgress } = useTasks();

  const data = useMemo(() => {
    const days = getDaysInRange(dateRange.start, dateRange.end);
    
    return days.map((date) => {
      const tasksOnDate = tasks.filter(
        (task) => date >= task.startDate && date <= task.endDate
      );

      const total = tasksOnDate.length;
      const completed = tasksOnDate.filter((task) => {
        const key = generateProgressKey(task.id, date);
        return dailyProgress[key]?.status === 'done';
      }).length;

      const partial = tasksOnDate.filter((task) => {
        const key = generateProgressKey(task.id, date);
        return dailyProgress[key]?.status === 'partial';
      }).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        date,
        displayDate: format(parseISO(date), 'MMM d'),
        shortDate: format(parseISO(date), 'd'),
        completed,
        partial,
        total,
        percentage,
      };
    });
  }, [tasks, dailyProgress, dateRange]);

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
    const xAxisDataKey = data.length > 14 ? 'shortDate' : 'displayDate';
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={xAxisDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              interval={data.length > 20 ? Math.floor(data.length / 10) : 0}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'percentage') {
                  return [`${value}% (${props.payload.completed}/${props.payload.total})`, 'Completion'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(var(--status-done))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--status-done))', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={xAxisDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              interval={data.length > 20 ? Math.floor(data.length / 10) : 0}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'percentage') {
                  return [`${value}% (${props.payload.completed}/${props.payload.total})`, 'Completion'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(var(--status-done))" 
              fill="hsl(var(--status-done) / 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey={xAxisDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              interval={data.length > 20 ? Math.floor(data.length / 10) : 0}
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'percentage') {
                  return [`${value}% (${props.payload.completed}/${props.payload.total})`, 'Completion'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar 
              dataKey="percentage" 
              fill="hsl(var(--status-done))" 
              radius={[2, 2, 0, 0]} 
              maxBarSize={30}
            />
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
