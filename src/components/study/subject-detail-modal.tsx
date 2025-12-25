"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDataContext } from "@/lib/contexts/data-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Calendar,
  Trash2,
  Plus,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Exam {
  id: string;
  subject_id: string;
  exam_name: string;
  exam_date: string;
}

interface SubjectDetailModalProps {
  open: boolean;
  onClose: () => void;
  subject: Subject | null;
  subjectExams: Exam[];
  onDataChange: () => void;
}

export function SubjectDetailModal({
  open,
  onClose,
  subject,
  subjectExams,
  onDataChange,
}: SubjectDetailModalProps) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);

  useEffect(() => {
    if (subject) {
      setEditedName(subject.name);
    }
    // Reset states when modal opens/closes
    setIsEditingName(false);
    setShowAddExam(false);
    setNewExamName("");
    setNewExamDate("");
  }, [subject, open]);

  if (!subject) return null;

  const handleUpdateName = async () => {
    if (!editedName.trim() || editedName === subject.name) {
      setIsEditingName(false);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("subjects")
        .update({ name: editedName.trim() })
        .eq("id", subject.id);

      if (error) throw error;

      toast({ title: "Subject updated" });
      setIsEditingName(false);
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!confirm("Delete this subject and all its exams? This cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      // Delete exams first
      await supabase.from("exams").delete().eq("subject_id", subject.id);

      // Delete subject
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subject.id);

      if (error) throw error;

      toast({ title: "Subject deleted" });
      onDataChange();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExam = async () => {
    if (!newExamName.trim() || !newExamDate) {
      toast({
        title: "Missing fields",
        description: "Please enter exam name and date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("exams").insert({
        user_id: user.id,
        subject_id: subject.id,
        exam_name: newExamName.trim(),
        exam_date: newExamDate,
      });

      if (error) throw error;

      toast({ title: "Exam added" });
      setNewExamName("");
      setNewExamDate("");
      setShowAddExam(false);
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    setDeletingExamId(examId);
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examId);

      if (error) throw error;

      toast({ title: "Exam deleted" });
      onDataChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingExamId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <BookOpen className="h-4 w-4" style={{ color: subject.color }} />
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  disabled={isLoading}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(subject.name);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span>{subject.name}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exams List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Exams</Label>
              {!showAddExam && (
                <button
                  onClick={() => setShowAddExam(true)}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Exam
                </button>
              )}
            </div>

            {/* Add Exam Form */}
            {showAddExam && (
              <div className="p-3 bg-purple-50 rounded-lg mb-3 space-y-3">
                <Input
                  placeholder="Exam name (e.g., Midterm)"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  className="h-9"
                />
                <Input
                  type="date"
                  min={today}
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="h-9"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddExam}
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddExam(false);
                      setNewExamName("");
                      setNewExamDate("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Exams */}
            {subjectExams.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No exams scheduled
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subjectExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {exam.exam_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      disabled={deletingExamId === exam.id}
                      className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 flex-shrink-0"
                    >
                      {deletingExamId === exam.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Subject Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDeleteSubject}
              disabled={isLoading}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Subject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
