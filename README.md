# Milo — Personal Assistant App

React Native (Android) + Express backend. See [Milo-Roadmap.md](./Milo-Roadmap.md) for the full
phased plan.

## Structure

- `server/`, `shared/` — Express + TypeScript backend, Drizzle ORM against Neon Postgres
- `mobile/` — Expo React Native app (Android-only), navigation shell: Dashboard, Habits, Reminders

## Backend setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL from a Neon project
npm run db:push        # push schema to the database
npm run dev             # starts on :5000
```

## Mobile setup

```bash
cd mobile
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at the backend
npm start
```

## Deploy

Backend deploys to Render — `render.yaml` defines the service; connect the repo in the Render
dashboard and set `DATABASE_URL` there (not committed).
