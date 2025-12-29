"use client";

import React from "react";
import { toast } from "sonner";
import { BarChart3, ClipboardList, Users2, Layers3 } from "lucide-react";

import { listWorkspaces, type WorkspaceListItem } from "@/lib/api/workspaces";
import { listAssignedTasks } from "@/lib/api/assignedTasks"; // you already have this
import type { TaskStatus } from "@/lib/api/tasks";

import CreateWorkspaceDialog from "@/components/workspaces/CreateWorkspaceDialog";
import WorkspacesTable from "@/components/workspaces/WorkspacesTable";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(key: string) {
  // key: "2025-12"
  const [y, m] = key.split("-");
  return `${m}/${y.slice(-2)}`;
}

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function DashboardPage() {
  const [items, setItems] = React.useState<WorkspaceListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // dashboard analytics
  const [myTasksByStatus, setMyTasksByStatus] = React.useState<Record<TaskStatus, number>>({
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  });

  async function refresh() {
    setLoading(true);
    try {
      const ws = await listWorkspaces();
      const workspaces = ws.workspaces ?? [];
      setItems(workspaces);

      try {
        const t = await listAssignedTasks({});
        const tasks = t.tasks ?? [];
        const agg: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        for (const task of tasks) {
          const s = task.status as TaskStatus;
          if (agg[s] !== undefined) agg[s] += 1;
        }
        setMyTasksByStatus(agg);
      } catch {
        // ignore if not wired yet; dashboard still works
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  // KPIs
  const totalWorkspaces = items.length;

  const totalProjects = items.reduce((sum, w) => sum + safeNum(w._count?.projects), 0);
  const totalMembers = items.reduce((sum, w) => sum + safeNum(w._count?.members), 0);

  const myOpenTasks = myTasksByStatus.TODO + myTasksByStatus.IN_PROGRESS;

  // Chart 1: Workspaces created over time (last 6 months)
  const createdBuckets = (() => {
    const now = new Date();
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(monthKey(d));
    }

    const counts = new Map(keys.map((k) => [k, 0]));
    for (const w of items) {
      const dt = new Date(w.createdAt);
      const k = monthKey(new Date(dt.getFullYear(), dt.getMonth(), 1));
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }

    return keys.map((k) => ({ month: monthLabel(k), workspaces: counts.get(k) ?? 0 }));
  })();

  // Chart 2: Projects per workspace (top 8)
  const projectsByWorkspace = [...items]
    .map((w) => ({
      name: w.name.length > 14 ? w.name.slice(0, 14) + "…" : w.name,
      projects: safeNum(w._count?.projects),
    }))
    .sort((a, b) => b.projects - a.projects)
    .slice(0, 8);

  // Chart 3: Role distribution (myRole)
  const roleBreakdown = (() => {
    const map = new Map<string, number>();
    for (const w of items) map.set(w.myRole, (map.get(w.myRole) ?? 0) + 1);
    return Array.from(map.entries()).map(([role, count]) => ({ role, count }));
  })();

  // Chart 4: My tasks status
  const myTasksStatusChart = [
    { status: "TODO", count: myTasksByStatus.TODO },
    { status: "IN_PROGRESS", count: myTasksByStatus.IN_PROGRESS },
    { status: "DONE", count: myTasksByStatus.DONE },
  ];

  // Simple palette (keep it subtle)
  const PIE_COLORS = ["#111827", "#6B7280", "#D1D5DB"]; // dark → light (ok for dark mode too)

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your workspaces and assignments</p>
        </div>
        <CreateWorkspaceDialog onCreated={refresh} />
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Layers3 className="h-4 w-4" /> Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalWorkspaces}</div>
            <div className="mt-2 text-xs text-muted-foreground">Total workspaces you belong to</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalProjects}</div>
            <div className="mt-2 text-xs text-muted-foreground">Across all workspaces </div>
          </CardContent>
        </Card>


        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users2 className="h-4 w-4" /> Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalMembers}</div>
            <div className="mt-2 text-xs text-muted-foreground">Total members </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> My open tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : myOpenTasks}</div>
            <div className="mt-2 text-xs text-muted-foreground">TODO + IN_PROGRESS (from My Tasks API)</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Your workspaces</div>
          <div className="text-xs text-muted-foreground">Manage & open workspaces</div>
        </div>
        <WorkspacesTable items={items} loading={loading} onChanged={refresh} />
      </div>
      

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Workspaces created (last 6 months)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={createdBuckets} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="workspaces" strokeWidth={2} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Your roles</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleBreakdown} dataKey="count" nameKey="role" innerRadius={52} outerRadius={80}>
                  {roleBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex flex-wrap gap-2">
              {roleBreakdown.map((r) => (
                <Badge key={r.role} variant="secondary">
                  {r.role}: {r.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Projects per workspace (top)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsByWorkspace} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                <Tooltip />
                <Bar dataKey="projects" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">My tasks status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myTasksStatusChart} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      
    </div>
  );
}
