# Span Tracker - Complete Project Features Documentation

This document provides a comprehensive and detailed list of all features implemented in the Span Tracker application, including functional capabilities, technical implementations, and UI/UX details.

## 1. Core Functional Features

### 1.1 Task Management

The core of the application revolves around creating and managing long-term tasks and routines.

- **Task Types**:
  - **Tasks**: Deadline-driven items with a specific end date.
  - **Routines**: Ongoing habits with optional end dates.
- **Categorization**:
  - **Pre-defined Categories**: Digital Twin, Hacking, Math.
  - **Custom Categories**: User-defined categories with custom labels.
  - **Visual Coding**: Each category is color-coded for quick identification (Blue, Green, Amber, Purple/Pink).
- **Scheduling & Recurrence**:
  - **Date Range**: customizable Start and End dates.
  - **Flexible Repetition**:
    - Daily (Every day)
    - Weekdays (Mon-Fri)
    - Weekends (Sat-Sun)
    - Custom Days (Specific days of the week)
- **Task Attributes**:
  - **Priority Levels**: Low, Medium, High.
  - **Status**: Active, Paused, or Completed/Ended.
  - **Pause/Resume**: Ability to temporarily pause a task from generating daily to-dos (available in Weekly Review).

### 1.2 Daily Progress Tracking (`Today` Page)

A dynamic daily view (`/`) that generates a checklist based on active tasks for the current date.

- **Daily Actions**:
  - ✅ **Done**: Mark as successfully completed.
  - ⏭️ **Skipped**: Intentionally missed for the day.
  - 🌗 **Partial**: Started but not fully completed.
  - ⏳ **Pending**: Default state for the day.
  - 🛡️ **Saved the Day**: Special status for high-effort completions.
- **Detailed Tracking**:
  - **Timer/Time Log**: Track minutes spent on each task manually or via a built-in timer.
  - **Daily Notes**: Add context or reflection notes for specific task entries.
- **Navigation**:
  - **Date Traversal**: Move between past and future dates.
  - **Jump to Today**: Quick return to the current date.
- **Dashboard Widgets**:
  - Today's Summary (Total, Completed, Remaining).
  - "Starting Soon" for upcoming tasks.
  - 7-Day Outlook.

### 1.3 Analytics & Visualization (`Analytics` Page)

Deep insights into productivity and habits.

- **Metrics**:
  - Completion Rate (%).
  - Current & Longest Streaks.
  - Total Hours Tracked.
  - Count of Completed vs. Skipped/Partial days.
- **Visual Charts** (powered by Recharts):
  - **Daily Trend**: Visual line/area chart of completion rates over time.
  - **Category Distribution**: Pie chart showing focus distribution.
  - **Task Progress**: Bar charts comparing individual task completion.
- **Consistency Calendar**: A GitHub-style contribution heatmap showing activity per day.
- **Time Ranges**: Filter data by Last 5 days, 1 Week, 1 Month, 3 Months, or All Time.

### 1.4 Weekly Review System (`Weekly Review` Page) 🆕

A dedicated interface for reflecting on the past week's performance.

- **Performance Charts**:
  - **Completion Rate**: Planned vs. Completed tasks.
  - **Category Balance**: Where your focus went during the week.
- **Insight Generation**:
  - **Struggling Tasks**: Automatically identifies tasks that were skipped most often (Top 3) to highlight areas for improvement.
- **Management Tools**:
  - **Quick Priority Adjust**: Update priorities for tasks directly from the review screen.
  - **Pause Toggle**: Easily pause tasks that aren't working out or are on hold.

### 1.5 Data Management & Settings

- **Cloud Synchronization**:
  - Powered by **Supabase**.
  - Real-time updates across devices.
- **Import/Export**:
  - **JSON Export**: Download full data backup.
  - **JSON Import**: Restore from backup.
- **Data Safety**:
  - **Dangerous Zone**: Clear all data option with confirmation.
- **Migration System**: Built-in dialog to handle data schema updates (e.g., migrating IDs) automatically for legacy data.

### 1.6 Authentication

- **Secure Access**: Full login/signup flow (`/auth`).
- **Protected Routes**: Middleware to ensure only authenticated users access application pages.
- **User Profile**: User menu for account management.

---

## 2. Technical Features & Architecture

### 2.1 Framework & Build

- **Tech Stack**: React 18, TypeScript, Vite.
- **Performance**:
  - **Lazy Loading**: Route-based code splitting using `React.lazy` and `Suspense` with a custom `PageLoader`.
  - **Optimistic Updates**: UI updates immediately before server confirmation for a snappy feel.

### 2.2 State Management

- **Context API**: Custom Providers for global state:
  - `TaskProvider`: Manages tasks and daily progress.
  - `AuthProvider`: Manages user sessions.
  - `SettingsProvider`: App-wide settings.
  - `ThemeProvider`: UI theming.
- **React Query**: Used for efficient server state management.

### 2.3 Reliability

- **Error Boundary**: React Error Boundary component to catch and display graceful errors instead of crashing the app.
- **Offline Support**:
  - `OfflineIndicator`: Visual UI element alerting the user when network connectivity is lost.
- **Type Safety**: Comprehensive TypeScript interfaces for `Task`, `DailyProgress`, and application state.

### 2.4 Routing

- **React Router 6**: Client-side routing.
- **Navigation Guards**: `ProtectedRoute` component to handle auth redirects.
- **404 Handling**: Dedicated `NotFound` page.

---

## 3. UI/UX Design System

### 3.1 Components (Shadcn UI)

Built on top of Radix UI primitives and Tailwind CSS.

- **Interactive Elements**: Dialogs, Popovers, Selects, Switches, Toasts.
- **Feedback**: Sonner toasts for success/error messages.
- **Layout**: Responsive grid system, collapsible sidebars/cards.

### 3.2 Theming

- **Dark/Light Mode**: Fully supported with local storage persistence.
- **Tailwind CSS**: Utility-first styling for rapid and consistent design.
- **Animations**: `tailwindcss-animate` for smooth transitions (fade-ins, slide-ups).

### 3.3 Responsiveness

- **Mobile First**: All pages are optimized for touch targets (44px+) and small screens.
- **Adaptive Charts**: Charts resize dynamically based on container width.
