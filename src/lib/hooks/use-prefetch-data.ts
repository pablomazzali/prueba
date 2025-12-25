"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDataContext } from "@/lib/contexts/data-context";

export function usePrefetchData() {
  const {
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
    setIsLoading,
    loadStudyPlan,
    generatedContent,
  } = useDataContext();

  const supabase = createClient();

  useEffect(() => {
    prefetchAllData();
  }, [dashboardStats]); // Re-fetch when stats are invalidated

  const prefetchAllData = async () => {
    // Don't refetch if stats already exist (prevents infinite loop)
    if (dashboardStats) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Calculate date range for upcoming exams
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Fetch all data in parallel - including upcoming exams count
    const [
      subjectsResult,
      examsResult,
      materialsResult,
      contentResult,
      examsListResult,
      upcomingExamsResult,
    ] = await Promise.all([
      // Subjects
      subjects.length === 0
        ? supabase
            .from("subjects")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: null }),

      // Exams by subject
      Object.keys(exams).length === 0
        ? supabase.from("exams").select("*").eq("user_id", user.id)
        : Promise.resolve({ data: null }),

      // Materials
      materials.length === 0
        ? supabase
            .from("study_materials")
            .select("*")
            .eq("user_id", user.id)
            .order("uploaded_at", { ascending: false })
        : Promise.resolve({ data: null }),

      // Generated content count (for dashboard stats)
      !dashboardStats
        ? supabase
            .from("generated_content")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
        : Promise.resolve({ count: null }),

      // Exams list (for study plan)
      examsList.length === 0
        ? supabase
            .from("exams")
            .select(`
              id,
              exam_name,
              exam_date,
              subject_id,
              subjects (name)
            `)
            .eq("user_id", user.id)
            .gte("exam_date", now.toISOString().split("T")[0])
            .order("exam_date", { ascending: true })
        : Promise.resolve({ data: null }),

      // Upcoming exams count (for dashboard stats)
      !dashboardStats
        ? supabase
            .from("exams")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("exam_date", now.toISOString().split("T")[0])
            .lte("exam_date", thirtyDaysLater.toISOString().split("T")[0])
        : Promise.resolve({ count: null }),
    ]);

    // Update subjects
    if (subjectsResult.data && subjects.length === 0) {
      setSubjects(subjectsResult.data);
    }

    // Update exams by subject
    if (examsResult.data && Object.keys(exams).length === 0) {
      const examsBySubject: Record<string, any[]> = {};
      examsResult.data.forEach((exam: any) => {
        if (!examsBySubject[exam.subject_id]) {
          examsBySubject[exam.subject_id] = [];
        }
        examsBySubject[exam.subject_id].push(exam);
      });
      // Sort exams by date (nearest first) in each subject
      Object.keys(examsBySubject).forEach((subjectId) => {
        examsBySubject[subjectId].sort((a, b) =>
          new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
        );
      });
      setExams(examsBySubject);
    }

    // Update materials
    if (materialsResult.data && materials.length === 0) {
      setMaterials(materialsResult.data);
    }

    // Update exams list
    if (examsListResult.data && examsList.length === 0) {
      const formattedExams = examsListResult.data.map((exam: any) => ({
        id: exam.id,
        subject_id: exam.subject_id,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        subject_name: exam.subjects?.name || "Unknown Subject",
      }));
      setExamsList(formattedExams);
    }

    // Update dashboard stats - now all data is available
    if (!dashboardStats) {
      setDashboardStats({
        subjectsCount: subjectsResult.data?.length || 0,
        upcomingExamsCount: upcomingExamsResult.count || 0,
        materialsCount: materialsResult.data?.length || 0,
        aiContentCount: contentResult.count || 0,
      });
    }

    // Load study plan from database if not already loaded
    if (!generatedContent.studyPlan) {
      await loadStudyPlan();
    }

    // Mark loading as complete
    setIsLoading(false);
  };
}
