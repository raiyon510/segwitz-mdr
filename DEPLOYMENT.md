# Deployment Guide — SegWitz Meeting & Decision Repository

## Vercel Deployment

### 1. Database Setup

**Option A: Vercel Postgres**
1. In your Vercel project dashboard, go to **Storage** → **Create Database** → **Postgres**
2. Copy the `POSTGRES_URL` connection string

**Option B: External PostgreSQL (Supabase, Neon, Railway)**
1. Create a PostgreSQL database on your provider
2. Copy the connection string in format: `postgresql://user:password@host:5432/dbname`

### 2. Supabase Storage Setup

1. Create a [Supabase](https://supabase.com) project
2. Go to **Storage** → **New Bucket**
   - Name: `segwitz-attachments`
   - Public: Yes (or configure RLS policies)
3. Copy from **Settings** → **API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Environment Variables

Set these in Vercel **Settings** → **Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `AUTH_SECRET` | Random 32+ char secret | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | Production URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set production environment variables in Vercel dashboard, then:
vercel --prod
```

Or connect your Git repository in the [Vercel Dashboard](https://vercel.com/new):
1. Import the repository
2. Framework Preset: **Next.js**
3. Add environment variables
4. Deploy

### 5. Database Migration

After first deploy, run migrations against production:

```bash
# Set production DATABASE_URL locally or use Vercel env
npx prisma db push

# Seed initial data (first deploy only)
npm run db:seed
```

For production, prefer migrations over `db push`:

```bash
npx prisma migrate deploy
```

### 6. Post-Deployment Checklist

- [ ] Verify login at `/login` with admin credentials
- [ ] Change default admin password immediately
- [ ] Test file upload on a meeting
- [ ] Verify dashboard charts load with data
- [ ] Confirm RBAC — test with different role accounts
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)

## Local Development with Prisma Postgres

```bash
# Start local Prisma Postgres (uses prisma dev)
npx prisma dev

# In another terminal
npm run db:push
npm run db:seed
npm run dev
```

## Security Recommendations

1. **Rotate `AUTH_SECRET`** — Use a cryptographically random value in production
2. **Restrict Supabase keys** — Never expose service role key client-side
3. **HTTPS only** — Vercel enforces this automatically
4. **Change seed passwords** — Default credentials are for development only
5. **Database backups** — Enable automated backups on your Postgres provider
6. **Audit logs** — Review regularly via `/audit-logs`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Prisma | Ensure `postinstall` script runs `prisma generate` |
| Auth redirect loop | Verify `AUTH_URL` matches your deployment URL |
| File upload fails | Check Supabase bucket name is `segwitz-attachments` |
| Database connection error | Verify `DATABASE_URL` and SSL settings for your provider |
| 403 on pages | Check user role has required permissions in `src/lib/rbac.ts` |

## Scaling Notes

- Vercel serverless functions handle Server Actions automatically
- For high traffic, consider connection pooling (PgBouncer, Prisma Accelerate)
- Supabase Storage scales with your Supabase plan
- Audit logs table will grow — consider archival policy after 12 months
