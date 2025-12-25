"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Square, Clock } from "lucide-react";
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

interface DayTasksProps {
  selectedDate: string | null;
  dailyPlan: DailyPlan[];
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

export function DayTasks({
  selectedDate,
  dailyPlan,
  completedTasks,
  onToggleTask,
}: DayTasksProps) {
  // Find the plan for the selected date
  const dayPlan = selectedDate
    ? dailyPlan.find((day) => day.date === selectedDate)
    : null;

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!selectedDate) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Select a date to view tasks</p>
        </CardContent>
      </Card>
    );
  }

  if (!dayPlan || !dayPlan.tasks || dayPlan.tasks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No tasks scheduled for this day</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Header */}
      <h3 className="text-lg font-semibold text-gray-900">
        Tasks for {formatDisplayDate(selectedDate)}
      </h3>

      {/* Tasks List */}
      <div className="space-y-3">
        {dayPlan.tasks.map((task, index) => {
          const taskId = `${selectedDate}-${index}`;
          const isCompleted = completedTasks[taskId] || false;

          return (
            <Card
              key={taskId}
              className={cn(
                "transition-all",
                isCompleted
                  ? "bg-green-50 border-green-200"
                  : "bg-white hover:shadow-md"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggleTask(taskId, !isCompleted)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 hover:text-purple-600" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {/* Subject */}
                    <p
                      className={cn(
                        "font-semibold",
                        isCompleted ? "text-gray-500" : "text-gray-900"
                      )}
                    >
                      {task.subject}
                    </p>

                    {/* Task Description */}
                    <p
                      className={cn(
                        "text-sm mt-0.5",
                        isCompleted
                          ? "text-gray-400 line-through"
                          : "text-gray-600"
                      )}
                    >
                      {task.text}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.technique && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {task.technique}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                    <Clock className="h-4 w-4" />
                    <span>{task.timeEstimate || 30} min</span>
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
