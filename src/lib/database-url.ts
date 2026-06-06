/**
 * Supabase direct connections (port 5432) use IPv6-only hostnames.
 * Vercel serverless is IPv4-only, so production must use the transaction
 * pooler on port 6543 with pgbouncer=true.
 */
export function resolveDatabaseUrl(raw?: string): string {
  const value = raw ?? process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  let url = value.replace(/^["']|["']$/g, "");

  const usePooler =
    process.env.VERCEL === "1" ||
    process.env.USE_SUPABASE_POOLER === "true";

  if (usePooler && url.includes("supabase.co") && !url.includes(":6543")) {
    url = url.replace(/:5432(\/|$)/, ":6543$1");
    url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }

  return url;
}
