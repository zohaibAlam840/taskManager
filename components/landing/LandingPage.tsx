"use client";

import React from "react";

type FeaturesProps = {
  onQuickTip?: () => void;
};

export default function Features({ onQuickTip }: FeaturesProps) {
  return (
    <div className="rounded-2xl border bg-background/60 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need to create workspaces, collaborate with members, and manage tasks.
          </p>
        </div>

        {onQuickTip ? (
          <button
            type="button"
            onClick={onQuickTip}
            className="shrink-0 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Quick tip
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="font-medium">Workspaces</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Organize projects by team or client with role-based access.
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-medium">Members & Roles</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Invite users and control permissions with OWNER / ADMIN / MEMBER roles.
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-medium">Tasks</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Track status, priority, due dates, and assignments with activity logs.
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-medium">Projects</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Group tasks under projects and keep work structured.
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-medium">Secure by Design</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Server-side auth checks and RBAC enforcement per request.
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-medium">Fast UI</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Optimized landing experience with a clear onboarding path.
          </div>
        </div>
      </div>
    </div>
  );
}
