"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { listWorkspaces } from "@/lib/api/workspaces";
import { listProjects, type ProjectItem, deleteProject } from "@/lib/api/project";
import { listMembers } from "@/lib/api/member";
import type { WorkspaceRole } from "@/lib/rbac/workspace";
import { can } from "@/lib/rbac/workspace";

import WorkspaceHeader from "@/components/workspaces/WorkspaceHeader";
import WorkspaceOverviewCards from "@/components/workspaces/WorkspaceOverviewCards";
import TasksByProjectChart from "@/components/workspaces/TasksByProjectChart";
import RecentProjectsCard from "@/components/workspaces/RecentProjectsCard";

export default function WorkspaceHomePage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  const [role, setRole] = React.useState<WorkspaceRole>("MEMBER");
  const [name, setName] = React.useState<string>("Workspace");

  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [membersCount, setMembersCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  const canDeleteProject = can(role, "project:delete"); // OWNER/ADMIN by your can()

  async function refresh() {
    setLoading(true);
    try {
      const ws = await listWorkspaces();
      const current = ws.workspaces.find((w) => w.id === workspaceId);
      if (current) {
        setRole(current.myRole);
        setName(current.name);
      }

      const [p, m] = await Promise.all([listProjects(workspaceId), listMembers(workspaceId)]);
      setProjects(p.projects ?? []);
      setMembersCount(m.members?.length ?? 0);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const projectsCount = projects.length;

  // total tasks across all projects (if your API includes _count.tasks)
  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0), 0);

  const recentProjects = projects
    .slice(0, 6)
    .map((p) => ({ id: p.id, name: p.name, tasks: p._count?.tasks ?? 0, createdAt: p.createdAt }));

  async function onDeleteProject(projectId: string) {
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspaceId={workspaceId} name={name} role={role} />

      <WorkspaceOverviewCards
        loading={loading}
        projectsCount={projectsCount}
        membersCount={membersCount}
        totalTasks={totalTasks}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <TasksByProjectChart loading={loading} projects={projects} />
        <RecentProjectsCard
          loading={loading}
          workspaceId={workspaceId}
          projects={recentProjects}
          canDelete={canDeleteProject}
          onDelete={onDeleteProject}
        />
      </div>
    </div>
  );
}
