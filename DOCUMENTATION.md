# TaskFlow - Personal Task Planning & Progress Tracking App

A production-ready, frontend-only web application for planning long-range tasks and tracking daily progress. Built with React, Vite, TypeScript, and Tailwind CSS.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Pages & Navigation](#pages--navigation)
4. [Data Model](#data-model)
5. [Storage & Persistence](#storage--persistence)
6. [Analytics & Progress Tracking](#analytics--progress-tracking)
7. [Data Management](#data-management)
8. [Tech Stack](#tech-stack)

---

## Overview

TaskFlow is a personal productivity app that helps users:
- Create long-range tasks and ongoing routines
- Track daily progress on each task
- Visualize completion rates and consistency
- Build habits through streak tracking

**Key Principles:**
- Cloud-First - Secure synchronization via Supabase
- Seamless Experience - Optimistic updates for snappy UI
- Privacy-focused - User-authenticated data access
- Mobile Responsive - Works on any device

---

## Core Features

### Task Management

#### Creating Tasks & Routines
- **Type**: Choose between **Task** (deadline-based) or **Routine** (habit-based)
- **Task Name**: Required, descriptive name
- **Category**: Choose from predefined categories or create custom
  - Digital Twin
  - Hacking
  - Math
  - Custom (with custom label)
- **Date Range**: 
  - Start Date: Required
  - End Date: Reviewable for Tasks, Optional ("No End Date") for Routines
- **Repeat Pattern**: Flexible recurrence options
  - Daily (Every day)
  - Weekdays (Mon-Fri)
  - Weekends (Sat-Sun)
  - Custom Days (Select specific days)
- **Priority**: Low, Medium, or High
- **Color Coding**: Automatic based on category

#### Task Operations
- **Create**: Add new tasks or routines via the Tasks page
- **Edit**: Modify details (name, dates, type, category, priority)
- **Delete**: Remove tasks with confirmation dialog
- **Search**: Find tasks by name or category
- **Filter**: Filter by Category or Type (Task vs Routine)
- **Sort**: Order by newest, oldest, name, priority, or progress

### Daily Task Tracking

Each task/routine automatically generates daily entries for every active date in its range.

#### Daily Task States
| Status | Description | Visual |
|--------|-------------|--------|
| Done | Task completed for the day | ✓ Green |
| Partial | Partially completed | ◐ Blue |
| Skipped | Intentionally skipped | ✗ Amber |
| Pending | Not yet addressed | ○ Gray |
| Saved the Day | High-effort completion | 🛡️ Blue |

#### Additional Daily Fields
- **Time Spent**: Optional minutes tracking (with built-in timer)
- **Notes**: Optional text notes per day

---

## Pages & Navigation

### 1. Today Page (`/`)

The main daily view showing tasks for the current date.

**Features:**
- **Date Navigation**: Browse past/future dates with arrow buttons
- **"Go to Today" Button**: Quick return to current date
- **Quick Stats Panel** (3 cards):
  - Today's Tasks count
  - Completed count
  - Remaining count
- **Today's Tasks Section**: List of tasks active on selected date
- **Starting Soon Section**: Tasks beginning in the next 3 days
- **Upcoming Week Section**: Preview of next 7 days with task counts

**Task Interaction:**
- Click status buttons (Done/Partial/Skipped) to update
- Expand for time tracking and notes
- Visual feedback for completed tasks

### 2. Tasks Page (`/tasks`)

Central hub for managing all long-range tasks.

**Features:**
- **Stats Dashboard** (3 cards):
  - Total tasks
  - Active tasks (currently in progress)
  - Completed tasks (100% done)
- **Search Bar**: Filter tasks by name
- **Category Filter**: Dropdown to filter by category
- **Sort Options**: Newest, Oldest, Name, Priority, Progress
- **View Modes**: Grid view or compact List view
- **Task Cards**: Visual cards showing progress, dates, and actions

**Task Card Information:**
- Category indicator (color dot)
- Task name
- Priority badge
- Status badge (Active/Upcoming/Ended)
- Date range
- Progress bar with percentage
- Days completed count
- Edit/Delete actions

### 3. Progress Page (`/analytics`)

Comprehensive analytics and progress visualization.

**Controls:**
- **Time Range Selector**: Last 5 days, 1 week, 2 weeks, 1 month, 3 months, All time
- **Chart Type Toggle**: Bar, Line, or Area charts

**Stats Cards** (6 metrics):
| Metric | Description |
|--------|-------------|
| Completion Rate | Overall % of completed task-days |
| Current Streak | Consecutive days with all tasks done |
| Longest Streak | Best streak record in selected period |
| Hours Tracked | Total time logged |
| Completed | Number of task-days marked done |
| Partial/Skipped | Count of partial and skipped days |

**Charts:**
- **Daily Completion Trend**: Day-by-day completion percentage
- **Task Completion**: Per-task progress comparison
- **Category Overview**: Pie chart of category performance
- **Streak Tracking Panel**: 
  - Current streak with emoji indicators
  - Longest streak with date range
  - Weekly average streak days
  - Recent streak history

**Consistency Calendar:**
- Monthly calendar view
- Color-coded days (Complete/Partial/Incomplete/No tasks)
- Visual legend

### 4. Settings Page (`/settings`)

Data management and app information.

**Features:**
- Export data to JSON file
- Import data from JSON backup
- Clear all data (with confirmation)
- App version info

---

## Data Model

## Data Model

### Task Object
```typescript
interface Task {
  id: string;              // Unique identifier (UUID)
  name: string;            // Task name
  type: 'task' | 'routine'; // Distinction between taskTypes
  category: TaskCategory;  // 'digital-twin' | 'hacking' | 'math' | 'custom'
  customCategory?: string; // Custom category name (if category is 'custom')
  startDate: string;       // YYYY-MM-DD format
  endDate: string | null;  // YYYY-MM-DD format, or null for ongoing routines
  dayPattern: DayPattern;  // 'daily', 'weekdays', 'weekends', 'custom'
  customDays?: number[];   // Array of 0-6 (Sun-Sat) for 'custom' pattern
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Daily Progress Object
```typescript
interface DailyProgress {
  taskId: string;          // Reference to parent task
  date: string;            // YYYY-MM-DD format
  status: TaskStatus;      // 'done' | 'skipped' | 'partial' | 'pending' | 'saved-the-day'
  timeSpent?: number;      // Minutes spent (optional)
  notes?: string;          // Daily notes (optional)
}
```

---

## Storage & Persistence

### Cloud Storage (Supabase)
- **Primary Source**: Uses Supabase PostgreSQL database
- **Authentication**: Required for data persistence
- **Syncing**: Real-time sync when online
- **Fallback**: Graceful error handling for connection issues

### Note on Persistence
This application currently relies on authenticated sessions for data storage. There is no local-only persistence for anonymous users; data will be lost on page refresh if not logged in.

---

## Analytics & Progress Tracking

### Streak Calculation
- **Current Streak**: Consecutive days ending today where ALL active tasks were marked "done"
- **Longest Streak**: Maximum streak within selected time period
- Days with no active tasks are auto-skipped (not counted as breaks)

### Progress Metrics
- **Task Progress**: `(completed days / total active days) × 100`
- **Category Progress**: Aggregated across all tasks in category
- **Overall Completion**: Weighted by task-days

### Time Tracking
- Per-task per-day optional minutes
- Built-in timer for real-time tracking
- Aggregated to hours in analytics

---

## Data Management

### Cloud Sync
Data is automatically synced to the cloud. No manual save is required.

### Export
- Downloads complete app data as JSON
- Filename: `taskflow-backup-YYYY-MM-DD.json`
- Includes all tasks and progress

### Import
- Upload previously exported JSON file
- Replaces current cloud data with backup contents

### Clear Data
- Dangerous operation
- Permanently deletes all data from cloud account
- Cannot be undone

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Supabase | Database & Auth |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Recharts | Charts & Graphs |
| date-fns | Date Calculations |
| React Router | Navigation |
| Lucide React | Icons |
| Sonner | Toast Notifications |

---

## File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # App layout with navigation
│   ├── TaskForm.tsx     # Create/edit task modal
│   ├── TaskCard.tsx     # Task display card
│   ├── DailyTaskItem.tsx # Daily task with status controls
│   ├── EmptyState.tsx   # Empty state placeholder
│   ├── ProgressChart.tsx # Task progress bar chart
│   ├── CategoryProgress.tsx # Category pie chart
│   ├── DailyTrendChart.tsx # Daily completion trend
│   ├── ConsistencyCalendar.tsx # Monthly calendar view
│   ├── StatsCards.tsx   # Analytics stat cards
│   ├── StreakDisplay.tsx # Streak tracking panel
│   └── DataManagement.tsx # Export/Import/Clear
├── context/
│   └── TaskContext.tsx  # Global state management
├── hooks/
│   └── use-toast.ts     # Toast notifications
├── pages/
│   ├── Index.tsx        # Today page
│   ├── Tasks.tsx        # Tasks management
│   ├── Analytics.tsx    # Progress & stats
│   ├── Settings.tsx     # Data management
│   └── NotFound.tsx     # 404 page
├── types/
│   └── task.ts          # TypeScript types
├── utils/
│   ├── dateUtils.ts     # Date helper functions
│   └── storageUtils.ts  # localStorage helpers
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles & design system
```

---

## Mobile Responsiveness

The app is fully responsive with:
- Touch-friendly button sizes (44px minimum touch targets)
- Responsive grid layouts
- Mobile-optimized navigation bar
- Safe area support for notched devices
- Collapsible sections on small screens
- Responsive typography scaling

---

## Design System

### Colors (HSL-based)
- **Primary**: Blue accent for actions
- **Status Colors**:
  - Done: Green
  - Skipped: Amber
  - Partial: Blue
  - Pending: Gray
- **Category Colors**:
  - Digital Twin: Purple
  - Hacking: Green
  - Math: Cyan
  - Custom: Pink
- **Priority Colors**:
  - High: Red
  - Medium: Amber
  - Low: Gray

### Typography
- **Font**: Space Grotesk (display), JetBrains Mono (code)
- **Weights**: 300-700
- **Responsive scaling**: sm/base/lg sizes

---

## Future Enhancement Ideas

- [ ] Dark mode toggle
- [ ] Push notifications/reminders
- [ ] Cloud sync (with Lovable Cloud)
- [ ] Recurring task templates
- [ ] Focus/Pomodoro timer
- [ ] Weekly email summaries
- [ ] Drag-and-drop task ordering
- [ ] Tags/labels for tasks
- [ ] Subtasks support
- [ ] Calendar integration

---

## Version History

### v1.0.0 (Current)
- Full CRUD for long-range tasks
- Daily progress tracking with states
- Time and notes per day
- Analytics with charts
- Streak tracking
- Export/Import functionality
- Mobile responsive design
