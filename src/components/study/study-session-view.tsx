"use client";

import { useMemo } from "react";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudyTimer } from "./study-timer";
import { cn } from "@/lib/utils/cn";

interface Task {
  text: string;
  examName: string;
  subject: string;
  technique: string;
  timeEstimate: number;
}

interface DailyPlan {
  date: string;
  day: string;
  tasks: Task[];
  hours: number;
}

interface StudySessionViewProps {
  todaysPlan: DailyPlan | null;
  completedTasks: Record<string, boolean>;
  onBack: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export function StudySessionView({
  todaysPlan,
  completedTasks,
  onBack,
  onToggleTask,
}: StudySessionViewProps) {
  // Get current task and stats
  const sessionStats = useMemo(() => {
    if (!todaysPlan?.tasks) {
      return {
        currentTask: null,
        currentTaskIndex: 0,
        totalTasks: 0,
        completedCount: 0,
        progressPercent: 0,
        totalMinutes: 0,
        currentSubject: null,
      };
    }

    const tasks = todaysPlan.tasks;
    const totalTasks = tasks.length;
    let completedCount = 0;
    let firstIncompleteIndex = -1;

    tasks.forEach((_, index) => {
      const taskId = `${todaysPlan.date}-${index}`;
      if (completedTasks[taskId]) {
        completedCount++;
      } else if (firstIncompleteIndex === -1) {
        firstIncompleteIndex = index;
      }
    });

    const currentTaskIndex =
      firstIncompleteIndex >= 0 ? firstIncompleteIndex : tasks.length - 1;
    const currentTask = tasks[currentTaskIndex];
    const totalMinutes = tasks.reduce(
      (sum, t) => sum + (t.timeEstimate || 30),
      0
    );
    const progressPercent =
      totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    return {
      currentTask,
      currentTaskIndex,
      totalTasks,
      completedCount,
      progressPercent,
      totalMinutes,
      currentSubject: currentTask?.subject || null,
    };
  }, [todaysPlan, completedTasks]);

  // Group tasks by subject for the current subject card
  const subjectStats = useMemo(() => {
    if (!todaysPlan?.tasks || !sessionStats.currentSubject) {
      return { completed: 0, total: 0 };
    }

    const subjectTasks = todaysPlan.tasks.filter(
      (t) => t.subject === sessionStats.currentSubject
    );
    const completed = subjectTasks.filter((_, i) => {
      const originalIndex = todaysPlan.tasks.findIndex(
        (t, idx) =>
          t.subject === sessionStats.currentSubject &&
          todaysPlan.tasks.slice(0, idx).filter((x) => x.subject === t.subject)
            .length === i
      );
      return completedTasks[`${todaysPlan.date}-${originalIndex}`];
    }).length;

    return { completed, total: subjectTasks.length };
  }, [todaysPlan, sessionStats.currentSubject, completedTasks]);

  if (!todaysPlan || !todaysPlan.tasks || todaysPlan.tasks.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tasks scheduled for today</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Study Session</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Timer */}
      <StudyTimer
        goalMinutes={sessionStats.currentTask?.timeEstimate || 30}
        onComplete={() => {
          // Could auto-complete task or show notification
        }}
      />

      {/* Current Subject Card */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Subject Initial */}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">
                {sessionStats.currentSubject?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>

            {/* Subject Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {sessionStats.currentSubject || "No Subject"}
              </h3>
              <p className="text-sm text-gray-500">
                Task {sessionStats.currentTaskIndex + 1} of{" "}
                {sessionStats.totalTasks}
              </p>
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {sessionStats.progressPercent}%
              </p>
              <p className="text-xs text-gray-500">Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Today's Activity
        </h2>

        {todaysPlan.tasks.map((task, index) => {
          const taskId = `${todaysPlan.date}-${index}`;
          const isCompleted = completedTasks[taskId];
          const isCurrent = index === sessionStats.currentTaskIndex;

          return (
            <Card
              key={taskId}
              className={cn(
                "transition-all cursor-pointer",
                isCompleted
                  ? "bg-green-50 border-green-200"
                  : isCurrent
                  ? "border-purple-300 bg-purple-50"
                  : "bg-white hover:shadow-md"
              )}
              onClick={() => onToggleTask(taskId, !isCompleted)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* What to do */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        isCompleted
                          ? "bg-green-500"
                          : isCurrent
                          ? "bg-purple-500"
                          : "bg-gray-200"
                      )}
                    >
                      <Target
                        className={cn(
                          "h-3.5 w-3.5",
                          isCompleted || isCurrent
                            ? "text-white"
                            : "text-gray-500"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-xs font-medium mb-0.5",
                          isCurrent ? "text-purple-600" : "text-blue-600"
                        )}
                      >
                        What to do
                      </p>
                      <p
                        className={cn(
                          "font-medium",
                          isCompleted
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        )}
                      >
                        {task.text}
                      </p>
                      {task.examName && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {task.examName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Suggested duration */}
                  <div className="flex items-center gap-3 pl-9">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-0.5">
                        Suggested duration
                      </p>
                      <p className="text-sm text-gray-700">
                        {task.timeEstimate || 30} min
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
