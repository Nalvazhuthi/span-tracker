import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, CATEGORY_LABELS, DayPattern, Weekday, DAY_PATTERN_LABELS, WEEKDAY_LABELS } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getToday, isValidDateRange } from '@/utils/dateUtils';
import { useTasks } from '@/context/TaskContext';
import { toast } from 'sonner';
import { X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: Task | null;
}

const categoryColors: Record<TaskCategory, string> = {
  'digital-twin': 'bg-category-digital-twin',
  'hacking': 'bg-category-hacking',
  'math': 'bg-category-math',
  'custom': 'bg-category-custom',
};

export const TaskForm: React.FC<TaskFormProps> = ({ open, onOpenChange, editTask }) => {
  const { addTask, updateTask } = useTasks();
  const today = getToday();

  const [formData, setFormData] = useState({
    name: '',
    category: 'digital-twin' as TaskCategory,
    customCategory: '',
    startDate: today,
    endDate: today,
    priority: 'medium' as 'low' | 'medium' | 'high',
    dayPattern: 'daily' as DayPattern,
    customDays: [] as Weekday[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTask) {
      setFormData({
        name: editTask.name,
        category: editTask.category,
        customCategory: editTask.customCategory || '',
        startDate: editTask.startDate,
        endDate: editTask.endDate,
        priority: editTask.priority || 'medium',
        dayPattern: editTask.dayPattern || 'daily',
        customDays: editTask.customDays || [],
      });
    } else {
      setFormData({
        name: '',
        category: 'digital-twin',
        customCategory: '',
        startDate: today,
        endDate: today,
        priority: 'medium',
        dayPattern: 'daily',
        customDays: [],
      });
    }
    setErrors({});
  }, [editTask, open, today]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (formData.category === 'custom' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Custom category name is required';
    }

    if (!isValidDateRange(formData.startDate, formData.endDate)) {
      newErrors.endDate = 'End date must be after or equal to start date';
    }

    if (formData.dayPattern === 'custom' && formData.customDays.length === 0) {
      newErrors.customDays = 'Select at least one day';
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
      customCategory: formData.category === 'custom' ? formData.customCategory.trim() : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: formData.priority,
      dayPattern: formData.dayPattern,
      customDays: formData.dayPattern === 'custom' ? formData.customDays : undefined,
    };

    if (editTask) {
      updateTask({ ...editTask, ...taskData });
      toast.success('Task updated successfully');
    } else {
      addTask(taskData);
      toast.success('Task created successfully');
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editTask ? 'Edit Task' : 'Create New Task'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as TaskCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${categoryColors[key as TaskCategory]}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Category Name */}
          {formData.category === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customCategory">Custom Category Name</Label>
              <Input
                id="customCategory"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="Enter category name"
                className={errors.customCategory ? 'border-destructive' : ''}
              />
              {errors.customCategory && (
                <p className="text-xs text-destructive">{errors.customCategory}</p>
              )}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={errors.endDate ? 'border-destructive' : ''}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Day Pattern */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Repeat Pattern
            </Label>
            <Select
              value={formData.dayPattern}
              onValueChange={(value) => setFormData({ ...formData, dayPattern: value as DayPattern })}
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
          {formData.dayPattern === 'custom' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2">
                {allWeekdays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(day)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      formData.customDays.includes(day)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50'
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
              onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}
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
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
