import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const moods = [
  { emoji: "😄", label: "Excellent", value: 5, color: "stress-low" },
  { emoji: "😊", label: "Good", value: 4, color: "wellness-green" },
  { emoji: "😐", label: "Okay", value: 3, color: "wellness-blue" },
  { emoji: "😟", label: "Low", value: 2, color: "stress-medium" },
  { emoji: "😢", label: "Very Low", value: 1, color: "stress-high" },
];

interface MoodSelectorProps {
  selectedMood?: number;
  onMoodSelect: (mood: number) => void;
  className?: string;
}

export const MoodSelector = ({ selectedMood, onMoodSelect, className }: MoodSelectorProps) => {
  return (
    <Card className={`mood-card ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">How are you feeling today?</h3>
        <div className="flex justify-center gap-3 flex-wrap">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className={`flex flex-col items-center p-4 h-auto min-w-[80px] transition-all duration-300 hover:scale-105 ${
                selectedMood === mood.value 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "hover:bg-primary-soft hover:border-primary"
              }`}
              onClick={() => onMoodSelect(mood.value)}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};