import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTasks } from '@/context/TaskContext';
import { CATEGORY_LABELS, TaskCategory } from '@/types/task';

const categoryColorMap: Record<TaskCategory, string> = {
  'digital-twin': 'hsl(262, 83%, 58%)',
  'hacking': 'hsl(142, 71%, 45%)',
  'math': 'hsl(199, 89%, 48%)',
  'custom': 'hsl(340, 82%, 52%)',
};

export const CategoryProgress: React.FC = () => {
  const { tasks, getTaskProgress } = useTasks();

  const data = useMemo(() => {
    const categoryStats: Record<string, { total: number; completed: number; label: string; category: TaskCategory }> = {};

    tasks.forEach((task) => {
      const progress = getTaskProgress(task.id);
      const key = task.category === 'custom' ? `custom-${task.customCategory}` : task.category;
      const label = task.category === 'custom' ? task.customCategory || 'Custom' : CATEGORY_LABELS[task.category];

      if (!categoryStats[key]) {
        categoryStats[key] = { total: 0, completed: 0, label, category: task.category };
      }
      categoryStats[key].total += progress.total;
      categoryStats[key].completed += progress.completed;
    });

    return Object.entries(categoryStats).map(([_key, stats]) => ({
      name: stats.label,
      value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      completed: stats.completed,
      total: stats.total,
      category: stats.category,
    }));
  }, [tasks, getTaskProgress]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Category Overview</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColorMap[entry.category]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value}% (${props.payload.completed}/${props.payload.total} days)`,
                props.payload.name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
