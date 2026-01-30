import React, { useState, useMemo } from "react";
import { useTasks } from "@/context/TaskContext";
import { Layout } from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, CATEGORY_LABELS, TaskCategory } from "@/types/task";
import { toast } from "sonner";
import {
  Plus,
  ListTodo,
  Search,
  Filter,
  SortAsc,
  Target,
  CheckCircle,
  Calendar,
  Grid3X3,
  List,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CalendarDays,
  Clock,
  ListFilter,
  LayoutGrid,
  Search as SearchIcon,
  SlidersHorizontal,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { getToday, getTotalDays } from "@/utils/dateUtils";

type SortOption = "newest" | "oldest" | "name" | "priority" | "progress";
type FilterCategory = "all" | TaskCategory | string;

const Tasks: React.FC = () => {
  const { tasks, deleteTask, getTaskProgress, isLoading } = useTasks();
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
    "digital-twin": "bg-blue-500",
    hacking: "bg-green-500",
    math: "bg-purple-500",
    custom: "bg-orange-500",
  };

  // Compute unique saved custom categories
  const existingCustomCategories = useMemo(() => {
    const categories = new Set<string>();
    tasks.forEach((task) => {
      if (task.customCategory) {
        categories.add(task.customCategory);
      }
    });
    return Array.from(categories).sort();
  }, [tasks]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTaskId(id);
  };

  const confirmDelete = () => {
    if (deleteTaskId) {
      deleteTask(deleteTaskId);
      setDeleteTaskId(null);
      toast.success("Task deleted");
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditTask(undefined);
  };

  let filteredTasks = tasks;

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.name.toLowerCase().includes(query) ||
        (task.customCategory &&
          task.customCategory.toLowerCase().includes(query)),
    );
  }

  // Category filter
  if (filterCategory !== "all") {
    if (Object.keys(CATEGORY_LABELS).includes(filterCategory)) {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === filterCategory,
      );
    } else {
      // Specific custom category
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.category === "custom" && task.customCategory === filterCategory,
      );
    }
  }

  // Sorting
  filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "priority":
        const pVal: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (
          (pVal[b.priority || "low"] || 0) - (pVal[a.priority || "low"] || 0)
        );
      case "progress":
        return 0;
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="h-full flex flex-col space-y-6 p-8">
        <div className="flex flex-col gap-6">
          {/* Header & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and track your long-range tasks
              </p>
            </div>
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Total
                </span>
              </div>
              <div className="text-3xl font-bold">{tasks.length}</div>
            </div>

            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
              <div className="text-3xl font-bold">
                {
                  tasks.filter(
                    (t) =>
                      !t.isPaused &&
                      (getTaskProgress(t.id)?.percentage ?? 0) < 100,
                  ).length
                }
              </div>
            </div>

            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Done
                </span>
              </div>
              <div className="text-3xl font-bold">
                {
                  tasks.filter(
                    (t) => (getTaskProgress(t.id)?.percentage ?? 0) === 100,
                  ).length
                }
              </div>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/30 p-1 rounded-lg">
            <div className="relative w-full sm:w-[300px]">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-background border-none shadow-none focus-visible:ring-1"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <Select
                value={filterCategory}
                onValueChange={(v) => setFilterCategory(v as FilterCategory)}
              >
                <SelectTrigger className="w-[150px] border-none bg-transparent hover:bg-background/50">
                  <ListFilter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {existingCustomCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            categoryColors["custom"],
                          )}
                        />
                        {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-border mx-1" />

              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-background/50">
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

              <div className="w-px h-6 bg-border mx-1" />

              <div className="flex items-center bg-background/50 rounded-md p-0.5">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {searchQuery || filterCategory !== "all" ? (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        ) : null}

        {/* Task Grid/List Grouped by Month */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(
              filteredTasks.reduce(
                (groups, task) => {
                  const date = new Date(task.startDate);
                  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(task);
                  return groups;
                },
                {} as Record<string, Task[]>,
              ),
            )
              .sort(([keyA], [keyB]) => {
                const current = new Date();
                const currentMonthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;

                const isAFuture = keyA >= currentMonthKey;
                const isBFuture = keyB >= currentMonthKey;

                if (isAFuture && isBFuture) return keyA.localeCompare(keyB); // Ascending for future
                if (!isAFuture && !isBFuture) return keyB.localeCompare(keyA); // Descending for past
                return isAFuture ? -1 : 1; // Future first
              })
              .map(([monthKey, monthTasks]) => {
                const [year, month] = monthKey.split("-");
                const monthName = new Date(
                  parseInt(year),
                  parseInt(month) - 1,
                ).toLocaleString("default", { month: "long", year: "numeric" });

                return (
                  <div key={monthKey}>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider bg-background/50 px-2 py-1 rounded-md">
                        {monthName}
                      </h3>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div
                      className={cn(
                        "gap-4",
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                          : "flex flex-col space-y-3",
                      )}
                    >
                      {monthTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          compact={viewMode === "list"}
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
        <AlertDialog
          open={!!deleteTaskId}
          onOpenChange={() => setDeleteTaskId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task and all its progress data.
                This action cannot be undone.
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
