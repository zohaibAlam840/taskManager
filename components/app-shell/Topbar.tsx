"use client";

import React from "react";
import Link from "next/link";
import { LogOut, User, CheckSquare, Bell } from "lucide-react";
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

// ✅ import your hook
import { useNotifications } from "@/lib/realtime/useNotifications";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotifHref(payload: any) {

  if (payload?.projectId) return `/my-task`;
  return "/my-task";
}

function getNotifTitle(payload: any) {
  const t = payload?.type ?? "NOTIFICATION";
  const title = payload?.title ? `: ${payload.title}` : "";

  switch (t) {
    case "TASK_ASSIGNED":
      return `Task assigned${title}`;
    case "TASK_UNASSIGNED":
      return `Task unassigned${title}`;
    case "TASK_UPDATED":
      return `Task updated${title}`;
    case "TASK_DELETED":
      return `Task deleted${title}`;
    default:
      return `${t}${title}`;
  }
}

function getNotifSubtitle(payload: any) {
  // Optional extra text for TASK_UPDATED message, etc.
  if (payload?.type === "TASK_UPDATED" && payload?.message) return payload.message;
  if (payload?.projectId) return `Project: ${payload.projectId}`;
  return "";
}

export default function Topbar() {
  const { user, refresh } = useAuth();
  const router = useRouter();

  // ✅ use hook
  const { items, unread, markAllRead, clearAll } = useNotifications();

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

  const initials = (user?.email?.slice(0, 2) ?? "U").toUpperCase();

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
          {/* ✅ Notifications */}
          <DropdownMenu
            onOpenChange={(open) => {
              // mark all as read when dropdown opens
              if (open) markAllRead();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-9 px-0 rounded-xl relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] leading-[18px] text-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[360px] p-0">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="text-sm font-medium">Notifications</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAllRead();
                    }}
                  >
                    Mark read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearAll();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {items.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                  No notifications yet.
                </div>
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  {items.map((n) => {
                    const href = getNotifHref(n.payload);
                    const title = getNotifTitle(n.payload);
                    const sub = getNotifSubtitle(n.payload);

                    return (
                      <DropdownMenuItem
                        key={n.id}
                        className="p-0 focus:bg-accent"
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(href);
                        }}
                      >
                        <div className="w-full px-3 py-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{title}</div>
                              {sub ? (
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {sub}
                                </div>
                              ) : null}
                            </div>
                            <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {formatTime(n.at)}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:block text-sm text-muted-foreground truncate max-w-[240px]">
            {user?.email}
          </div>

          {/* Account menu */}
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
