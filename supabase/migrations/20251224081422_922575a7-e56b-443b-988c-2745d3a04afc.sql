-- Create user_preferences table with extensible JSONB schema
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Profile settings
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_type TEXT DEFAULT 'initials',
  avatar_color TEXT DEFAULT '#6366f1',
  
  -- Task defaults
  default_category TEXT DEFAULT 'custom',
  default_color TEXT DEFAULT '#6366f1',
  default_priority TEXT DEFAULT 'medium',
  
  -- App preferences
  week_start TEXT DEFAULT 'monday',
  theme TEXT DEFAULT 'system',
  
  -- Analytics preferences (JSONB for extensibility)
  analytics_preferences JSONB DEFAULT '{"includeSkipped": false, "showTimeSpent": true}'::jsonb,
  
  -- Version for future migrations
  schema_version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_username ON public.user_preferences(username) WHERE username IS NOT NULL;