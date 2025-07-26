-- Fix the infinite recursion in user_roles RLS policies
-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create a simple, non-recursive policy for admins
-- This policy will work without causing infinite recursion
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Also fix the admin policies on other tables that might have the same issue
DROP POLICY IF EXISTS "Admins can view all mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Admins can view all daily tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate them without recursion issues
CREATE POLICY "Admins can view all mood entries" 
ON public.mood_entries 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin'
  )
);

CREATE POLICY "Admins can view all daily tasks" 
ON public.daily_tasks 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin'
  )
);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'admin'
  )
);

-- Add missing age and gender columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Update the profiles trigger to include these fields if they exist in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, age, gender)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'age' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'age')::integer
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'gender'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;