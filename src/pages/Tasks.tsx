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
  BarChart3, 
  CalendarDays, 
  Clock, 
  ListFilter, 
  LayoutGrid, 
  Search as SearchIcon,
  SlidersHorizontal 
} from 'lucide-react';
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
    const active = tasks.filter((t) => !t.endDate || t.endDate >= today).length;
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
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 dark:from-blue-950/20 dark:to-background dark:border-blue-900/50 transition-all hover:shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 dark:from-amber-950/20 dark:to-background dark:border-amber-900/50 transition-all hover:shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.active}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-4 dark:from-green-950/20 dark:to-background dark:border-green-900/50 transition-all hover:shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Done</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.completed}</p>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md pb-4 pt-1 mb-2">
               <div className="flex flex-col gap-4">
                  {/* Search and Filters Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Search tasks..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-9 bg-card/50"
                        />
                     </div>
                     
                     <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as FilterCategory)}>
                           <SelectTrigger className="w-[150px] bg-card/50">
                              <ListFilter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <SelectValue placeholder="Category" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                 <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                       <div className={cn('h-2 w-2 rounded-full', categoryColors[key as TaskCategory])} />
                                       {label}
                                    </div>
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                           <SelectTrigger className="w-[140px] bg-card/50">
                              <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <SelectValue placeholder="Sort" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="newest">Newest</SelectItem>
                              <SelectItem value="oldest">Oldest</SelectItem>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                              <SelectItem value="progress">Progress</SelectItem>
                           </SelectContent>
                        </Select>

                        <div className="hidden sm:flex items-center border rounded-md bg-card/50 p-1">
                           <Button
                              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setViewMode('grid')}
                           >
                              <LayoutGrid className="h-4 w-4" />
                           </Button>
                           <Button
                              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setViewMode('list')}
                           >
                              <List className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
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

        {/* Task Grid/List Grouped by Month */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(
              filteredTasks.reduce((groups, task) => {
                const date = new Date(task.startDate);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(task);
                return groups;
              }, {} as Record<string, Task[]>)
            )
              .sort(([keyA], [keyB]) => {
                const current = new Date();
                const currentMonthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                
                const isAFuture = keyA >= currentMonthKey;
                const isBFuture = keyB >= currentMonthKey;

                if (isAFuture && isBFuture) return keyA.localeCompare(keyB); // Ascending for future
                if (!isAFuture && !isBFuture) return keyB.localeCompare(keyA); // Descending for past
                return isAFuture ? -1 : 1; // Future first
              })
              .map(([monthKey, monthTasks]) => {
                const [year, month] = monthKey.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                
                return (
                  <div key={monthKey}>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                       <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider bg-background/50 px-2 py-1 rounded-md">
                          {monthName}
                       </h3>
                       <div className="h-px bg-border flex-1" />
                    </div>
                    <div className={cn(
                      'gap-4',
                      viewMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'flex flex-col space-y-3'
                    )}>
                      {monthTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          compact={viewMode === 'list'}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
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
