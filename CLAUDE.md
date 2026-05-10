# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (https://0.0.0.0:13348, self-signed SSL)
npm run build        # Type-check (vue-tsc) then build (vite)
npm run type-check   # Type-check only (vue-tsc --noEmit)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier (src/ only)
npm run test         # Vitest (run once)
npm run test:watch   # Vitest in watch mode
npm run test:single  # Vitest run (same as test, alias)
```

No separate vitest config file — vitest reads from `vite.config.ts`.

## Architecture

Vue 3 + TypeScript PWA for impulse/urge management ("慢一点"). Mobile-first, Chinese UI.

**Stack:** Vue 3 (Composition API + `<script setup>`), Pinia (persisted to localStorage), Vue Router, Tailwind CSS, Vite, Supabase (auth + cloud backup).

**Key layers:**

- `src/stores/useUrgeStore.ts` — Central store. Holds tasks, urgeLogs, checkInRecords. Persisted under key `self-discipline-app-store`. All business logic for interventions, check-ins, streaks, calendar views lives here.
- `src/stores/useAuthStore.ts` — Auth state (Supabase). Persisted under key `self-discipline-app-auth`.
- `src/composables/useCloudSync.ts` — Upload/download backup to Supabase `user_backups` table.
- `src/composables/useAuth.ts` — Supabase auth wrapper (signUp, signIn, signOut).
- `src/utils/` — Pure logic: streak calculation, week/month calendar generation, time state helpers.

**Two task types:**
- `DONT_WANT` ("我不要") — urge resistance tasks. User triggers intervention flow when impulse hits.
- `DO_WANT` ("我想要") — daily check-in tasks with start/end dates.

**Intervention flow:** Home → `/intervention` (select TIMER/BREATHE/DUMP) → component runs → `/result` (record outcome). Route guard requires `isInIntervention` state.

**Environment variables** (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Conventions

- Composition API with `<script setup>` exclusively — no Options API.
- Path alias: `@/` → `src/`.
- Tailwind custom colors: `primary-*` (green), `calm-*` (slate). Defined in `tailwind.config.js`.
- Prettier: no semicolons, single quotes, no trailing commas, 100 char width.
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`.
