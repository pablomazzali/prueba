"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name;
        if (fullName) {
          setUserName(fullName);
        } else {
          const emailName = user.email?.split("@")[0];
          if (emailName) {
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        }
      }
    };

    fetchUserData();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end px-6 py-4 bg-gray-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Settings className="h-6 w-6 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-500">Account</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
