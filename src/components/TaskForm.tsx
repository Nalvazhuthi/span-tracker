import React, { useState, useEffect, useMemo } from "react";
import {
  Task,
  TaskCategory,
  CATEGORY_LABELS,
  DayPattern,
  Weekday,
  DAY_PATTERN_LABELS,
  WEEKDAY_LABELS,
} from "@/types/task";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getToday, isValidDateRange, formatDate } from "@/utils/dateUtils";
import { useTasks } from "@/context/TaskContext";
import { toast } from "sonner";
import { X, CalendarIcon, WifiOff, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: Task | null;
}

const categoryColors: Record<TaskCategory, string> = {
  "digital-twin": "bg-category-digital-twin",
  hacking: "bg-category-hacking",
  math: "bg-category-math",
  custom: "bg-category-custom",
};

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onOpenChange,
  editTask,
}) => {
  const { addTask, updateTask, tasks } = useTasks();
  const today = getToday();
  const isOnline = useOnlineStatus();

  // Compute unique saved custom categories
  const existingCustomCategories = useMemo(() => {
    const categories = new Set<string>();
    tasks.forEach((task) => {
      if (task.customCategory) {
        categories.add(task.customCategory);
      }
    }); // Deduplication logic
    return Array.from(categories).sort();
  }, [tasks]);

  const [formData, setFormData] = useState({
    name: "",
    category: "digital-twin" as TaskCategory,
    customCategory: "",
    startDate: today,
    endDate: today,
    priority: "medium" as "low" | "medium" | "high",
    dayPattern: "daily" as DayPattern,
    customDays: [] as Weekday[],
    isPaused: false,
    autoCarryForward: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  useEffect(() => {
    if (editTask) {
      setFormData({
        name: editTask.name,
        category: editTask.category,
        customCategory: editTask.customCategory || "",
        startDate: editTask.startDate,
        endDate: editTask.endDate,
        priority: editTask.priority || "medium",
        dayPattern: editTask.dayPattern || "daily",
        customDays: editTask.customDays || [],
        isPaused: editTask.isPaused || false,
        autoCarryForward: editTask.autoCarryForward || false,
      });
    } else {
      setFormData({
        name: "",
        category: "digital-twin",
        customCategory: "",
        startDate: today,
        endDate: today,
        priority: "medium",
        dayPattern: "daily",
        customDays: [],
        isPaused: false,
        autoCarryForward: false,
      });
    }
    setErrors({});
  }, [editTask, open, today]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }

    if (formData.category === "custom" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Custom category name is required";
    }

    if (!isValidDateRange(formData.startDate, formData.endDate)) {
      newErrors.endDate = "End date must be after or equal to start date";
    }

    if (formData.dayPattern === "custom" && formData.customDays.length === 0) {
      newErrors.customDays = "Select at least one day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const taskData = {
      name: formData.name.trim(),
      category: formData.category,
      customCategory:
        formData.category === "custom"
          ? formData.customCategory.trim()
          : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: formData.priority,
      dayPattern: formData.dayPattern,
      customDays:
        formData.dayPattern === "custom" ? formData.customDays : undefined,
      isPaused: formData.isPaused,
      autoCarryForward: formData.autoCarryForward,
    };

    if (editTask) {
      updateTask({ ...editTask, ...taskData });
      toast.success("Task updated successfully");
    } else {
      addTask(taskData);
      toast.success("Task created successfully");
    }

    onOpenChange(false);
  };

  const toggleCustomDay = (day: Weekday) => {
    setFormData((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day].sort((a, b) => a - b),
    }));
  };

  const allWeekdays: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editTask ? "Edit Task" : "Create New Task"}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter task name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as TaskCategory })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          categoryColors[key as TaskCategory]
                        }`}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Category Name - Hybrid Input with History */}
          {formData.category === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customCategory">Custom Category Name</Label>
              <div className="relative">
                <Input
                  id="customCategory"
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, customCategory: e.target.value })
                  }
                  placeholder="Type a name or pick from history →"
                  className={cn(
                    "pr-10",
                    errors.customCategory && "border-destructive",
                  )}
                />

                {/* Quick Pick History Dropdown */}
                {existingCustomCategories.length > 0 && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center">
                    <Select
                      onValueChange={(val) =>
                        setFormData({ ...formData, customCategory: val })
                      }
                    >
                      <SelectTrigger className="h-9 w-9 p-0 border-none shadow-none bg-transparent hover:bg-muted/50 rounded-r-md data-[placeholder]:text-muted-foreground mr-px">
                        <span className="sr-only">History</span>
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30">
                          Saved Categories
                        </div>
                        {existingCustomCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {existingCustomCategories.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  History from your existing tasks
                </p>
              )}
              {errors.customCategory && (
                <p className="text-xs text-destructive">
                  {errors.customCategory}
                </p>
              )}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(parseISO(formData.startDate), "PPP")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.startDate
                        ? parseISO(formData.startDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setFormData({
                          ...formData,
                          startDate: formatDate(date),
                        });
                        setIsStartDateOpen(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground",
                      errors.endDate && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(parseISO(formData.endDate), "PPP")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.endDate ? parseISO(formData.endDate) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, endDate: formatDate(date) });
                        setIsEndDateOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      formData.startDate
                        ? date < parseISO(formData.startDate)
                        : false
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Day Pattern */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Repeat Pattern
            </Label>
            <Select
              value={formData.dayPattern}
              onValueChange={(value) =>
                setFormData({ ...formData, dayPattern: value as DayPattern })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_PATTERN_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days Selection */}
          {formData.dayPattern === "custom" && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2">
                {allWeekdays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(day)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                      formData.customDays.includes(day)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50",
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                ))}
              </div>
              {errors.customDays && (
                <p className="text-xs text-destructive">{errors.customDays}</p>
              )}
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  priority: value as "low" | "medium" | "high",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-priority-low" />
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-priority-medium" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-priority-high" />
                    High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isOnline}>
              {editTask ? "Save Changes" : "Create Task"}
            </Button>
          </div>
          {!isOnline && (
            <div className="text-destructive text-sm text-center mt-2 flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>You are offline. Cannot save changes.</span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
