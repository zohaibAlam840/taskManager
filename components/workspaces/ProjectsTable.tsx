"use client";

import Link from "next/link";
import type { ProjectItem } from "@/lib/api/project";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProjectsTable({
  workspaceId,
  projects,
}: {
  workspaceId: string;
  projects: ProjectItem[];
}) {
  return (
    <div className="border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Tasks</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <Link className="underline underline-offset-4" href={`/workspaces/${workspaceId}/projects/${p.id}`}>
                  {p.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground truncate max-w-[420px]">
                {p.description || "—"}
              </TableCell>
              <TableCell className="text-right">{p._count?.tasks ?? "—"}</TableCell>
            </TableRow>
          ))}

          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                No projects yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
