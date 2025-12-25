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
import {
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Exam {
  id: string;
  subject_id: string;
  exam_name: string;
  exam_date: string;
  subject_name: string;
}

interface GeneratePlanModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GeneratePlanModal({
  open,
  onClose,
  onSuccess,
}: GeneratePlanModalProps) {
  const supabase = createClient();
  const { subjects, materials, saveStudyPlan } = useDataContext();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [syllabus, setSyllabus] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    studyHoursPerDay: "2",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Loading messages
  const loadingMessages = [
    "Analyzing exam schedules...",
    "Extracting content from study materials...",
    "Analyzing your uploaded notes...",
    "Calculating optimal study distribution...",
    "Creating daily task breakdown...",
    "Prioritizing exam preparation...",
    "Generating personalized recommendations...",
    "Finalizing your study plan...",
  ];

  // Fetch exams when modal opens
  useEffect(() => {
    if (open) {
      fetchExams();
    }
  }, [open]);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage("");
      return;
    }

    let currentIndex = 0;
    setLoadingMessage(loadingMessages[0]);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchExams = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("exams")
      .select(
        `
        id,
        exam_name,
        exam_date,
        subject_id,
        subjects (name)
      `
      )
      .eq("user_id", user.id)
      .gte("exam_date", new Date().toISOString().split("T")[0])
      .order("exam_date", { ascending: true });

    if (data) {
      const formattedExams = data.map((exam: any) => ({
        id: exam.id,
        subject_id: exam.subject_id,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        subject_name: exam.subjects?.name || "Unknown Subject",
      }));
      setExams(formattedExams);
      // Select all by default
      setSelectedExamIds(formattedExams.map((e) => e.id));
    }
  };

  const toggleExamSelection = (examId: string) => {
    setSelectedExamIds((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  // Get materials for a specific subject
  const getMaterialsForSubject = (subjectId: string) => {
    return materials.filter(
      (m) => m.subject_id === subjectId || m.subject_id === null
    );
  };

  // Extract text from a material file
  const extractTextFromMaterial = async (filePath: string): Promise<string> => {
    try {
      const response = await fetch("/api/ai/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath }),
      });
      if (!response.ok) return "";
      const { text } = await response.json();
      return text || "";
    } catch {
      return "";
    }
  };

  const handleGenerate = async () => {
    if (selectedExamIds.length === 0) {
      toast({
        title: "No exams selected",
        description: "Please select at least one exam",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedExams = exams.filter((exam) =>
        selectedExamIds.includes(exam.id)
      );

      // Get unique subject IDs from selected exams
      const subjectIds = Array.from(new Set(selectedExams.map((e) => e.subject_id)));

      // Get materials for these subjects - prepare all extraction promises
      const subjectMaterials: Record<string, { fileName: string; content: string }[]> = {};
      const extractionPromises: Promise<{ subjectName: string; fileName: string; content: string } | null>[] = [];

      for (const subjectId of subjectIds) {
        const subjectMats = materials.filter((m) => m.subject_id === subjectId);
        const subject = subjects.find((s) => s.id === subjectId);
        const subjectName = subject?.name || "Unknown";

        // Limit to 2 files per subject for speed
        for (const mat of subjectMats.slice(0, 2)) {
          extractionPromises.push(
            extractTextFromMaterial(mat.file_path).then((content) =>
              content ? { subjectName, fileName: mat.file_name, content: content.substring(0, 3000) } : null
            )
          );
        }
      }

      // Extract all materials in parallel
      const extractedResults = await Promise.all(extractionPromises);

      // Organize results by subject
      for (const result of extractedResults) {
        if (result) {
          if (!subjectMaterials[result.subjectName]) {
            subjectMaterials[result.subjectName] = [];
          }
          subjectMaterials[result.subjectName].push({
            fileName: result.fileName,
            content: result.content,
          });
        }
      }

      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exams: selectedExams.map((exam) => ({
            subject: exam.subject_name,
            examName: exam.exam_name,
            examDate: exam.exam_date,
            syllabus: syllabus[exam.id] || "",
          })),
          studyHoursPerDay: parseInt(formData.studyHoursPerDay),
          startDate: formData.startDate,
          materialContent: subjectMaterials,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }

      const { plan } = await response.json();

      // Save to database
      await saveStudyPlan(plan, "My Study Plan");

      toast({
        title: "Success!",
        description: "Your personalized study plan has been generated",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate study plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has subjects and exams
  const hasSubjects = subjects.length > 0;
  const hasExams = exams.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Create Study Plan
          </DialogTitle>
          <DialogDescription>
            Generate an AI-powered study plan based on your exams
          </DialogDescription>
        </DialogHeader>

        {/* Validation Checks */}
        {!hasSubjects ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Add Subjects First
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You need to create subjects before generating a study plan.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : !hasExams ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Add Exams First
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You need to schedule exams for your subjects before generating a
              study plan.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exam Selection */}
            <div className="space-y-3">
              <Label>Select Exams</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {exams.map((exam) => {
                  const isSelected = selectedExamIds.includes(exam.id);
                  const subjectMaterials = materials.filter(
                    (m) => m.subject_id === exam.subject_id
                  );
                  const hasMaterials = subjectMaterials.length > 0;
                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => toggleExamSelection(exam.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-purple-600 bg-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {exam.subject_name}
                          </p>
                          {hasMaterials && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                              <FileText className="h-3 w-3" />
                              {subjectMaterials.length}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{exam.exam_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.ceil(
                            (new Date(exam.exam_date).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Study Hours and Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours per Day</Label>
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.studyHoursPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, studyHoursPerDay: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerate}
                disabled={selectedExamIds.length === 0 || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan for {selectedExamIds.length} Exam(s)
                  </>
                )}
              </Button>

              {isLoading && loadingMessage && (
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600 animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  <span>{loadingMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
