# Real-Time Client Project Dashboard

An internal agency dashboard for clients, projects, assigned development work, persistent activity, notifications, and live presence. The supplied React starter informed the responsive, dark-mode, card-led interface; its dummy workspace state has been replaced with a typed API-backed client and a secure relational backend.

## Features

- JWT access authentication with refresh tokens in `HttpOnly` cookies (never local storage).
- API-enforced roles: `ADMIN`, `PROJECT_MANAGER`, and `DEVELOPER`; resource ownership is checked on every protected action.
- PostgreSQL/Prisma data model for clients, projects, tasks, activity logs, and notifications.
- Socket.io authenticated realtime activity, notification badges, missed-event catch-up from PostgreSQL, secure project rooms, and multi-tab-safe online presence.
- Server-side Zod validation, consistent error envelopes, rate limiting, cron-managed overdue flags, URL-backed task filters, and seeded demo data.

## Stack and architecture

React + TypeScript/Vite powers the client. Express + TypeScript serves REST and Socket.io from one Node server. Prisma is used because its typed relational client, migrations, and transaction API fit this access-sensitive PostgreSQL domain. Express keeps the HTTP layer small and conventional; Socket.io provides authenticated reconnects, rooms, acknowledgements, and browser fallback transport without polling; `node-cron` is sufficient for the lightweight, idempotent hourly overdue scan and avoids adding Redis/Bull infrastructure.

```
frontend/src/{app,components,features,hooks,pages,services,types}
backend/src/{config,controllers,jobs,middleware,repositories,routes,services,utils,validators,websocket}
backend/prisma/{schema.prisma,seed.ts}
```

The request path is Route → authentication/validation middleware → controller → service → Prisma repository. Controllers only translate HTTP; services own RBAC decisions, transactions, and event dispatch.

## Setup

1. Install Node 20+ and PostgreSQL 15+; create an empty `agency_dashboard` database.
2. Copy `.env.example` to `backend/.env` and set real, unique JWT secrets. The root example is provided for reference; the backend reads its local `.env`.
3. Run `npm install`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run prisma:seed`.
4. Run `npm run dev`, then open `http://localhost:5173`.

For production run `npm run build`; set `NODE_ENV=production`, configure HTTPS, `CLIENT_ORIGIN`, a managed PostgreSQL URL, and deploy the backend as the Socket.io-capable long-running service. The frontend can be served as static files independently.

## Demo accounts

All seeded accounts use password `DemoPass123!`:

| Role | Email |
| --- | --- |
| Admin | admin@agency.test |
| Project manager | ravi.pm@agency.test |
| Project manager | maya.pm@agency.test |
| Developers | alex.dev@agency.test, sam.dev@agency.test, priya.dev@agency.test, jordan.dev@agency.test |

## API overview

`/api/auth` supports register, login, refresh, logout, and `me`. `/api/users` is admin-only for team management; `/api/users/developers` is the narrowly scoped assignment list available to admins and project managers. `/api/clients`, `/api/projects`, `/api/tasks`, `/api/activity`, and `/api/notifications` implement the assessment REST surface. Every response is `{ success: true, data }`; failures are `{ success: false, error: { code, message } }` without stack traces. Task lists apply `status`, `priority`, `dueFrom`, and `dueTo` in SQL/Prisma, e.g. `/api/tasks?status=IN_REVIEW&priority=CRITICAL`.

## Realtime and security

The client passes its in-memory access token in Socket.io auth. The server validates it, joins user-specific and role-safe rooms, gets the last 20 authorized activity records from PostgreSQL, and emits `activity:catchup`. `join_project` is also authorization checked before a room is entered. Admins receive global activity, PMs only activities from projects assigned to them, and developers only activities for tasks assigned to them. Presence is a `Map<userId, Set<socketId>>`, so multiple tabs count as one active user. Activity status updates use a Prisma transaction to update the task, write its log, and create any review notification before events are published after commit.

Refresh JWTs include a user-held token version, are verified server-side, use `HttpOnly`, `SameSite=lax`, and `Secure` in production. Logout increments the version and clears the cookie. The frontend stores only the short-lived access token in Redux memory. Zod validates body, params, and query inputs; Helmet, CORS, and rate limiting are configured server-side.

## Schema and indexes

Foreign keys link projects to clients, audit creators, and assigned project managers; tasks to projects/developers; activity to actor/task/project; and notifications to recipients. Unique `User.email` enables login lookup. Project `createdById`, `projectManagerId`, and `clientId` indexes support auditing, ownership checks, and client listings. Task indexes cover project, assignee, status, priority, due date, and project/status filtering. Activity indexes support project/task timelines and newest-first reads. Notification recipient/read and recipient/created compound indexes power the badge/dropdown. `Task.isOverdue` is a derived persisted flag maintained hourly by an idempotent `updateMany`; status remains one of the four required values.

## Limitations

The in-process presence map is correct for one server instance. Horizontally scaled deployments should add the Socket.io Redis adapter and distributed presence store. Registration deliberately creates only developers; an admin provisions privileged accounts. Email delivery is outside this internal assessment.

## Verification checklist

- [x] React/TypeScript, Express/TypeScript, PostgreSQL, Prisma
- [x] Access + HttpOnly refresh JWT, API RBAC and ownership isolation
- [x] Clients, projects, tasks, required statuses/priorities, persistent activity
- [x] Socket.io live/catch-up activity, filtered delivery, presence, notifications
- [x] Role dashboards, URL filters, cron overdue job, validation, structured errors
- [x] Seed: 1 admin, 2 PMs, 4 developers, 3 projects, 15 tasks, overdue tasks, activity and notifications
- [x] No MongoDB, polling, SSE, or JavaScript application source
