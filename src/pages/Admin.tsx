import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, Brain, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalEntries: number;
  avgMoodScore: number;
  avgStressLevel: number;
  activeUsersLast7Days: number;
}

interface UserRole {
  role: string;
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEntries: 0,
    avgMoodScore: 0,
    avgStressLevel: 0,
    activeUsersLast7Days: 0,
  });
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const [stressDistribution, setStressDistribution] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminStats();
      fetchMoodDistribution();
      fetchStressDistribution();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      setLoading(false);
      return;
    }

    setUserRole(data.role);
    setLoading(false);
  };

  const fetchAdminStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total entries
      const { count: totalEntries } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true });

      // Average mood and stress
      const { data: avgData } = await supabase
        .from('mood_entries')
        .select('mood_score, stress_level');

      let avgMoodScore = 0;
      let avgStressLevel = 0;
      if (avgData && avgData.length > 0) {
        avgMoodScore = avgData.reduce((acc, entry) => acc + entry.mood_score, 0) / avgData.length;
        avgStressLevel = avgData.reduce((acc, entry) => acc + entry.stress_level, 0) / avgData.length;
      }

      // Active users last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: activeUsers } = await supabase
        .from('mood_entries')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const uniqueActiveUsers = new Set(activeUsers?.map(entry => entry.user_id) || []).size;

      setStats({
        totalUsers: totalUsers || 0,
        totalEntries: totalEntries || 0,
        avgMoodScore: Number(avgMoodScore.toFixed(1)),
        avgStressLevel: Number(avgStressLevel.toFixed(1)),
        activeUsersLast7Days: uniqueActiveUsers,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchMoodDistribution = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score');

    if (data) {
      const distribution = [1, 2, 3, 4, 5].map(score => ({
        score: `Mood ${score}`,
        count: data.filter(entry => entry.mood_score === score).length,
        color: score <= 2 ? '#ef4444' : score === 3 ? '#f59e0b' : '#10b981'
      }));
      setMoodDistribution(distribution);
    }
  };

  const fetchStressDistribution = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('stress_level');

    if (data) {
      const distribution = Array.from({ length: 10 }, (_, i) => ({
        level: `Level ${i + 1}`,
        count: data.filter(entry => entry.stress_level === i + 1).length,
      }));
      setStressDistribution(distribution);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor app usage and user wellness insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-soft">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-wellness-green/20">
              <Activity className="w-5 h-5 text-wellness-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-wellness-green">{stats.totalEntries}</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-wellness-blue/20">
              <Brain className="w-5 h-5 text-wellness-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Mood Score</p>
              <p className="text-2xl font-bold text-wellness-blue">{stats.avgMoodScore}/5</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stress-medium/20">
              <TrendingUp className="w-5 h-5 text-stress-medium" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users (7d)</p>
              <p className="text-2xl font-bold text-stress-medium">{stats.activeUsersLast7Days}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card className="chart-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mood Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ score, count }) => `${score}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Stress Distribution */}
        <Card className="chart-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stress Level Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--stress-medium))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="stats-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Overall Wellness Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Stress Level</span>
                <span className="font-semibold">{stats.avgStressLevel}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entries per User</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 ? (stats.totalEntries / stats.totalUsers).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User Retention (7d)</span>
                <span className="font-semibold">
                  {stats.totalUsers > 0 ? ((stats.activeUsersLast7Days / stats.totalUsers) * 100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Monitor user engagement and wellness trends from this dashboard.
              </p>
              <p className="text-sm text-muted-foreground">
                Users with consistently high stress levels may benefit from targeted interventions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}