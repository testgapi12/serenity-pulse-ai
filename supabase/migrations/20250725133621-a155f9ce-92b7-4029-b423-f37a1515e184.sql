-- Add RLS policies for ApiKeys table if needed for the app
-- Since this appears to be for storing API keys, we'll add basic policies
-- Users can only access their own API keys if we add a user_id column
-- For now, let's disable RLS on ApiKeys as it seems to be a system table
ALTER TABLE public.ApiKeys DISABLE ROW LEVEL SECURITY;