import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasRdsCaPemB64: Boolean(process.env.RDS_CA_PEM_B64),
    nodeEnv: process.env.NODE_ENV,
  });
}
