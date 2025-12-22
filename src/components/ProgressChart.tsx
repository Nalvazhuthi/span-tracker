import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTasks } from '@/context/TaskContext';
import { CATEGORY_LABELS, TaskCategory } from '@/types/task';

const categoryColorMap: Record<TaskCategory, string> = {
  'digital-twin': 'hsl(262, 83%, 58%)',
  'hacking': 'hsl(142, 71%, 45%)',
  'math': 'hsl(199, 89%, 48%)',
  'custom': 'hsl(340, 82%, 52%)',
};

export const ProgressChart: React.FC = () => {
  const { tasks, getTaskProgress } = useTasks();

  const data = useMemo(() => {
    return tasks.map((task) => {
      const progress = getTaskProgress(task.id);
      const categoryLabel = task.category === 'custom' ? task.customCategory : CATEGORY_LABELS[task.category];
      return {
        name: task.name.length > 15 ? task.name.slice(0, 15) + '...' : task.name,
        fullName: task.name,
        percentage: progress.percentage,
        completed: progress.completed,
        total: progress.total,
        category: task.category,
        categoryLabel,
      };
    });
  }, [tasks, getTaskProgress]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Task Completion</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value}% (${props.payload.completed}/${props.payload.total} days)`,
                props.payload.fullName,
              ]}
              labelFormatter={() => ''}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColorMap[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
