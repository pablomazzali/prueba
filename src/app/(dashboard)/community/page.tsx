"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComingSoonBadge } from "@/components/shared/coming-soon-badge";
import { Users, MessageCircle, Trophy, BookOpenCheck } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Study Groups",
    description: "Join or create study groups for your subjects",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Compete with friends and track your progress",
  },
  {
    icon: BookOpenCheck,
    title: "Shared Resources",
    description: "Share and discover study materials from peers",
  },
  {
    icon: Users,
    title: "Peer Support",
    description: "Get help and support from fellow students",
  },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-4">
          <Users className="h-10 w-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Community
        </h1>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Connect with fellow students, share resources, and learn together
        </p>
        <div className="mt-4">
          <ComingSoonBadge />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="relative overflow-hidden opacity-75 cursor-not-allowed"
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-3">
                <feature.icon className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
