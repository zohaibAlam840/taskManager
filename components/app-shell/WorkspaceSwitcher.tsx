"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listWorkspaces, type WorkspaceListItem } from "@/lib/api/workspaces";
import { toast } from "sonner";

function getWorkspaceIdFromPath(pathname: string | null) {
  if (!pathname) return null;
  const m = pathname.match(/\/workspaces\/([^/]+)/);
  return m?.[1] ?? null;
}

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = getWorkspaceIdFromPath(pathname);

  const [items, setItems] = React.useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listWorkspaces();
      setItems(data.workspaces ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const active = items.find((w) => w.id === activeId);
  const label = active ? `${active.name} (${active.myRole})` : "Select workspace";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[240px] justify-between" disabled={loading}>
          <span className="truncate">{loading ? "Loading…" : label}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[320px]">
        <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
        )}

        {items.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onClick={() => router.push(`/workspaces/${w.id}`)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{w.name}</span>
            <span className="text-xs text-muted-foreground">{w.myRole}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={refresh}>Refresh</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
