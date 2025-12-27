-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. TASKS TABLE
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('digital-twin', 'hacking', 'math', 'custom')),
    custom_category TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    day_pattern TEXT NOT NULL DEFAULT 'daily' CHECK (day_pattern IN ('daily', 'weekdays', 'weekends', 'custom')),
    custom_days INTEGER[], -- Array of 0-6 integers [0=Sun, 6=Sat]
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_paused BOOLEAN DEFAULT FALSE,
    auto_carry_forward BOOLEAN DEFAULT FALSE,
    milestone_id UUID, -- Optional link to milestones
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Tasks
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_dates ON public.tasks(start_date, end_date);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tasks" 
    ON public.tasks FOR ALL 
    USING (auth.uid() = user_id);

-- 3. DAILY PROGRESS TABLE
CREATE TABLE public.daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'skipped', 'partial', 'pending', 'saved-the-day')),
    time_spent INTEGER DEFAULT 0, -- In minutes
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, date) -- Constraint to prevent duplicate entries per task/day
);

-- Indexes for Daily Progress
CREATE INDEX idx_progress_user_id ON public.daily_progress(user_id);
CREATE INDEX idx_progress_task_date ON public.daily_progress(task_id, date);

-- Enable RLS for daily_progress
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own progress" 
    ON public.daily_progress FOR ALL 
    USING (auth.uid() = user_id);

-- 4. MILESTONES TABLE (Feature you just added)
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    custom_category TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'skipped')),
    reflection TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Milestones
CREATE INDEX idx_milestones_user_year_month ON public.milestones(user_id, year, month);

-- Enable RLS for milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own milestones" 
    ON public.milestones FOR ALL 
    USING (auth.uid() = user_id);

-- 5. USER PREFERENCES TABLE (New Request)
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT TRUE,
    start_of_week INTEGER DEFAULT 1 CHECK (start_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon
    show_completed_tasks BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own preferences" 
    ON public.user_preferences FOR ALL 
    USING (auth.uid() = user_id);

-- 6. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_progress_modtime BEFORE UPDATE ON public.daily_progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_milestones_modtime BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_preferences_modtime BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
