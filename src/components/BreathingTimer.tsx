import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface BreathingTimerProps {
  className?: string;
}

// Breathing session durations in minutes
const BREATHING_DURATIONS = [1, 3, 5];

const BreathingTimer = ({ className }: BreathingTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Default 1 minute
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // 4-4-6 breathing pattern (inhale-hold-exhale in seconds)
  const breathPattern = {
    inhale: 4,
    hold: 4, 
    exhale: 6
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
        
        // Update breath phase based on cycle
        const totalCycleTime = breathPattern.inhale + breathPattern.hold + breathPattern.exhale;
        const currentCyclePosition = breathCount % totalCycleTime;
        
        if (currentCyclePosition < breathPattern.inhale) {
          setBreathPhase('inhale');
        } else if (currentCyclePosition < breathPattern.inhale + breathPattern.hold) {
          setBreathPhase('hold');
        } else {
          setBreathPhase('exhale');
        }
        
        setBreathCount(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, breathCount]);

  const startTimer = () => {
    setIsActive(true);
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration * 60);
      setBreathCount(0);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
    setBreathPhase('inhale');
    setBreathCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Breathe Out...';
      default:
        return 'Breathe In...';
    }
  };

  const getCircleScale = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'scale-110';
      case 'hold':
        return 'scale-110';
      case 'exhale':
        return 'scale-90';
      default:
        return 'scale-100';
    }
  };

  const getCircleColor = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'bg-primary-soft border-primary';
      case 'hold':
        return 'bg-secondary-soft border-secondary';
      case 'exhale':
        return 'bg-wellness-green/20 border-wellness-green';
      default:
        return 'bg-primary-soft border-primary';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span>🧘‍♀️</span>
            <span>Breathing Exercise</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-2"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Duration Selection */}
        {!isActive && timeLeft === selectedDuration * 60 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Choose your session duration:
            </p>
            <div className="flex gap-2 justify-center">
              {BREATHING_DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration === duration ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedDuration(duration);
                    setTimeLeft(duration * 60);
                  }}
                >
                  {duration} min
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Breathing Circle */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div 
              className={`w-32 h-32 rounded-full border-4 transition-all duration-1000 ease-in-out ${getCircleScale()} ${getCircleColor()}`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Breathing Instruction */}
          <div className="text-center">
            <p className="text-xl font-medium text-primary mb-2">
              {getBreathInstruction()}
            </p>
            <p className="text-sm text-muted-foreground">
              Follow the circle to guide your breathing
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isActive ? (
            <Button onClick={startTimer} size="lg" className="px-8">
              <Play className="w-4 h-4 mr-2" />
              {timeLeft === selectedDuration * 60 ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" size="lg" className="px-8">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Breathing Pattern Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            4-4-6 Breathing Pattern
          </p>
          <p className="text-xs text-muted-foreground">
            Inhale for 4s • Hold for 4s • Exhale for 6s
          </p>
        </div>

        {/* Audio Placeholder */}
        {audioEnabled && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🎵 Calming sounds would play here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreathingTimer;