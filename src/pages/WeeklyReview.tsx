import React, { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useTasks } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS, TaskCategory, Task } from '@/types/task';
import { getDaysInRange, getToday } from '@/utils/dateUtils';
import { subDays, parseISO, isAfter, isBefore, addDays, format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WeeklyReview: React.FC = () => {
    const { tasks, dailyProgress, updateTask } = useTasks();
    const navigate = useNavigate();
    const today = getToday();
    const weekStart = format(subDays(parseISO(today), 6), 'yyyy-MM-dd');

    // Stats Calculation
    const stats = useMemo(() => {
        let planned = 0;
        let completed = 0;
        const categoryCounts: Record<string, number> = {};
        const skippedTasks: Record<string, number> = {};

        // For the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');

            const activeTasks = tasks.filter(t => !t.isPaused && isBefore(parseISO(t.startDate), parseISO(date)) && isAfter(parseISO(t.endDate), parseISO(date)));

            activeTasks.forEach(task => {
                planned++;
                const key = `${task.id}-${date}`;
                const progress = dailyProgress[key];

                if (progress?.status === 'done' || progress?.status === 'saved-the-day') {
                    completed++;
                    categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
                } else if (progress?.status === 'skipped') {
                    skippedTasks[task.id] = (skippedTasks[task.id] || 0) + 1;
                }
            });
        }

        return { planned, completed, categoryCounts, skippedTasks };
    }, [tasks, dailyProgress]);

    const categoryData = Object.entries(stats.categoryCounts).map(([key, value]) => ({
        name: CATEGORY_LABELS[key as TaskCategory] || key,
        value,
        color: key === 'digital-twin' ? '#3b82f6' :
            key === 'hacking' ? '#10b981' :
                key === 'math' ? '#f59e0b' : '#8b5cf6'
    }));

    const chartData = [
        { name: 'Planned', value: stats.planned, fill: '#94a3b8' },
        { name: 'Completed', value: stats.completed, fill: '#22c55e' },
    ];

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
                        <p className="text-muted-foreground">Review your performance and adjust your strategy.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Completion Rate</CardTitle>
                            <CardDescription>Last 7 Days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Category Balance</CardTitle>
                            <CardDescription>Where your focus went</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Struggling Tasks</CardTitle>
                            <CardDescription>Tasks skipped most often</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(stats.skippedTasks)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 3)
                                    .map(([id, count]) => {
                                        const task = tasks.find(t => t.id === id);
                                        return task ? (
                                            <div key={id} className="flex justify-between items-center text-sm">
                                                <span>{task.name}</span>
                                                <Badge variant="destructive">{count} Skipped</Badge>
                                            </div>
                                        ) : null;
                                    })}
                                {Object.keys(stats.skippedTasks).length === 0 && (
                                    <p className="text-sm text-muted-foreground">No skipped tasks this week! Great job.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Task Management</h2>
                <div className="grid grid-cols-1 gap-4">
                    {tasks.map(task => (
                        <Card key={task.id} className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-medium ${task.isPaused ? 'text-muted-foreground line-through' : ''}`}>{task.name}</h3>
                                    {task.isPaused && <Badge variant="outline">Paused</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[task.category]}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Priority */}
                                <div className="w-32">
                                    <Select
                                        value={task.priority}
                                        onValueChange={(val: any) => updateTask({ ...task, priority: val })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Pause Toggle */}
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`pause-${task.id}`} className="text-xs">Pause</Label>
                                    <Switch
                                        id={`pause-${task.id}`}
                                        checked={task.isPaused}
                                        onCheckedChange={(checked) => updateTask({ ...task, isPaused: checked })}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default WeeklyReview;

  git config--global user.email "you@example.com"
  git config--global user.name "Your Name"