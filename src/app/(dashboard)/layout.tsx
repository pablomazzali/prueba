"use client";

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Header } from "@/components/dashboard/header";
import { HelpTooltip } from "@/components/shared/help-tooltip";
import { DataProvider } from "@/lib/contexts/data-context";
import { usePrefetchData } from "@/lib/hooks/use-prefetch-data";

function DashboardContent({ children }: { children: React.ReactNode }) {
  // Prefetch all data when dashboard mounts
  usePrefetchData();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {children}
        </div>
      </main>

      {/* Bottom navigation - visible on all screen sizes */}
      <BottomNav />

      {/* Help tooltip */}
      <HelpTooltip />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <DashboardContent>{children}</DashboardContent>
    </DataProvider>
  );
}
