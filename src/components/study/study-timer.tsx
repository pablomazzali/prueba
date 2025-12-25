"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface StudyTimerProps {
  goalMinutes: number;
  onComplete?: () => void;
}

export function StudyTimer({ goalMinutes, onComplete }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const goalSeconds = goalMinutes * 60;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          if (newSeconds >= goalSeconds && onComplete) {
            onComplete();
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, goalSeconds, onComplete]);

  // Format time display
  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Calculate progress percentage
  const progressPercent = Math.min((seconds / goalSeconds) * 100, 100);

  // Control handlers
  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="text-6xl font-bold tracking-wider mb-2">
          {formatTime(seconds)}
        </div>
        <div className="flex items-center justify-center gap-2 text-white/80">
          <span className="text-sm">Goal: {goalMinutes} min</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center mt-2 text-white/80 text-sm">
          {Math.round(progressPercent)}% complete
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          onClick={handlePlayPause}
          className={cn(
            "h-16 w-16 rounded-full text-lg font-semibold shadow-lg transition-all",
            isRunning
              ? "bg-white text-purple-600 hover:bg-white/90"
              : "bg-white text-purple-600 hover:bg-white/90"
          )}
        >
          {isRunning ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </Button>

        <div className="h-12 w-12" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
