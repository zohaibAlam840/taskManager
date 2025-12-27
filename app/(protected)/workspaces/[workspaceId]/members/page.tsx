"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { listWorkspaces } from "@/lib/api/workspaces";
import { listMembers } from "@/lib/api/member";
import type { WorkspaceRole } from "@/lib/rbac/workspace";
import { can } from "@/lib/rbac/workspace";

import WorkspaceHeader from "@/components/workspaces/WorkspaceHeader";
import InviteMemberDialog from "@/components/workspaces/InviteMemberDialog";
import MembersTable from "@/components/workspaces/MembersTable";

export default function MembersPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  const [role, setRole] = React.useState<WorkspaceRole>("MEMBER");
  const [name, setName] = React.useState("Workspace");
  const [members, setMembers] = React.useState<any[]>([]);
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
      const m = await listMembers(workspaceId);
      setMembers(m.members);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const canInvite = can(role, "workspace:invite");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <WorkspaceHeader workspaceId={workspaceId} name={name} role={role} />
        <InviteMemberDialog workspaceId={workspaceId} canInvite={canInvite} onInvited={refresh} />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <MembersTable workspaceId={workspaceId} myRole={role} members={members} onChanged={refresh} />
      )}
    </div>
  );
}
