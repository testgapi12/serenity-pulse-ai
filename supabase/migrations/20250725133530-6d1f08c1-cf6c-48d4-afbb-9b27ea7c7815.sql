-- Add missing RLS policies for wellness_suggestions
CREATE POLICY "Users can delete their own suggestions" 
ON public.wellness_suggestions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" 
ON public.wellness_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add missing policies for user_roles
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add missing policies for profiles
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);