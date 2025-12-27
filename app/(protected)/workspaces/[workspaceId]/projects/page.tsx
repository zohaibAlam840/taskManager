"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { listWorkspaces } from "@/lib/api/workspaces";
import { listProjects } from "@/lib/api/project";
import type { WorkspaceRole } from "@/lib/rbac/workspace";
import { can } from "@/lib/rbac/workspace";

import WorkspaceHeader from "@/components/workspaces/WorkspaceHeader";
import CreateProjectDialog from "@/components/workspaces/CreateProjectDialog";
import ProjectsTable from "@/components/workspaces/ProjectsTable";

export default function ProjectsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  const [role, setRole] = React.useState<WorkspaceRole>("MEMBER");
  const [name, setName] = React.useState("Workspace");
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const ws = await listWorkspaces();
      const current = ws.workspaces.find((w) => w.id === workspaceId);
      if (current) {
        setRole(current.myRole);
        setName(current.name);
      }
      const p = await listProjects(workspaceId);
      setProjects(p.projects);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const canCreate = can(role, "project:create");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <WorkspaceHeader workspaceId={workspaceId} name={name} role={role} />
        <CreateProjectDialog workspaceId={workspaceId} canCreate={canCreate} onCreated={refresh} />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <ProjectsTable workspaceId={workspaceId} projects={projects} />
      )}
    </div>
  );
}
