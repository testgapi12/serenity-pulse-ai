import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, Brain, Activity } from 'lucide-react';

interface MoodEntry {
  id: string;
  mood_score: number;
  stress_level: number;
  journal_text: string;
  entry_date: string;
  created_at: string;
}

export default function Dashboard() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState('7');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMoodEntries();
    }
  }, [user, timeFilter]);

  const fetchMoodEntries = async () => {
    if (!user) return;

    const days = parseInt(timeFilter);
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', format(startDate, 'yyyy-MM-dd'))
      .lte('entry_date', format(endDate, 'yyyy-MM-dd'))
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching mood entries:', error);
    } else {
      setMoodEntries(data || []);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = moodEntries.find(e => e.entry_date === dateStr);
      setSelectedEntry(entry || null);
    }
  };

  const chartData = moodEntries.map(entry => ({
    date: format(new Date(entry.entry_date), 'MMM dd'),
    mood: entry.mood_score,
    stress: entry.stress_level,
    fullDate: entry.entry_date,
  }));

  const averageMood = moodEntries.length > 0 
    ? (moodEntries.reduce((acc, entry) => acc + entry.mood_score, 0) / moodEntries.length).toFixed(1)
    : '0';

  const averageStress = moodEntries.length > 0
    ? (moodEntries.reduce((acc, entry) => acc + entry.stress_level, 0) / moodEntries.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Welcome Back! 🌟</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-muted-foreground">Your Wellness Journey</p>
          <p className="text-muted-foreground">Track your progress and insights over time</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-soft">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Mood</p>
              <p className="text-2xl font-bold text-primary">{averageMood}/5</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stress-low/20">
              <Activity className="w-5 h-5 text-stress-medium" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Stress</p>
              <p className="text-2xl font-bold text-stress-medium">{averageStress}/10</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-wellness-green/20">
              <TrendingUp className="w-5 h-5 text-wellness-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-wellness-green">{moodEntries.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <Card className="chart-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mood Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
          </div>
        </Card>

        {/* Stress Trend */}
        <Card className="chart-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stress Level Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
          </div>
        </Card>
      </div>

      {/* Calendar and Entry Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="calendar-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Entry Calendar
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={{
                hasEntry: moodEntries.map(entry => new Date(entry.entry_date))
              }}
              modifiersStyles={{
                hasEntry: { backgroundColor: 'hsl(var(--primary-soft))', color: 'hsl(var(--primary))' }
              }}
            />
          </div>
        </Card>

        <Card className="entry-details-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Entry Details</h3>
            {selectedEntry ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(selectedEntry.entry_date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mood Score</span>
                  <span className="font-medium">{selectedEntry.mood_score}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stress Level</span>
                  <span className="font-medium">{selectedEntry.stress_level}/10</span>
                </div>
                {selectedEntry.journal_text && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Journal Entry</span>
                    <p className="text-sm bg-secondary/50 p-3 rounded-lg">{selectedEntry.journal_text}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a date to view entry details</p>
                {selectedDate && (
                  <p className="text-sm mt-2">
                    No entry found for {format(selectedDate, 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}