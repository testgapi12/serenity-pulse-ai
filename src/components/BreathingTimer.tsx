import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface BreathingTimerProps {
  className?: string;
}

const breathingPatterns = [
  { name: "1 Minute", duration: 60 },
  { name: "3 Minutes", duration: 180 },
  { name: "5 Minutes", duration: 300 },
];

export const BreathingTimer = ({ className }: BreathingTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [timeLeft, setTimeLeft] = useState(selectedDuration);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCycle, setBreathCycle] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
        
        // Breathing pattern: 4 seconds inhale, 4 seconds hold, 6 seconds exhale
        const cyclePosition = (selectedDuration - timeLeft) % 14;
        if (cyclePosition < 4) {
          setBreathPhase("inhale");
        } else if (cyclePosition < 8) {
          setBreathPhase("hold");
        } else {
          setBreathPhase("exhale");
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setBreathPhase("inhale");
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, selectedDuration]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration);
    setBreathPhase("inhale");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
    }
  };

  return (
    <Card className={`mood-card ${className}`}>
      <div className="space-y-6 text-center">
        <h3 className="text-lg font-semibold">Breathing Exercise</h3>
        
        {!isActive && timeLeft === selectedDuration && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose your session duration</p>
            <div className="flex justify-center gap-2">
              {breathingPatterns.map((pattern) => (
                <Button
                  key={pattern.duration}
                  variant={selectedDuration === pattern.duration ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedDuration(pattern.duration);
                    setTimeLeft(pattern.duration);
                  }}
                >
                  {pattern.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className={`w-32 h-32 mx-auto rounded-full border-4 border-primary flex items-center justify-center transition-all duration-1000 ${
            isActive && breathPhase === "inhale" ? "scale-110 bg-primary-soft" :
            isActive && breathPhase === "hold" ? "scale-105 bg-primary-soft" :
            isActive && breathPhase === "exhale" ? "scale-95 bg-wellness-blue/20" :
            "bg-wellness-blue/10"
          }`}>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
              {isActive && (
                <div className="text-sm font-medium text-primary mt-1">
                  {getBreathInstruction()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button onClick={startTimer} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            
            <Button onClick={resetTimer} variant="outline" size="icon">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};