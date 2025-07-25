import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Heart, Coffee, Music } from "lucide-react";
import { useEffect, useState } from "react";

interface Suggestion {
  icon: any;
  title: string;
  description: string;
  action: string;
}

interface WellnessSuggestionsProps {
  mood: number;
  stressLevel: number;
  className?: string;
}

const getSuggestions = (mood: number, stressLevel: number): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Mood-based suggestions
  if (mood <= 2) {
    suggestions.push({
      icon: Heart,
      title: "Practice Self-Compassion",
      description: "Be kind to yourself today. You're doing your best.",
      action: "Try a gentle breathing exercise"
    });
    suggestions.push({
      icon: Music,
      title: "Listen to Uplifting Music",
      description: "Music can help shift your mood naturally.",
      action: "Play your favorite upbeat songs"
    });
  } else if (mood >= 4) {
    suggestions.push({
      icon: Coffee,
      title: "Share Your Joy",
      description: "Your positive energy can inspire others.",
      action: "Connect with a friend or loved one"
    });
  }

  // Stress-based suggestions
  if (stressLevel >= 7) {
    suggestions.push({
      icon: Lightbulb,
      title: "Take a Mental Break",
      description: "High stress detected. Time to pause and reset.",
      action: "Try a 5-minute meditation"
    });
    suggestions.push({
      icon: Heart,
      title: "Progressive Muscle Relaxation",
      description: "Release physical tension to calm your mind.",
      action: "Tense and relax each muscle group"
    });
  } else if (stressLevel <= 3) {
    suggestions.push({
      icon: Lightbulb,
      title: "Maintain Your Balance",
      description: "You're in a great mental space. Keep it going!",
      action: "Practice gratitude for 2 minutes"
    });
  }

  // Combined suggestions
  if (mood <= 3 && stressLevel >= 6) {
    suggestions.push({
      icon: Heart,
      title: "Gentle Movement",
      description: "Light exercise can improve both mood and stress.",
      action: "Take a 10-minute walk outside"
    });
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
};

export const WellnessSuggestions = ({ mood, stressLevel, className }: WellnessSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSuggestions(getSuggestions(mood, stressLevel));
  }, [mood, stressLevel]);

  const markAsCompleted = (action: string) => {
    setCompletedActions(prev => new Set([...prev, action]));
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`mood-card ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-wellness-peach" />
          <h3 className="text-lg font-semibold">Wellness Suggestions</h3>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-wellness-gradient">
              <div className="flex items-start gap-3">
                <suggestion.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant={completedActions.has(suggestion.action) ? "secondary" : "outline"}
                className="w-full text-xs"
                onClick={() => markAsCompleted(suggestion.action)}
                disabled={completedActions.has(suggestion.action)}
              >
                {completedActions.has(suggestion.action) ? "✓ Completed" : suggestion.action}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};