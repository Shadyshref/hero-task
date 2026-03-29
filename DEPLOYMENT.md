## Deployment Guide for Hero-Task

This project is now a single **Next.js full-stack application**.

- **Frontend**: Next.js App Router
- **Backend**: Next Server Actions
- **Database**: PostgreSQL via `DATABASE_URL`

---

## Deploy to Vercel

1. Push your latest changes to GitHub.
2. Import the repository into Vercel.
3. Keep the **Root Directory** as the repository root.
4. Add this environment variable:

```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

5. Deploy.

Vercel should detect the project as a normal Next.js app automatically.

---

## Local Development

```bash
npm install
npm run dev
```

The app runs at:

```bash
http://localhost:3000
```

---

## Production Checks

Before deploying, you can run:

```bash
npm run lint
npm run build
```

---

## Notes

- There is no separate Express backend anymore.
- There is no separate Railway deployment anymore.
- All project save/load/delete operations run inside Next.js through Server Actions.
