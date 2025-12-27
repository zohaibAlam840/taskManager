"use client";

import React from "react";
import Link from "next/link";
import { LogOut, User, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { useAuth } from "@/lib/auth/auth-store";
import { logout } from "@/lib/api/auth";

export default function Topbar() {
  const { user, refresh } = useAuth();
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
      await refresh();
      toast.success("Logged out");
      router.replace("/login");
    } catch (e: any) {
      toast.error(e?.message ?? "Logout failed");
    }
  }

  const initials =
    (user?.email?.slice(0, 2) ?? "U").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <WorkspaceSwitcher />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/my-task" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              My Tasks
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block text-sm text-muted-foreground truncate max-w-[240px]">
            {user?.email}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-2 rounded-xl">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-flex ml-2 text-sm">Account</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="truncate">{user?.email ?? "Signed in"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/my-task">My tasks</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
