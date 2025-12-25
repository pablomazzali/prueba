"use client";

import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="h-16 w-16 rounded-full border-4 border-purple-200 animate-pulse" />

          {/* Inner spinning icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          </div>

          {/* Gradient glow effect */}
          <div className="absolute inset-0 -z-10 blur-xl opacity-50">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
          </div>
        </div>

        <p className="text-sm font-medium text-gray-700 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
