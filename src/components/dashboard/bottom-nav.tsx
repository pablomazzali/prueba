"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  BookOpen,
  Calendar,
  Home,
  Users,
  FileText,
} from "lucide-react";

const navigation = [
  { name: "Study", href: "/study", icon: BookOpen },
  { name: "Plan", href: "/study-plan", icon: Calendar },
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Community", href: "/community", icon: Users },
  { name: "Materials", href: "/materials", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full py-2 text-xs font-medium transition-all",
                isActive
                  ? "text-purple-600"
                  : "text-gray-500 hover:text-purple-500"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive && "text-purple-600"
                )}
              />
              <span>{item.name}</span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
