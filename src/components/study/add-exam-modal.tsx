"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Calendar, Loader2, Plus } from "lucide-react";

interface AddExamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedSubjectId?: string;
}

export function AddExamModal({
  open,
  onClose,
  onSuccess,
  preSelectedSubjectId,
}: AddExamModalProps) {
  const supabase = createClient();
  const { subjects } = useDataContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    examName: "",
    examDate: "",
    subjectId: "",
  });

  // Update subject selection when modal opens or preSelectedSubjectId changes
  useEffect(() => {
    if (open) {
      setFormData({
        examName: "",
        examDate: "",
        subjectId: preSelectedSubjectId || "",
      });
    }
  }, [open, preSelectedSubjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.examName.trim()) {
      toast({
        title: "Exam name required",
        description: "Please enter an exam name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.examDate) {
      toast({
        title: "Exam date required",
        description: "Please select an exam date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subjectId) {
      toast({
        title: "Subject required",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("exams").insert({
        user_id: user.id,
        subject_id: formData.subjectId,
        exam_name: formData.examName.trim(),
        exam_date: formData.examDate,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Exam scheduled successfully",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating exam:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Schedule Exam
          </DialogTitle>
          <DialogDescription>
            Add an exam to your study schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <select
              id="subject"
              value={formData.subjectId}
              onChange={(e) =>
                setFormData({ ...formData, subjectId: e.target.value })
              }
              disabled={isLoading || !!preSelectedSubjectId}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Name */}
          <div className="space-y-2">
            <Label htmlFor="exam-name">Exam Name *</Label>
            <Input
              id="exam-name"
              placeholder="e.g., Midterm, Final, Quiz 1..."
              value={formData.examName}
              onChange={(e) =>
                setFormData({ ...formData, examName: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Exam Date */}
          <div className="space-y-2">
            <Label htmlFor="exam-date">Exam Date *</Label>
            <Input
              id="exam-date"
              type="date"
              min={today}
              value={formData.examDate}
              onChange={(e) =>
                setFormData({ ...formData, examDate: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.examName.trim() ||
              !formData.examDate ||
              !formData.subjectId
            }
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Exam
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
