"use client";

import { useState } from "react";
import { useDataContext } from "@/lib/contexts/data-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string | null;
}

const TECHNIQUES = [
  "Active Recall",
  "Spaced Repetition",
  "Practice Problems",
  "Reading",
  "Note Taking",
  "Summarizing",
  "Mind Mapping",
  "Teaching",
];

export function AddTaskModal({ open, onClose, selectedDate }: AddTaskModalProps) {
  const { subjects, generatedContent, setGeneratedContent } = useDataContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    subject: "",
    technique: "Active Recall",
    timeEstimate: "30",
    date: selectedDate || new Date().toISOString().split("T")[0],
  });

  // Update date when selectedDate changes
  useState(() => {
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      toast({
        title: "Task description required",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject) {
      toast({
        title: "Subject required",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const studyPlan = generatedContent.studyPlan;
      if (!studyPlan) {
        throw new Error("No study plan exists");
      }

      // Find or create the daily plan for the selected date
      const dailyPlanIndex = studyPlan.dailyPlan.findIndex(
        (day) => day.date === formData.date
      );

      const newTask = {
        text: formData.text.trim(),
        examName: "",
        subject: formData.subject,
        technique: formData.technique,
        timeEstimate: parseInt(formData.timeEstimate) || 30,
      };

      let updatedDailyPlan = [...studyPlan.dailyPlan];

      if (dailyPlanIndex >= 0) {
        // Add task to existing day
        updatedDailyPlan[dailyPlanIndex] = {
          ...updatedDailyPlan[dailyPlanIndex],
          tasks: [...(updatedDailyPlan[dailyPlanIndex].tasks || []), newTask],
        };
      } else {
        // Create new day entry
        const date = new Date(formData.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        updatedDailyPlan.push({
          date: formData.date,
          day: dayName,
          tasks: [newTask],
          hours: Math.ceil(parseInt(formData.timeEstimate) / 60),
        });
        // Sort by date
        updatedDailyPlan.sort((a, b) => a.date.localeCompare(b.date));
      }

      // Update context
      setGeneratedContent({
        ...generatedContent,
        studyPlan: {
          ...studyPlan,
          dailyPlan: updatedDailyPlan,
        },
      });

      // TODO: Save to database via API when plan persistence is fully implemented

      toast({
        title: "Task added!",
        description: "Your task has been added to the plan",
      });

      // Reset form and close
      setFormData({
        text: "",
        subject: "",
        technique: "Active Recall",
        timeEstimate: "30",
        date: selectedDate || new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Add a task to your study plan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task-text">Task Description *</Label>
            <Input
              id="task-text"
              placeholder="e.g., Review Chapter 5, Practice problems..."
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Duration (min)</Label>
              <Input
                id="time"
                type="number"
                min="5"
                max="480"
                value={formData.timeEstimate}
                onChange={(e) =>
                  setFormData({ ...formData, timeEstimate: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Technique Selection */}
          <div className="space-y-2">
            <Label htmlFor="technique">Study Technique</Label>
            <select
              id="technique"
              value={formData.technique}
              onChange={(e) =>
                setFormData({ ...formData, technique: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {TECHNIQUES.map((technique) => (
                <option key={technique} value={technique}>
                  {technique}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.text.trim() || !formData.subject}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
