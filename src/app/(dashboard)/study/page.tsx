"use client";

import { useState, useMemo } from "react";
import { useDataContext } from "@/lib/contexts/data-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddSubjectModal } from "@/components/study/add-subject-modal";
import { AddExamModal } from "@/components/study/add-exam-modal";
import { GeneratePlanModal } from "@/components/study/generate-plan-modal";
import { StudySessionView } from "@/components/study/study-session-view";
import { SubjectDetailModal } from "@/components/study/subject-detail-modal";
import {
  Clock,
  BookOpen,
  Plus,
  Calendar,
  Sparkles,
  ChevronRight,
  Timer,
  PlusCircle,
} from "lucide-react";

export default function StudyPage() {
  const {
    subjects,
    exams,
    generatedContent,
    updateTaskCompletion,
    invalidateSubjectsAndExams,
  } = useDataContext();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showGeneratePlan, setShowGeneratePlan] = useState(false);
  const [showStudySession, setShowStudySession] = useState(false);
  const [showSubjectDetail, setShowSubjectDetail] = useState(false);
  const [detailSubject, setDetailSubject] = useState<typeof subjects[0] | null>(null);

  const studyPlan = generatedContent.studyPlan;
  const completedTasks = generatedContent.completedTasks;

  // Helper to get today's plan
  const getTodaysPlan = () => {
    if (!studyPlan?.dailyPlan) return null;
    const today = new Date().toISOString().split("T")[0];
    return (
      studyPlan.dailyPlan.find((day) => day.date === today) ||
      studyPlan.dailyPlan[0]
    );
  };
  const todaysPlan = getTodaysPlan();

  // Calculate today's task count
  const todayTaskCount = todaysPlan?.tasks?.length || 0;

  // Calculate progress for each subject (based on completed tasks)
  const getSubjectProgress = (subjectName: string) => {
    if (!studyPlan?.dailyPlan) return 0;

    let totalTasks = 0;
    let completedCount = 0;

    studyPlan.dailyPlan.forEach((day) => {
      day.tasks?.forEach((task, index) => {
        if (task.subject === subjectName) {
          totalTasks++;
          if (completedTasks[`${day.date}-${index}`]) {
            completedCount++;
          }
        }
      });
    });

    return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  };

  // Get today's task for a subject
  const getTodayTaskForSubject = (subjectName: string) => {
    if (!todaysPlan?.tasks) return null;
    return todaysPlan.tasks.find((task) => task.subject === subjectName);
  };

  // Get total time for today
  const getTotalTimeForToday = () => {
    if (!todaysPlan?.tasks) return 0;
    return todaysPlan.tasks.reduce(
      (sum, task) => sum + (task.timeEstimate || 30),
      0
    );
  };

  // Handle subject creation success
  const handleSubjectSuccess = () => {
    invalidateSubjectsAndExams();
  };

  // Handle exam creation success
  const handleExamSuccess = () => {
    invalidateSubjectsAndExams();
  };

  // Handle plan generation success
  const handlePlanSuccess = () => {
    // Plan is automatically saved to context via saveStudyPlan
  };

  // Open add exam modal for a specific subject
  const openAddExamForSubject = (subjectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedSubjectId(subjectId);
    setShowAddExam(true);
  };

  // Open subject detail modal
  const openSubjectDetail = (subject: typeof subjects[0]) => {
    setDetailSubject(subject);
    setShowSubjectDetail(true);
  };

  // Handle task completion toggle
  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTaskCompletion(taskId, completed);
  };

  // If showing study session, render that instead
  if (showStudySession) {
    return (
      <StudySessionView
        todaysPlan={todaysPlan}
        completedTasks={completedTasks}
        onBack={() => setShowStudySession(false)}
        onToggleTask={handleToggleTask}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study</h1>
          <p className="text-gray-600 mt-1">
            {todayTaskCount > 0
              ? `${todayTaskCount} task${todayTaskCount !== 1 ? "s" : ""} today`
              : "Your subjects and AI-powered study tools"}
          </p>
        </div>
        {studyPlan && (
          <Button
            onClick={() => setShowStudySession(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Timer className="h-4 w-4 mr-2" />
            Timer
          </Button>
        )}
      </div>

      {/* Continue Study Plan Card */}
      {studyPlan && todaysPlan ? (
        <Card
          className="bg-gradient-to-br from-purple-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setShowStudySession(true)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Continue AI Study Plan
                    </h3>
                    <p className="text-purple-100 text-sm">
                      {todaysPlan.tasks?.[0]?.subject}:{" "}
                      {todaysPlan.tasks?.[0]?.examName}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-white/70" />
              </div>

              {/* Time and Task Info */}
              <div className="flex items-center gap-4 text-purple-100 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{getTotalTimeForToday()} min</span>
                </div>
                <span>|</span>
                <span>
                  {todaysPlan.tasks?.[0]?.technique || "Active Recall"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-2">
              <Sparkles className="h-7 w-7 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Create Your Study Plan</CardTitle>
            <CardDescription>
              Generate an AI-powered study plan to see your daily sessions here
            </CardDescription>
            <Button
              onClick={() => setShowGeneratePlan(true)}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Study Plan
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Subjects Section */}
      <div className="space-y-4">
        {subjects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">No subjects yet</CardTitle>
              <CardDescription>
                Add your first subject to start studying
              </CardDescription>
              <Button
                onClick={() => setShowAddSubject(true)}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => {
              const subjectExams = exams[subject.id] || [];
              const progress = getSubjectProgress(subject.name);
              const todayTask = getTodayTaskForSubject(subject.name);

              return (
                <Card
                  key={subject.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openSubjectDetail(subject)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <BookOpen
                          className="h-6 w-6"
                          style={{ color: subject.color }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {subject.name}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2">
                            {progress}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Today's task or exam info */}
                        {todayTask ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-purple-600 font-medium">
                                Today
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {todayTask.text}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Next</span>
                              <span className="text-gray-400">|</span>
                              <span>
                                {todayTask.timeEstimate || 30} min total
                              </span>
                            </div>
                          </div>
                        ) : subjectExams.length > 0 ? (
                          <div className="space-y-2">
                            {/* Show all exams */}
                            {subjectExams.slice(0, 3).map((exam, idx) => (
                              <div key={exam.id} className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>
                                  {new Date(exam.exam_date).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="truncate">{exam.exam_name}</span>
                              </div>
                            ))}
                            {subjectExams.length > 3 && (
                              <p className="text-xs text-gray-400">
                                +{subjectExams.length - 3} more exam{subjectExams.length - 3 > 1 ? 's' : ''}
                              </p>
                            )}
                            {/* Add another exam button */}
                            <button
                              onClick={(e) => openAddExamForSubject(subject.id, e)}
                              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium mt-1"
                            >
                              <PlusCircle className="h-3 w-3" />
                              <span>Add another exam</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => openAddExamForSubject(subject.id, e)}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add exam to generate study plan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add New Subject Button */}
        <button
          onClick={() => setShowAddSubject(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Subject
        </button>
      </div>

      {/* Modals */}
      <AddSubjectModal
        open={showAddSubject}
        onClose={() => setShowAddSubject(false)}
        onSuccess={handleSubjectSuccess}
      />

      <AddExamModal
        open={showAddExam}
        onClose={() => {
          setShowAddExam(false);
          setSelectedSubjectId(null);
        }}
        onSuccess={handleExamSuccess}
        preSelectedSubjectId={selectedSubjectId || undefined}
      />

      <GeneratePlanModal
        open={showGeneratePlan}
        onClose={() => setShowGeneratePlan(false)}
        onSuccess={handlePlanSuccess}
      />

      <SubjectDetailModal
        open={showSubjectDetail}
        onClose={() => {
          setShowSubjectDetail(false);
          setDetailSubject(null);
        }}
        subject={detailSubject}
        subjectExams={detailSubject ? (exams[detailSubject.id] || []) : []}
        onDataChange={invalidateSubjectsAndExams}
      />
    </div>
  );
}
