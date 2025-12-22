import React, { useState, useMemo } from 'react';
import { useTasks } from '@/context/TaskContext';
import { Layout } from '@/components/Layout';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, CATEGORY_LABELS, TaskCategory } from '@/types/task';
import { toast } from 'sonner';
import { Plus, ListTodo, Search, Filter, SortAsc, Target, CheckCircle, Calendar, Grid3X3, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getToday, getTotalDays } from '@/utils/dateUtils';

type SortOption = 'newest' | 'oldest' | 'name' | 'priority' | 'progress';
type FilterCategory = 'all' | TaskCategory;
type ViewMode = 'grid' | 'list';

const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

const Tasks: React.FC = () => {
  const { tasks, deleteTask, getTaskProgress, isLoading } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const today = getToday();

  // Calculate stats
  const stats = useMemo(() => {
    const active = tasks.filter((t) => t.endDate >= today).length;
    const completed = tasks.filter((t) => {
      const progress = getTaskProgress(t.id);
      return progress.percentage === 100;
    }).length;
    
    return { total: tasks.length, active, completed };
  }, [tasks, today, getTaskProgress]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task) =>
        task.name.toLowerCase().includes(query) ||
        (task.customCategory?.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((task) => task.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority || 'medium']) - (priorityOrder[b.priority || 'medium']);
        }
        case 'progress': {
          const aProgress = getTaskProgress(a.id).percentage;
          const bProgress = getTaskProgress(b.id).percentage;
          return bProgress - aProgress;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, filterCategory, sortBy, getTaskProgress]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setFormOpen(true);
  };

  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const confirmDelete = () => {
    if (deleteTaskId) {
      deleteTask(deleteTaskId);
      toast.success('Task deleted successfully');
      setDeleteTaskId(null);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditTask(null);
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your long-range tasks and goals
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {tasks.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-status-partial-bg p-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-status-partial" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-status-done-bg p-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-status-done" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as FilterCategory)}>
                  <SelectTrigger className="w-[140px] sm:w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-2.5 w-2.5 rounded-full', categoryColors[key as TaskCategory])} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[130px] sm:w-[150px]">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode - Desktop only */}
                <div className="hidden sm:block ml-auto">
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                    <TabsList className="h-9">
                      <TabsTrigger value="grid" className="px-3">
                        <Grid3X3 className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger value="list" className="px-3">
                        <List className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery || filterCategory !== 'all' ? (
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            ) : null}
          </>
        )}

        {/* Task Grid/List */}
        {filteredTasks.length > 0 ? (
          <div className={cn(
            'gap-4',
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col'
          )}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <EmptyState
            icon={ListTodo}
            title="No Tasks Yet"
            description="Create your first long-range task to start tracking your progress. Tasks will automatically generate daily entries."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            }
          />
        )}

        {/* Task Form Dialog */}
        <TaskForm
          open={formOpen}
          onOpenChange={handleFormClose}
          editTask={editTask}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task and all its progress data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Tasks;
