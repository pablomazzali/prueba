"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  BookOpen,
  Calendar,
  Home,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";

const helpItems = [
  {
    icon: Home,
    title: "Home",
    description: "View your dashboard overview and quick actions",
  },
  {
    icon: BookOpen,
    title: "Study",
    description: "Access your subjects and AI study tools",
  },
  {
    icon: Calendar,
    title: "Plan",
    description: "Generate and view your AI study schedule",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with other students (coming soon)",
  },
  {
    icon: FileText,
    title: "Materials",
    description: "Upload and manage your study files",
  },
];

export function HelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Help Card */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-72 shadow-2xl animate-in slide-in-from-bottom-2 fade-in-0 duration-200 border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Quick Navigation Guide</CardTitle>
              <button
                className="h-6 w-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {helpItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gemini-style Sparkle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #9333ea 0%, #6366f1 50%, #3b82f6 100%)",
        }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Sparkles className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
