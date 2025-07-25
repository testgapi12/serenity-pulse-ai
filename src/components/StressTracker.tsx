import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface StressTrackerProps {
  stressLevel: number;
  onStressChange: (level: number) => void;
  className?: string;
}

const getStressColor = (level: number) => {
  if (level <= 3) return "stress-low";
  if (level <= 6) return "stress-medium";
  return "stress-high";
};

const getStressLabel = (level: number) => {
  if (level <= 2) return "Very Relaxed";
  if (level <= 4) return "Calm";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "Stressed";
  return "Very Stressed";
};

export const StressTracker = ({ stressLevel, onStressChange, className }: StressTrackerProps) => {
  return (
    <Card className={`mood-card ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Current Stress Level</h3>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold text-${getStressColor(stressLevel)}`}>
              {stressLevel}
            </span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <p className={`text-sm font-medium text-${getStressColor(stressLevel)} mt-1`}>
            {getStressLabel(stressLevel)}
          </p>
        </div>
        
        <div className="px-2">
          <Slider
            value={[stressLevel]}
            onValueChange={(value) => onStressChange(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Relaxed</span>
            <span>Moderate</span>
            <span>Stressed</span>
          </div>
        </div>
      </div>
    </Card>
  );
};