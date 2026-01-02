# Span Tracker - Application Features

Span Tracker is a comprehensive task management and habit tracking application designed to help users maintain consistency across various domains like Digital Twin, Hacking, Math, and Custom projects.

## Core Features

### 1. Task Management
*   **Create & Edit Tasks**: detailed task creation with support for:
    *   **Type**: Distinguish between deadline-driven **Tasks** and habit-building **Routines**.
    *   **Categories**: Pre-defined (Digital Twin, Hacking, Math) and Custom categories with color coding.
    *   **Scheduling**: Define specific Start Dates and optional End Dates (for ongoing Routines).
    *   **Recurrence Patterns**: flexible repetition options including:
        *   Every Day
        *   Weekdays Only
        *   Weekends Only
        *   Custom Days (select specific days of the week).
    *   **Priorities**: Low, Medium, High.
*   **Task List**: View all tasks associated with their active dates, filtered by type or category.

### 2. Daily Progress Tracking
*   **Status Updates**: Mark tasks as:
    *   ✅ **Done**: Completed successfully.
    *   ⏭️ **Skipped**: Intentionally missed.
    *   🌗 **Partial**: Started but not finished.
    *   ⏳ **Pending**: Yet to be addressed.
    *   🛡️ **Saved the Day**: High-effort completion.
*   **Time Tracking**: Log the duration spent on each task (in minutes) manually or via built-in timer.
*   **Notes**: Attach specific notes to daily entries for context or reflection.

### 3. Analytics & Visualization
*   **Dashboard**: A central hub showing today's tasks and immediate progress.
*   **Consistency Calendar**: A visual heatmap or calendar view to track streaks and completion history over time.
*   **Charts**:
    *   **Progress Charts**: Visual breakdown of completion rates.
    *   **Daily Trends**: Analyze productivity trends over days/weeks.
    *   **Category Breakdown**: See which areas of life are getting the most attention.
*   **Streak Tracking**: monitor consecutive days of activity to build momentum.

### 4. Data Management & Sync
*   **Cloud Synchronization**: Seamlessly sync data across devices using Supabase integration.
    *   **Real-time Sync**: Changes are pushed to the cloud automatically when online.
    *   **Auth Requirement**: Data persistence currently requires user authentication.
*   **Import/Export**:
    *   **Export**: Download your entire data history as a JSON file.
    *   **Import**: Restore data from backup files.
*   **Migration System**: Auto-migrates legacy data formats (e.g., ID updates) to ensure compatibility.

### 5. Settings & Customization
*   **Theme Support**: Light and Dark mode toggles.
*   **User Management**: Authentication and user profiles.

## Technical Highlights
*   **Reactive UI**: Built with React and TypeScript for a robust user experience.
*   **Modern Design**: Utilizes Shadcn UI and Tailwind CSS for a sleek, responsive interface.
*   **UUIDs**: Uses robust unique identifiers for secure and conflict-free data handling.
