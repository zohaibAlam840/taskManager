import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function loadPem(): string {
  // Prefer env var (Vercel)
  const envPem = process.env.RDS_CA_PEM;
  if (envPem && envPem.trim().length > 0) return envPem;

  // Prefer region bundle (local)
  const regionPath = path.join(process.cwd(), "certs", "eu-north-1-bundle.pem");
  if (fs.existsSync(regionPath)) return fs.readFileSync(regionPath, "utf8");

  // Fallback: global bundle (local)
  const globalPath = path.join(process.cwd(), "certs", "global-bundle.pem");
  if (fs.existsSync(globalPath)) return fs.readFileSync(globalPath, "utf8");

  throw new Error("Missing RDS CA bundle. Add certs/eu-north-1-bundle.pem or set RDS_CA_PEM.");
}

// Split bundle into array of PEM certs (more reliable)
function pemToCaArray(pem: string): string[] {
  const normalized = pem.replace(/\r\n/g, "\n").trim();
  const parts = normalized
    .split(/(?=-----BEGIN CERTIFICATE-----)/g)
    .map((p) => p.trim())
    .filter(Boolean);

  // sanity check
  if (parts.length === 0 || !parts[0].includes("BEGIN CERTIFICATE")) {
    throw new Error("CA bundle parse failed (no certificates found). Check PEM encoding/contents.");
  }
  return parts;
}

const caPem = loadPem();
const ca = pemToCaArray(caPem);

// IMPORTANT: keep DATABASE_URL clean (no sslmode params needed)
const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pgPool;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pgPool),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
