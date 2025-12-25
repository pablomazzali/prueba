import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ComingSoonBadgeProps {
  className?: string;
}

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      Coming Soon
    </span>
  );
}
