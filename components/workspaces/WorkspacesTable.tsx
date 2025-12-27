"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { WorkspaceListItem } from "@/lib/api/workspaces";
import { deleteWorkspace } from "@/lib/api/workspaces";

export default function WorkspacesTable({
  items,
  loading,
  onChanged,
}: {
  items: WorkspaceListItem[];
  loading: boolean;
  onChanged: () => void; // call refresh() from Dashboard page
}) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(workspaceId: string) {
    setDeletingId(workspaceId);
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="border rounded-2xl p-4 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((w) => {
            const isOwner = w.myRole === "OWNER";
            const busy = deletingId === w.id;

            return (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{w.myRole}</Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workspaces/${w.id}`}>Open</Link>
                    </Button>

                    {isOwner && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" disabled={busy}>
                            {busy ? "Deleting…" : "Delete"}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the workspace and everything inside it:
                              projects, tasks, activity logs, and members. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(w.id)}
                              disabled={busy}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                No workspaces yet. Create your first workspace.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
