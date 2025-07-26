-- Create daily tasks table
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_1 TEXT,
  task_2 TEXT,
  task_3 TEXT,
  task_1_status TEXT CHECK (task_1_status IN ('pending', 'complete', 'failed')) DEFAULT 'pending',
  task_2_status TEXT CHECK (task_2_status IN ('pending', 'complete', 'failed')) DEFAULT 'pending',
  task_3_status TEXT CHECK (task_3_status IN ('pending', 'complete', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for daily tasks
CREATE POLICY "Users can view their own daily tasks" 
ON public.daily_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily tasks" 
ON public.daily_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" 
ON public.daily_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily tasks" 
ON public.daily_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all daily tasks
CREATE POLICY "Admins can view all daily tasks" 
ON public.daily_tasks 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_tasks_updated_at
BEFORE UPDATE ON public.daily_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();