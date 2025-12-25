"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Task {
  text: string;
  examName: string;
  subject: string;
  technique: string;
  timeEstimate: number;
}

interface DailyPlan {
  date: string;
  day: string;
  tasks: Task[];
  hours: number;
}

interface CalendarViewProps {
  dailyPlan: DailyPlan[];
  completedTasks: Record<string, boolean>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

type ViewMode = "day" | "week" | "month";

export function CalendarView({
  dailyPlan,
  completedTasks,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Create a map for quick task lookup by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, DailyPlan> = {};
    dailyPlan.forEach((day) => {
      map[day.date] = day;
    });
    return map;
  }, [dailyPlan]);

  // Get completed and total counts for a date
  const getTaskCounts = (date: string) => {
    const dayPlan = tasksByDate[date];
    if (!dayPlan) return { completed: 0, total: 0 };

    const total = dayPlan.tasks?.length || 0;
    const completed = dayPlan.tasks?.filter((_, index) =>
      completedTasks[`${date}-${index}`]
    ).length || 0;

    return { completed, total };
  };

  // Format date string for comparison
  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateString(date) === formatDateString(today);
  };

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset);
    return d;
  };

  // Get month start
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Navigation handlers
  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Generate days based on view mode
  const displayDays = useMemo(() => {
    const days: Date[] = [];

    if (viewMode === "day") {
      days.push(new Date(currentDate));
    } else if (viewMode === "week") {
      const weekStart = getWeekStart(currentDate);
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        days.push(day);
      }
    } else {
      // Month view
      const monthStart = getMonthStart(currentDate);
      const firstDayOfWeek = monthStart.getDay();
      const startOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;

      // Start from the Monday of the week containing the 1st
      const calendarStart = new Date(monthStart);
      calendarStart.setDate(monthStart.getDate() + startOffset);

      // Always show 6 weeks (42 days) for consistent grid
      for (let i = 0; i < 42; i++) {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + i);
        days.push(day);
      }
    }

    return days;
  }, [currentDate, viewMode]);

  // Get header text based on view mode
  const headerText = useMemo(() => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } else if (viewMode === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
      const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
      const year = weekEnd.getFullYear();

      if (startMonth === endMonth) {
        return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${year}`;
      }
      return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
    } else {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }, [currentDate, viewMode]);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Day cell component
  const DayCell = ({ date, isMonthView = false }: { date: Date; isMonthView?: boolean }) => {
    const dateString = formatDateString(date);
    const { completed, total } = getTaskCounts(dateString);
    const isSelected = selectedDate === dateString;
    const hasTasks = total > 0;
    const allCompleted = total > 0 && completed === total;
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();

    return (
      <button
        onClick={() => onSelectDate(dateString)}
        className={cn(
          "flex flex-col items-center rounded-xl transition-all",
          isMonthView ? "py-2 px-1" : "py-3 px-2",
          isSelected
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
            : isToday(date)
            ? "bg-purple-50 border-2 border-purple-200"
            : hasTasks
            ? "bg-gray-50 hover:bg-gray-100"
            : "hover:bg-gray-50",
          isMonthView && !isCurrentMonth && "opacity-40"
        )}
      >
        {/* Day name (only for week/day view) */}
        {!isMonthView && (
          <span
            className={cn(
              "text-xs font-medium mb-1",
              isSelected ? "text-white/80" : "text-gray-500"
            )}
          >
            {dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]}
          </span>
        )}

        {/* Date number */}
        <span
          className={cn(
            "font-semibold",
            isMonthView ? "text-sm mb-0.5" : "text-lg mb-1",
            isSelected ? "text-white" : "text-gray-900"
          )}
        >
          {date.getDate()}
        </span>

        {/* Task count badge */}
        {hasTasks && (
          <span
            className={cn(
              "font-medium rounded-full",
              isMonthView ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5",
              isSelected
                ? "bg-white/20 text-white"
                : allCompleted
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {completed}/{total}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-full transition-all capitalize",
                viewMode === mode
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("prev")}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-gray-700">{headerText}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("next")}
          className="h-8 w-8"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {viewMode === "day" ? (
          /* Day View - Single day centered */
          <div className="flex justify-center">
            <div className="w-32">
              <DayCell date={displayDays[0]} />
            </div>
          </div>
        ) : viewMode === "week" ? (
          /* Week View - 7 days in a row */
          <div className="grid grid-cols-7 gap-2">
            {displayDays.map((date) => (
              <DayCell key={formatDateString(date)} date={date} />
            ))}
          </div>
        ) : (
          /* Month View - Calendar grid */
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            {/* Date grid */}
            <div className="grid grid-cols-7 gap-1">
              {displayDays.map((date) => (
                <DayCell key={formatDateString(date)} date={date} isMonthView />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
