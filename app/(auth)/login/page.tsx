import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  console.log("DATABASE_URL (sanitized):", process.env.DATABASE_URL?.replace(/\/\/.*?:.*?@/, "//***:***@"));

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
