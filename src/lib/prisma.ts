import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getConnectionString() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return raw.replace(/^["']|["']$/g, "");
}

function createPrismaClient() {
  const connectionString = getConnectionString();
  const isSupabase = connectionString.includes("supabase.co");
  const pool = new pg.Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
