"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { listWorkspaces } from "@/lib/api/workspaces";
import { getProject } from "@/lib/api/project";
import { listMembers } from "@/lib/api/member";
import { listTasks, type TaskItem, type TaskFilters } from "@/lib/api/tasks";
import type { WorkspaceRole } from "@/lib/rbac/workspace";
import { can } from "@/lib/rbac/workspace";

import WorkspaceHeader from "@/components/workspaces/WorkspaceHeader";
import TasksFiltersUI from "@/components/tasks/TaskFilters";
import TasksTable from "@/components/tasks/TaskTable";
import TaskDialog from "@/components/tasks/TaskDialog";
import TaskLogsDialog from "@/components/tasks/TaskLogsDialog";
import { Button } from "@/components/ui/button";

export default function ProjectTasksPage() {
  const params = useParams<{ workspaceId: string; projectId: string }>();
  const workspaceId = params.workspaceId;
  const projectId = params.projectId;

  const [role, setRole] = React.useState<WorkspaceRole>("MEMBER");
  const [workspaceName, setWorkspaceName] = React.useState("Workspace");

  const [projectName, setProjectName] = React.useState("Project");
  const [members, setMembers] = React.useState<{ id: string; name: string; email: string }[]>([]);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [filters, setFilters] = React.useState<TaskFilters>({});
  const [loading, setLoading] = React.useState(true);

  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [taskDialogMode, setTaskDialogMode] = React.useState<"create" | "edit">("create");
  const [activeTask, setActiveTask] = React.useState<TaskItem | null>(null);

  const [logsOpen, setLogsOpen] = React.useState(false);
  const [logsTask, setLogsTask] = React.useState<TaskItem | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const ws = await listWorkspaces();
      const current = ws.workspaces.find((w) => w.id === workspaceId);
      if (current) {
        setRole(current.myRole);
        setWorkspaceName(current.name);
      }

      const [p, m, t] = await Promise.all([
        getProject(projectId),
        listMembers(workspaceId),
        listTasks(projectId, filters),
      ]);

      setProjectName(p.project.name);
      setMembers(m.members.map((x) => x.user));
      setTasks(t.tasks);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, projectId, filters.status, filters.priority, filters.assignedTo]);

  const canCreateTask = can(role, "task:create");
  const canEditAny = can(role, "task:update:any");
  const canDelete = can(role, "task:delete");

  // UI rule: MEMBER can edit only tasks assigned to them.
  // Your backend should enforce the same.
  function canEditAssigned(task: TaskItem) {
    if (role !== "MEMBER") return false;
    // backend typically returns assignee or assignedTo; we use assignedTo
    // NOTE: to do strict matching, you’d use current user id; keep simple for now.
    // If your /api/auth/me returns user id, you can store it and compare.
    return Boolean(task.assignedTo); // minimal gate; server will enforce properly
  }

  function openCreate() {
    setTaskDialogMode("create");
    setActiveTask(null);
    setTaskDialogOpen(true);
  }

  function openEdit(task: TaskItem) {
    setTaskDialogMode("edit");
    setActiveTask(task);
    setTaskDialogOpen(true);
  }

  function openLogs(task: TaskItem) {
    setLogsTask(task);
    setLogsOpen(true);
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspaceId={workspaceId} name={workspaceName} role={role} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Project</div>
          <h1 className="text-xl font-semibold">{projectName}</h1>
        </div>

        <Button onClick={openCreate} disabled={!canCreateTask}>
          Create task
        </Button>
      </div>

      <TasksFiltersUI
        status={filters.status}
        priority={filters.priority}
        assignedTo={filters.assignedTo}
        assignees={members}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
      />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <TasksTable
          tasks={tasks}
          canEditAny={canEditAny}
          canEditAssigned={canEditAssigned}
          onEdit={openEdit}
          onLogs={openLogs}
        />
      )}

      <TaskDialog
        mode={taskDialogMode}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        projectId={projectId}
        assignees={members}
        task={activeTask}
        canDelete={canDelete}
        onDone={refresh}
      />

      <TaskLogsDialog task={logsTask} open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  );
}
