-- Run this SQL in your Supabase Dashboard SQL Editor to update the schema for the new features.

-- Add new columns to the 'tasks' table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_carry_forward BOOLEAN DEFAULT FALSE;

-- The 'status' column in 'daily_progress' is text, so it fits 'saved-the-day' without changes.
-- However, if you have a check constraint, you might need to update it.
-- Checking if a constraint exists:
-- SELECT * FROM information_schema.check_constraints WHERE constraint_name = 'daily_progress_status_check';

-- If there is a check constraint on status, drop and recreate it:
-- ALTER TABLE daily_progress DROP CONSTRAINT IF EXISTS daily_progress_status_check;
-- ALTER TABLE daily_progress ADD CONSTRAINT daily_progress_status_check 
--   CHECK (status IN ('done', 'skipped', 'partial', 'pending', 'saved-the-day'));
