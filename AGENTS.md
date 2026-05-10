# AGENTS.md

**慢一点 (Slow Down)** — Chinese-language Vue 3 PWA for impulse management.

## Stack

- Vue 3 (`<script setup>` Composition API), Vite 5, TypeScript strict
- Pinia + `pinia-plugin-persistedstate` (localStorage), Vue Router, Tailwind CSS
- **Supabase** (optional auth + cloud backup)
- PWA via `vite-plugin-pwa` (auto-update SW, offline-capable)
- Testing: Vitest (no config file — reads from `vite.config.ts`)
- Lint: ESLint (`@vue/eslint-config-typescript` + `@vue/eslint-config-prettier`)
- Formatter: Prettier (no semicolons, single quotes, 100 width)

## Commands

```bash
npm run dev          # HTTPS dev server on port 13348 (strictPort, host 0.0.0.0)
npm run build        # vue-tsc type-check && vite build (type errors → build failure)
npm run preview      # vite preview
npm run lint         # eslint . --fix (ext: .vue,.js,.ts,.jsx,.tsx,...)
npm run format       # prettier --write src/
npm run type-check   # vue-tsc --noEmit (standalone, not needed before build)
npm run test         # vitest (no config, shares vite.config.ts)
npm run test:watch   # vitest --watch
npm run test:single  # NOTE: same as `test` (vitest run), not single-file runner
npm run test:coverage  # vitest run --coverage
```

## Architecture

### Entrypoints
- `src/main.ts` — app bootstrap (Pinia + persistence plugin, Vue Router)
- `src/router/index.ts` — all routes lazy-loaded via dynamic imports
- `src/App.vue` — header/nav shell, hides during intervention flow
- `index.html` — lang `zh-CN`, Chinese PWA manifest "慢一点"

### Stores (Pinia, both persisted)
- `useUrgeStore` — key `self-discipline-app-store`, paths: `tasks`, `urgeLogs`, `checkInRecords`
- `useAuthStore` — key `self-discipline-app-auth`, paths: `user`, `lastSyncTime`, `hasCloudData`

### Core Types (`src/types/index.ts`)
- `InterventionType`: `'TIMER' | 'BREATHE' | 'DUMP'`
- `TaskType`: `'DONT_WANT' | 'DO_WANT'`
- `Outcome`: `'resisted' | 'relapsed' | null`
- `Task`, `UrgeLog`, `CheckInRecord`, `TaskDayStatus`, etc.

### Intervention Flow (3 steps)
1. **HomeView** → button triggers `store.startIntervention()` → navigate to `/intervention?taskId=&urgeId=`
2. **InterventionView** → pick TIMER/BREATHE/DUMP → step component emits done → `/result`
3. **ResultView** → select resisted/relapsed + optional task → `store.completeIntervention()` → back to `/`

### Route Guard
- `/result` has `meta.requiresIntervention: true` — router `beforeEach` blocks direct access unless `store.isInIntervention` is true

### Styling
- Custom Tailwind colors (no default green/slate): `primary-*` (green scale) and `calm-*` (slate scale)
- Component classes: `.btn-primary`, `.btn-secondary`, `.card`, `.intervention-skip-btn`
- iOS safe-area utilities: `.safe-top`, `.safe-bottom`, `.navigation-safe`, `.pb-with-nav`, `.pb-with-button`

## Gotchas

- **TypeScript**: `tsconfig.json` excludes `src/**/__tests__/*` from type checking. `noUnusedLocals` and `noUnusedParameters` are errors.
- **Supabase**: `.env` is gitignored but required locally. Vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Without them, app throws on import of `src/utils/supabase.ts`.
- **Vitest**: No separate config — it reads `vite.config.ts` automatically. `jsdom` is the test environment (devDependency). No test files exist yet.
- **PWA**: Dev server runs **HTTPS** (required by SW), uses `@vitejs/plugin-basic-ssl` with a generated self-signed cert.
- **Pinia persistence**: Uses Options API `persist` block (not `persistedState` auto-ref), explicit key + paths required.
- **ESLint**: `@typescript-eslint/no-unused-vars` and `vue/no-unused-vars` are errors.

## Key Files

| Path | Purpose |
|------|---------|
| `src/stores/useUrgeStore.ts` | Core state: tasks, logs, check-ins, intervention lifecycle |
| `src/stores/useAuthStore.ts` | Auth + cloud sync state |
| `src/composables/useAuth.ts` | Supabase auth operations |
| `src/composables/useCloudSync.ts` | Supabase `user_backups` table CRUD |
| `src/utils/supabase.ts` | Supabase client singleton |
| `src/utils/streakCalculator.ts` | Calendar data, streak, task-day-status logic |

## Existing Instructions

- `opencode.json` references `DEBUGGING.md` + this file