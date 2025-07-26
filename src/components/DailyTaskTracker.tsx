import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DailyTask {
  id: string;
  task_1: string | null;
  task_2: string | null;
  task_3: string | null;
  task_1_status: string;
  task_2_status: string;
  task_3_status: string;
  task_date: string;
}

const DailyTaskTracker = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask | null>(null);
  const [newTasks, setNewTasks] = useState<string[]>(['', '', '']);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchTodaysTasks();
    }
  }, [user]);

  const fetchTodaysTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tasks:', error);
        return;
      }

      if (data) {
        setTasks(data);
        setNewTasks([data.task_1 || '', data.task_2 || '', data.task_3 || '']);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async () => {
    if (!user) return;

    try {
      const taskData = {
        user_id: user.id,
        task_date: today,
        task_1: newTasks[0] || null,
        task_2: newTasks[1] || null,
        task_3: newTasks[2] || null,
        task_1_status: 'pending' as const,
        task_2_status: 'pending' as const,
        task_3_status: 'pending' as const,
      };

      if (tasks) {
        // Update existing
        const { error } = await supabase
          .from('daily_tasks')
          .update(taskData)
          .eq('id', tasks.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('daily_tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        setTasks(data);
      }

      await fetchTodaysTasks();
      setIsEditing(false);
      toast.success("Tasks updated successfully! 🎯");
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast.error("Failed to save tasks");
    }
  };

  const updateTaskStatus = async (taskIndex: number, status: 'complete' | 'failed' | 'pending') => {
    if (!user || !tasks) return;

    try {
      const statusField = `task_${taskIndex + 1}_status`;
      const { error } = await supabase
        .from('daily_tasks')
        .update({ [statusField]: status })
        .eq('id', tasks.id);

      if (error) throw error;

      await fetchTodaysTasks();
      
      const statusMessages = {
        complete: "Great job! Task completed! 🎉",
        failed: "No worries, there's always tomorrow! 💪",
        pending: "Task reset to pending"
      };
      
      toast.success(statusMessages[status]);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("Failed to update task status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-wellness-green" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      complete: { variant: "default" as const, className: "bg-wellness-green text-white" },
      failed: { variant: "destructive" as const, className: "" },
      pending: { variant: "secondary" as const, className: "" }
    };
    
    return variants[status as keyof typeof variants] || variants.pending;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  const currentTasks = [
    { text: tasks?.task_1, status: tasks?.task_1_status || 'pending' },
    { text: tasks?.task_2, status: tasks?.task_2_status || 'pending' },
    { text: tasks?.task_3, status: tasks?.task_3_status || 'pending' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Daily Goals</span>
            <Badge variant="outline" className="text-xs">
              {today}
            </Badge>
          </CardTitle>
          
          {!isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {tasks ? 'Edit' : 'Set Goals'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up to 3 daily goals to track your progress:
            </p>
            
            {newTasks.map((task, index) => (
              <div key={index}>
                <Input
                  placeholder={`Goal ${index + 1} (optional)`}
                  value={task}
                  onChange={(e) => {
                    const updated = [...newTasks];
                    updated[index] = e.target.value;
                    setNewTasks(updated);
                  }}
                  className="w-full"
                />
              </div>
            ))}
            
            <div className="flex space-x-2">
              <Button onClick={saveTasks} size="sm">
                Save Goals
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTasks.some(task => task.text) ? (
              currentTasks.map((task, index) => (
                task.text && (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(task.status)}
                      <span className={`flex-1 ${task.status === 'complete' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.text}
                      </span>
                      <Badge {...getStatusBadge(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1 ml-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateTaskStatus(index, 'complete')}
                        disabled={task.status === 'complete'}
                        className="text-wellness-green hover:text-wellness-green"
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateTaskStatus(index, 'failed')}
                        disabled={task.status === 'failed'}
                        className="text-destructive hover:text-destructive"
                      >
                        ✗
                      </Button>
                      {task.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTaskStatus(index, 'pending')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ↺
                        </Button>
                      )}
                    </div>
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No goals set for today.</p>
                <p className="text-sm">Click "Set Goals" to add your daily objectives!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTaskTracker;