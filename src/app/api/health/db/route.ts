import { NextResponse } from "next/server";
import pg from "pg";
import { resolveDatabaseUrl } from "@/lib/database-url";

export const runtime = "nodejs";

/**
 * Lightweight deployment health check for auth/database wiring.
 * Does not expose secrets or user data.
 */
export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    authUrl: Boolean(process.env.AUTH_URL),
    vercel: process.env.VERCEL === "1",
    databaseConnected: false,
    adminUserExists: false,
  };

  if (!checks.databaseUrl) {
    return NextResponse.json({ ok: false, checks }, { status: 503 });
  }

  try {
    const pool = new pg.Pool({
      connectionString: resolveDatabaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const userResult = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND is_active = true) AS exists",
      ["admin@segwitz.com"]
    );
    checks.databaseConnected = true;
    checks.adminUserExists = Boolean(userResult.rows[0]?.exists);
    await pool.end();
  } catch (error) {
    console.error("[health/db]", error);
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: "Database connection failed on server",
      },
      { status: 503 }
    );
  }

  const ok =
    checks.authSecret &&
    checks.databaseUrl &&
    checks.databaseConnected &&
    checks.adminUserExists;

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
