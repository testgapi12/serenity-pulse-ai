import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoodSelector } from "@/components/MoodSelector";
import { StressTracker } from "@/components/StressTracker";
import BreathingTimer from "@/components/BreathingTimer";
import { JournalEntry } from "@/components/JournalEntry";
import { WellnessSuggestions } from "@/components/WellnessSuggestions";
import { Heart, Brain, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-wellness.jpg";

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [journalText, setJournalText] = useState<string>("");
  const [hasDataToday, setHasDataToday] = useState<boolean>(false);

  const handleSaveEntry = async () => {
    // For now, just save to localStorage until Supabase is connected
    const today = new Date().toISOString().split('T')[0];
    const entry = {
      date: today,
      mood: selectedMood,
      stress: stressLevel,
      journal: journalText,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`wellness-entry-${today}`, JSON.stringify(entry));
    setHasDataToday(true);
    toast.success("Entry saved successfully! 🌟");
  };

  useEffect(() => {
    // Check if there's already an entry for today
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = localStorage.getItem(`wellness-entry-${today}`);
    if (existingEntry) {
      const entry = JSON.parse(existingEntry);
      setSelectedMood(entry.mood);
      setStressLevel(entry.stress);
      setJournalText(entry.journal);
      setHasDataToday(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-[60vh] bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
          <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto px-6">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                Serenity Pulse
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your personal wellness companion for mindful living, stress tracking, and emotional balance
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-4 animate-slide-up">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-wellness-peach" />
                <span>Mood Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4 text-wellness-blue" />
                <span>Breathing Exercises</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4 text-wellness-green" />
                <span>Progress Insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">
                Today's Wellness Check-in
              </h2>
            </div>
            <p className="text-muted-foreground">
              Take a moment to reflect on your mental and emotional state
            </p>
            {hasDataToday && (
              <div className="mt-4 inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm">
                ✓ Entry saved for today
              </div>
            )}
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
                  Save today's entry to track your wellness journey over time
                </p>
                <Button 
                  onClick={handleSaveEntry}
                  size="lg"
                  className="w-full"
                  disabled={!selectedMood && !journalText.trim()}
                >
                  Save Today's Entry
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
