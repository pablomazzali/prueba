"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDataContext } from "@/lib/contexts/data-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComingSoonBadge } from "@/components/shared/coming-soon-badge";
import { LoadingScreen } from "@/components/shared/loading-screen";
import {
  BookOpen,
  FileText,
  Sparkles,
  Calendar,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Upload,
  BookMarked,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  subjectsCount: number;
  upcomingExamsCount: number;
  materialsCount: number;
  aiContentCount: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const { dashboardStats, isLoading } = useDataContext();

  const stats = dashboardStats || {
    subjectsCount: 0,
    upcomingExamsCount: 0,
    materialsCount: 0,
    aiContentCount: 0,
  };

  // Show loading screen while data is being prefetched
  if (isLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to ace your studies? Let's get started.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Subjects
            </CardTitle>
            <BookOpen className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.subjectsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.subjectsCount === 0 ? "Add your first subject" : "Total subjects"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Upcoming Exams
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.upcomingExamsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.upcomingExamsCount === 0 ? "No exams scheduled" : "Next 30 days"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Study Materials
            </CardTitle>
            <FileText className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.materialsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.materialsCount === 0 ? "Upload your notes" : "Total files"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              AI Content
            </CardTitle>
            <Sparkles className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.aiContentCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.aiContentCount === 0 ? "Generate summaries & more" : "Generated items"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get started by uploading your study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/materials">
              <Button className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                Upload Materials
              </Button>
            </Link>
            <Link href="/study">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Create Subject
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI-Powered Tools
            </CardTitle>
            <CardDescription>
              Generate summaries, flashcards, and quizzes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/ai-tools">
              <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Explore AI Tools
              </Button>
            </Link>
            <Link href="/study-plan">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Create Study Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-600" />
          Coming Soon
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-not-allowed opacity-90 hover:opacity-100">
            <div className="absolute top-3 right-3">
              <ComingSoonBadge />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Adaptive Learning</CardTitle>
              <CardDescription>
                AI that learns from your progress and automatically adjusts your study plan
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-not-allowed opacity-90 hover:opacity-100">
            <div className="absolute top-3 right-3">
              <ComingSoonBadge />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">AI Tutor Chat</CardTitle>
              <CardDescription>
                Get instant help with questions and explanations from your personal AI tutor
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-not-allowed opacity-90 hover:opacity-100">
            <div className="absolute top-3 right-3">
              <ComingSoonBadge />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Progress Analytics</CardTitle>
              <CardDescription>
                Detailed insights into your learning progress with visual charts and recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-not-allowed opacity-90 hover:opacity-100">
            <div className="absolute top-3 right-3">
              <ComingSoonBadge />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-3">
                <BookMarked className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Spaced Repetition</CardTitle>
              <CardDescription>
                Automated flashcard scheduling based on proven learning science
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
