"use client";

import { useState, useMemo } from "react";
import { useDataContext } from "@/lib/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "@/components/plan/calendar-view";
import { DayTasks } from "@/components/plan/day-tasks";
import { AddTaskModal } from "@/components/plan/add-task-modal";
import { Plus, Calendar, Sparkles, RefreshCw, PartyPopper } from "lucide-react";
import Link from "next/link";
import { GeneratePlanModal } from "@/components/study/generate-plan-modal";

export default function StudyPlanPage() {
  const { generatedContent, updateTaskCompletion } = useDataContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    // Default to today
    return new Date().toISOString().split("T")[0];
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [showGeneratePlan, setShowGeneratePlan] = useState(false);

  const studyPlan = generatedContent.studyPlan;
  const completedTasks = generatedContent.completedTasks;

  // Calculate total and completed tasks
  const taskStats = useMemo(() => {
    if (!studyPlan?.dailyPlan) return { total: 0, completed: 0 };

    let total = 0;
    let completed = 0;

    studyPlan.dailyPlan.forEach((day) => {
      day.tasks?.forEach((_, index) => {
        total++;
        if (completedTasks[`${day.date}-${index}`]) {
          completed++;
        }
      });
    });

    return { total, completed };
  }, [studyPlan, completedTasks]);

  // Check if all tasks are completed
  const allTasksCompleted = taskStats.total > 0 && taskStats.completed === taskStats.total;

  // Handle task completion toggle
  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTaskCompletion(taskId, completed);
  };

  // If no study plan exists, show empty state
  if (!studyPlan || !studyPlan.dailyPlan || studyPlan.dailyPlan.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Plan</h1>
            <p className="text-gray-600 mt-1">No study plan yet</p>
          </div>
        </div>

        {/* Empty State */}
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl">No Study Plan Created</CardTitle>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Create a personalized AI study plan to see your calendar here. Go
              to the Study tab to generate your plan.
            </p>
            <Link href="/study">
              <Button className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Go to Study
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Plan</h1>
          <p className="text-gray-600 mt-1">
            {taskStats.completed} of {taskStats.total} tasks completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowGeneratePlan(true)}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Plan
          </Button>
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Celebration Card when all tasks completed */}
      {allTasksCompleted && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <PartyPopper className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl">Congratulations!</h3>
                <p className="text-green-100 mt-1">
                  You've completed all {taskStats.total} tasks in your study plan. Great job!
                </p>
              </div>
              <Button
                onClick={() => setShowGeneratePlan(true)}
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <CalendarView
        dailyPlan={studyPlan.dailyPlan}
        completedTasks={completedTasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Tasks for Selected Day */}
      <DayTasks
        selectedDate={selectedDate}
        dailyPlan={studyPlan.dailyPlan}
        completedTasks={completedTasks}
        onToggleTask={handleToggleTask}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        selectedDate={selectedDate}
      />

      {/* Generate Plan Modal */}
      <GeneratePlanModal
        open={showGeneratePlan}
        onClose={() => setShowGeneratePlan(false)}
        onSuccess={() => setShowGeneratePlan(false)}
      />
    </div>
  );
}
