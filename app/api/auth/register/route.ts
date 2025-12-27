import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/session";

const RegisterSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Optional: auto-login after register
  const token = await signSession({ userId: user.id, email: user.email });
  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(AUTH_COOKIE, token, cookieOptions());
  return res;
}
