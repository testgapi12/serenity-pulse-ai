import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoodSelector } from "@/components/MoodSelector";
import { StressTracker } from "@/components/StressTracker";
import BreathingTimer from "@/components/BreathingTimer";
import { JournalEntry } from "@/components/JournalEntry";
import { WellnessSuggestions } from "@/components/WellnessSuggestions";
import DailyTaskTracker from "@/components/DailyTaskTracker";
import { Heart, Brain, Calendar, BarChart3, Target } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-wellness.jpg";

const HomePage = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [journalText, setJournalText] = useState<string>("");
  const [hasDataToday, setHasDataToday] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Update date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodaysEntry();
    }
  }, [user]);

  const fetchTodaysEntry = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching mood entry:', error);
        return;
      }

      if (data) {
        setSelectedMood(data.mood_score);
        setStressLevel(data.stress_level);
        setJournalText(data.journal_text || "");
        setHasDataToday(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveEntry = async () => {
    if (!user) {
      toast.error("Please log in to save your entry");
      return;
    }

    try {
      const entryData = {
        user_id: user.id,
        entry_date: today,
        mood_score: selectedMood,
        stress_level: stressLevel,
        journal_text: journalText.trim() || null,
      };

      if (hasDataToday) {
        // Update existing entry
        const { error } = await supabase
          .from('mood_entries')
          .update(entryData)
          .eq('user_id', user.id)
          .eq('entry_date', today);

        if (error) throw error;
        toast.success("Entry updated successfully! 🌟");
      } else {
        // Create new entry
        const { error } = await supabase
          .from('mood_entries')
          .insert(entryData);

        if (error) throw error;
        setHasDataToday(true);
        toast.success("Entry saved successfully! 🌟");
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error("Failed to save entry. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
          <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto px-6">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Welcome Back! 🌟
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {currentDate}
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Take a moment to check in with yourself and track your wellness journey
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-4 animate-slide-up flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-wellness-peach" />
                <span>Mood Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4 text-wellness-blue" />
                <span>Breathing Exercises</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4 text-wellness-green" />
                <span>Daily Goals</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4 text-wellness-lavender" />
                <span>Progress Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {hasDataToday && (
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm">
                ✓ Wellness entry saved for today
              </div>
            </div>
          )}

          {/* Top Row - Daily Goals */}
          <div className="mb-8">
            <DailyTaskTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-8">
              <MoodSelector 
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
                className="animate-fade-in"
              />
              
              <StressTracker
                stressLevel={stressLevel}
                onStressChange={setStressLevel}
                className="animate-fade-in"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <BreathingTimer className="animate-fade-in" />
              
              <WellnessSuggestions
                mood={selectedMood}
                stressLevel={stressLevel}
                className="animate-fade-in"
              />
            </div>
          </div>

          {/* Journal Section */}
          <div className="mb-8">
            <JournalEntry
              journalText={journalText}
              onJournalChange={setJournalText}
              onSave={handleSaveEntry}
              className="animate-fade-in"
            />
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-md mx-auto p-6 bg-wellness-gradient border-wellness-green/20">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ready to save your progress?</h3>
                <p className="text-sm text-muted-foreground">
                  {hasDataToday 
                    ? "Update today's entry to track your wellness journey over time"
                    : "Save today's entry to track your wellness journey over time"
                  }
                </p>
                <Button 
                  onClick={handleSaveEntry}
                  size="lg"
                  className="w-full"
                >
                  {hasDataToday ? "Update Today's Entry" : "Save Today's Entry"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;