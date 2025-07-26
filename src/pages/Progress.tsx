import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';

interface MoodEntry {
  id: string;
  mood_score: number;
  stress_level: number;
  journal_text: string;
  entry_date: string;
  created_at: string;
}

interface DailyTask {
  id: string;
  task_date: string;
  task_1_status: string;
  task_2_status: string;
  task_3_status: string;
}

export default function Progress() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [timeFilter, setTimeFilter] = useState('30');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeFilter]);

  const fetchData = async () => {
    if (!user) return;

    const days = parseInt(timeFilter);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    try {
      // Fetch mood entries
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', format(startDate, 'yyyy-MM-dd'))
        .lte('entry_date', format(endDate, 'yyyy-MM-dd'))
        .order('entry_date', { ascending: true });

      if (moodError) throw moodError;
      setMoodEntries(moodData || []);

      // Fetch daily tasks
      const { data: taskData, error: taskError } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('task_date', format(startDate, 'yyyy-MM-dd'))
        .lte('task_date', format(endDate, 'yyyy-MM-dd'))
        .order('task_date', { ascending: true });

      if (taskError) throw taskError;
      setDailyTasks(taskData || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  // Process mood data for charts
  const moodChartData = moodEntries.map(entry => ({
    date: format(new Date(entry.entry_date), 'MMM dd'),
    mood: entry.mood_score,
    stress: entry.stress_level,
    fullDate: entry.entry_date,
  }));

  // Process task completion data
  const taskCompletionData = dailyTasks.map(task => {
    const completedTasks = [
      task.task_1_status === 'complete',
      task.task_2_status === 'complete',
      task.task_3_status === 'complete'
    ].filter(Boolean).length;
    
    return {
      date: format(new Date(task.task_date), 'MMM dd'),
      completed: completedTasks,
      total: 3
    };
  });

  // Calculate statistics
  const averageMood = moodEntries.length > 0 
    ? (moodEntries.reduce((acc, entry) => acc + entry.mood_score, 0) / moodEntries.length).toFixed(1)
    : '0';

  const averageStress = moodEntries.length > 0
    ? (moodEntries.reduce((acc, entry) => acc + entry.stress_level, 0) / moodEntries.length).toFixed(1)
    : '0';

  const totalTasksCompleted = dailyTasks.reduce((acc, task) => {
    return acc + [
      task.task_1_status === 'complete',
      task.task_2_status === 'complete', 
      task.task_3_status === 'complete'
    ].filter(Boolean).length;
  }, 0);

  const totalTasks = dailyTasks.length * 3;
  const completionRate = totalTasks > 0 ? ((totalTasksCompleted / totalTasks) * 100).toFixed(1) : '0';

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Progress Insights</h1>
          <p className="text-muted-foreground mt-2">Track your wellness journey over time</p>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-soft">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
                <p className="text-2xl font-bold text-primary">{averageMood}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-stress-low/20">
                <Calendar className="w-5 h-5 text-stress-medium" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Stress</p>
                <p className="text-2xl font-bold text-stress-medium">{averageStress}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-wellness-green/20">
                <Target className="w-5 h-5 text-wellness-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-2xl font-bold text-wellness-green">{totalTasksCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary-soft">
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-secondary">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mood Trend */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>Mood Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary-soft))"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stress Trend */}
        <Card className="chart-card">
          <CardHeader>
            <CardTitle>Stress Level Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="hsl(var(--stress-medium))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--stress-medium))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Completion Chart */}
      <Card className="chart-card">
        <CardHeader>
          <CardTitle>Daily Task Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 3]} />
                <Tooltip />
                <Bar 
                  dataKey="completed" 
                  fill="hsl(var(--wellness-green))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}