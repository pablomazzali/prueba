"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComingSoonBadge } from "@/components/shared/coming-soon-badge";
import {
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  HelpCircle,
  StickyNote,
  Brain,
  Video,
  MessageSquare,
  Headphones,
  Lightbulb,
  Calendar,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Exam {
  id: string;
  exam_name: string;
  exam_date: string;
  description?: string | null;
}

interface Material {
  id: string;
  file_name: string;
  file_path: string;
  subject_id: string | null;
}

interface SubjectModalProps {
  subject: Subject | null;
  exams: Exam[];
  materials: Material[];
  open: boolean;
  onClose: () => void;
}

const aiTools = [
  {
    icon: FileText,
    name: "Summary",
    description: "AI-generated summary",
    href: "/ai-tools?tab=summary",
  },
  {
    icon: Layers,
    name: "Flashcards",
    description: "Study flashcards",
    href: "/ai-tools?tab=flashcards",
  },
  {
    icon: HelpCircle,
    name: "Quiz",
    description: "Test your knowledge",
    href: "/ai-tools?tab=quiz",
  },
];

const comingSoonFeatures = [
  { icon: StickyNote, name: "Notes" },
  { icon: Brain, name: "Tutor Me" },
  { icon: Video, name: "Video Explainers" },
  { icon: MessageSquare, name: "Chat" },
  { icon: Headphones, name: "Podcast" },
  { icon: Lightbulb, name: "Study Techniques" },
];

export function SubjectModal({
  subject,
  exams,
  materials,
  open,
  onClose,
}: SubjectModalProps) {
  if (!subject) return null;

  // Filter materials for this subject (if subject_id matches)
  const subjectMaterials = materials.filter(
    (m) => m.subject_id === subject.id || m.subject_id === null
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <BookOpen className="h-6 w-6" style={{ color: subject.color }} />
            </div>
            <div>
              <DialogTitle className="text-xl">{subject.name}</DialogTitle>
              <DialogDescription>
                {exams.length} exam(s) scheduled
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Upcoming Exams */}
          {exams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Exams
              </h3>
              <div className="space-y-2">
                {exams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{exam.exam_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </span>
                    </div>
                    {exam.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Study Materials
            </h3>
            {subjectMaterials.length === 0 ? (
              <p className="text-sm text-gray-500">No materials uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {subjectMaterials.slice(0, 3).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm truncate flex-1">
                      {material.file_name}
                    </span>
                  </div>
                ))}
                {subjectMaterials.length > 3 && (
                  <Link href="/materials" onClick={onClose}>
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {subjectMaterials.length} materials
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* AI Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Study Tools
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {aiTools.map((tool) => (
                <Link key={tool.name} href={tool.href} onClick={onClose}>
                  <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-2">
                        <tool.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium">{tool.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              More Features
              <ComingSoonBadge />
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {comingSoonFeatures.map((feature) => (
                <Card
                  key={feature.name}
                  className="opacity-60 cursor-not-allowed"
                >
                  <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                      <feature.icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {feature.name}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
