# SegWitz Meeting & Decision Repository

Central internal system for recording meetings, decisions, approvals, action items, and follow-ups at SegWitz.

**Answers the four critical questions:**
- What was discussed?
- What was decided?
- Who approved it?
- What needs to happen next?

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Server Actions, Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (Auth.js v5) with RBAC |
| Storage | Supabase Storage |
| Validation | Zod |
| Deployment | Vercel |

## Features

- **Executive Dashboard** — KPIs, charts, recent activity
- **Meeting Management** — Full lifecycle with draft/finalize, attendees, attachments
- **Decision Register** — Standalone decisions with status history and approvals
- **Action Item Tracker** — Assignments, priorities, overdue detection
- **Organization** — Divisions and departments master data
- **User Management** — CRUD with 6 role-based access levels
- **Projects & Clients** — Linked to meetings and decisions
- **Global Search** — Multi-criteria search across all entities
- **Audit Logs** — Full change tracking
- **File Attachments** — PDF, Office docs, images via Supabase Storage

## Roles (RBAC)

| Role | Access |
|------|--------|
| Admin | Full access |
| Management | View everything |
| Department Head | Manage department records |
| Project Manager | Create and manage project meetings |
| Team Member | Update assigned action items |
| View Only | Read only |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) Supabase project for file storage

### Setup

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, and Supabase credentials

# Push schema and seed data
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with:

| User | Email | Password |
|------|-------|----------|
| Admin | admin@segwitz.com | Admin@123 |
| Project Manager | pm@segwitz.com | Pm@123456 |
| Developer | dev@segwitz.com | Dev@123456 |
| Management | ceo@segwitz.com | Ceo@123456 |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected routes with sidebar layout
│   │   ├── page.tsx          # Executive dashboard
│   │   ├── meetings/         # Meeting CRUD
│   │   ├── decisions/        # Decision register
│   │   ├── actions/          # Action item tracker
│   │   ├── projects/         # Projects
│   │   ├── clients/          # Clients
│   │   ├── users/            # User management
│   │   ├── organization/     # Divisions & departments
│   │   ├── search/           # Global search
│   │   └── audit-logs/       # Audit trail
│   ├── login/                # Authentication
│   └── api/auth/             # NextAuth handlers
├── actions/                  # Server actions
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Sidebar, header, shell
│   └── [module]/             # Feature components
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── rbac.ts               # Role-based permissions
│   ├── prisma.ts             # Database client
│   └── validations/          # Zod schemas
└── middleware.ts             # Auth middleware
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Seed data
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.

## License

Proprietary — SegWitz Internal Use Only
