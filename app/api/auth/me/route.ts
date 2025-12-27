import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getUserIdFromRequest } from "@/lib/auth/session";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 200 });
}
