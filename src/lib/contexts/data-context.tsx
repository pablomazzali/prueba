"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Subject {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Exam {
  id: string;
  subject_id: string;
  exam_name: string;
  exam_date: string;
  subject_name?: string;
  description?: string | null;
}

interface ExamWithSubject {
  id: string;
  subject_id: string;
  exam_name: string;
  exam_date: string;
  subject_name: string;
}

interface StudyMaterial {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  subject_id: string | null;
}

interface Flashcard {
  question: string;
  answer: string;
  difficulty: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Task {
  text: string;
  examName: string;
  subject: string;
  technique: string;
  timeEstimate: number; // in minutes
}

interface DailyPlan {
  date: string;
  day: string;
  tasks: Task[];
  hours: number;
}

interface StudyPlan {
  dailyPlan: DailyPlan[];
  tips: string[];
}

interface StudyPlanMeta {
  id: string;
  planName: string;
  startDate: string;
  endDate: string | null;
}

interface GeneratedContent {
  summary: string | null;
  summaryDetailLevel?: "brief" | "standard" | "detailed";
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  currentCardIndex: number;
  flipped: boolean;
  currentQuestionIndex: number;
  selectedAnswers: number[];
  showResults: boolean;
  studyPlan: StudyPlan | null;
  studyPlanMeta: StudyPlanMeta | null;
  completedTasks: Record<string, boolean>;
}

interface DashboardStats {
  subjectsCount: number;
  upcomingExamsCount: number;
  materialsCount: number;
  aiContentCount: number;
}

interface DataContextType {
  // Dashboard
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats) => void;

  // Subjects
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  exams: Record<string, Exam[]>;
  setExams: (exams: Record<string, Exam[]>) => void;

  // Materials
  materials: StudyMaterial[];
  setMaterials: (materials: StudyMaterial[]) => void;

  // Exams list (for study plan)
  examsList: ExamWithSubject[];
  setExamsList: (exams: ExamWithSubject[]) => void;

  // Generated content (AI tools)
  generatedContent: GeneratedContent;
  setGeneratedContent: (content: GeneratedContent) => void;

  // Study Plan persistence
  saveStudyPlan: (plan: StudyPlan, planName?: string) => Promise<void>;
  loadStudyPlan: () => Promise<void>;
  updateTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  deleteStudyPlan: () => Promise<void>;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Invalidation
  invalidateAll: () => void;
  invalidateDashboardStats: () => void;
  invalidateSubjectsAndExams: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Record<string, Exam[]>>({});
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [examsList, setExamsList] = useState<ExamWithSubject[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    summary: null,
    flashcards: [],
    quiz: [],
    currentCardIndex: 0,
    flipped: false,
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showResults: false,
    studyPlan: null,
    studyPlanMeta: null,
    completedTasks: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Save study plan to database
  const saveStudyPlan = async (plan: StudyPlan, planName?: string) => {
    try {
      // Calculate start and end dates from plan
      const dates = plan.dailyPlan.map((d) => d.date).sort();
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      const response = await fetch("/api/study-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planName || "My Study Plan",
          startDate,
          endDate,
          planData: {
            dailyPlan: plan.dailyPlan,
            tips: plan.tips,
            completedTasks: {},
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save study plan");
      }

      const { plan: savedPlan } = await response.json();

      // Update context with saved plan
      setGeneratedContent((prev) => ({
        ...prev,
        studyPlan: plan,
        studyPlanMeta: {
          id: savedPlan.id,
          planName: savedPlan.plan_name,
          startDate: savedPlan.start_date,
          endDate: savedPlan.end_date,
        },
        completedTasks: savedPlan.plan_data?.completedTasks || {},
      }));
    } catch (error) {
      console.error("Error saving study plan:", error);
      throw error;
    }
  };

  // Load study plan from database
  const loadStudyPlan = async () => {
    try {
      const response = await fetch("/api/study-plans");

      if (!response.ok) {
        throw new Error("Failed to load study plan");
      }

      const { plan } = await response.json();

      if (plan) {
        setGeneratedContent((prev) => ({
          ...prev,
          studyPlan: {
            dailyPlan: plan.plan_data?.dailyPlan || [],
            tips: plan.plan_data?.tips || [],
          },
          studyPlanMeta: {
            id: plan.id,
            planName: plan.plan_name,
            startDate: plan.start_date,
            endDate: plan.end_date,
          },
          completedTasks: plan.plan_data?.completedTasks || {},
        }));
      }
    } catch (error) {
      console.error("Error loading study plan:", error);
    }
  };

  // Update task completion status
  const updateTaskCompletion = async (taskId: string, completed: boolean) => {
    const planId = generatedContent.studyPlanMeta?.id;
    if (!planId) return;

    // Optimistically update UI
    const newCompletedTasks = {
      ...generatedContent.completedTasks,
      [taskId]: completed,
    };

    setGeneratedContent((prev) => ({
      ...prev,
      completedTasks: newCompletedTasks,
    }));

    try {
      const response = await fetch("/api/study-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          completedTasks: newCompletedTasks,
        }),
      });

      if (!response.ok) {
        // Revert on failure
        setGeneratedContent((prev) => ({
          ...prev,
          completedTasks: {
            ...prev.completedTasks,
            [taskId]: !completed,
          },
        }));
        throw new Error("Failed to update task completion");
      }
    } catch (error) {
      console.error("Error updating task completion:", error);
    }
  };

  // Delete study plan
  const deleteStudyPlan = async () => {
    const planId = generatedContent.studyPlanMeta?.id;
    if (!planId) return;

    try {
      const response = await fetch(`/api/study-plans?planId=${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete study plan");
      }

      // Clear plan from context
      setGeneratedContent((prev) => ({
        ...prev,
        studyPlan: null,
        studyPlanMeta: null,
        completedTasks: {},
      }));
    } catch (error) {
      console.error("Error deleting study plan:", error);
      throw error;
    }
  };

  const invalidateAll = () => {
    setDashboardStats(null);
    setSubjects([]);
    setExams({});
    setMaterials([]);
    setExamsList([]);
    setIsLoading(true);
  };

  const invalidateDashboardStats = () => {
    setDashboardStats(null);
  };

  const invalidateSubjectsAndExams = () => {
    setSubjects([]);
    setExams({});
    setExamsList([]);
    setDashboardStats(null);
  };

  return (
    <DataContext.Provider
      value={{
        dashboardStats,
        setDashboardStats,
        subjects,
        setSubjects,
        exams,
        setExams,
        materials,
        setMaterials,
        examsList,
        setExamsList,
        generatedContent,
        setGeneratedContent,
        saveStudyPlan,
        loadStudyPlan,
        updateTaskCompletion,
        deleteStudyPlan,
        isLoading,
        setIsLoading,
        invalidateAll,
        invalidateDashboardStats,
        invalidateSubjectsAndExams,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}
