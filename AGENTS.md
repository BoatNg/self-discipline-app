# AGENTS.md - Self-Discipline App

## Project Overview

This is a Vue 3 + TypeScript + Vite PWA web application for impulse management and self-control. The app helps users manage urges through a structured intervention flow. All data is processed client-side with localStorage persistence.

## Technology Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite + `vite-plugin-pwa`
- **State Management**: Pinia + `pinia-plugin-persistedstate`
- **Styling**: Tailwind CSS
- **Routing**: Vue Router
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint + Prettier

## Development Commands

### Setup & Installation

```bash
# Install dependencies
npm install

# Or with pnpm
pnpm install
```

### Development

```bash
# Start development server (port 13348)
npm run dev

# Build for production (includes type checking)
npm run build

# Preview production build
npm run preview

# Lint and auto-fix code
npm run lint

# Format code with Prettier
npm run format

# Type checking only (no emit)
npm run type-check
```

### Testing (Vitest)

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm run test:single -- src/path/to/test.spec.ts

# Run tests with coverage
npm run test:coverage
```

### PWA Features

- Service Worker caches all assets for offline use
- App manifest configured for standalone display
- Works completely offline once installed

## Code Style Guidelines

### File Structure

```
src/
├── components/     # Reusable UI components
├── views/         # Page-level components
├── stores/        # Pinia stores (useUrgeStore.ts)
├── types/         # TypeScript type definitions
├── router/        # Vue Router configuration
├── assets/        # Static assets (CSS, images)
└── utils/         # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (e.g., `HomeView.vue`, `TimerStep.vue`)
- **Composables**: camelCase with "use" prefix (e.g., `useTimer.ts`)
- **Stores**: camelCase with "use" prefix (e.g., `useUrgeStore.ts`)
- **Types**: PascalCase (e.g., `UrgeLog`, `Task`)
- **Constants**: SCREAMING_SNAKE_CASE
- **CSS Classes**: Use Tailwind utility classes, minimize custom CSS

### Imports Order

```typescript
// 1. Vue and external dependencies
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

// 2. Internal modules (@/ aliases)
import { UrgeLog } from '@/types'
import { useTimer } from '@/composables/useTimer'
import { useUrgeStore } from '@/stores/useUrgeStore'

// 3. Local imports (same directory)
import SomeComponent from './SomeComponent.vue'
```

### TypeScript

- Always use TypeScript strict mode
- Define interfaces for all data structures in `src/types/index.ts`
- Use explicit return types for functions
- Avoid `any` type - use `unknown` or specific types
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe property access

### Vue Component Structure

```vue
<template>
  <!-- Template goes here -->
</template>

<script setup lang="ts">
// Composition API with <script setup>
import { ref, computed } from 'vue'
import { useUrgeStore } from '@/stores/useUrgeStore'

// Type definitions
interface Props {
  title?: string
}

// Props and emits
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'complete'): void
}>()

// Reactive state
const timer = ref(0)
const store = useUrgeStore()

// Computed properties
const formattedTime = computed(() => {
  return `${Math.floor(timer.value / 60)}:${timer.value % 60}`
})

// Functions
function handleComplete() {
  emit('complete')
}
</script>

<style scoped>
/* Use Tailwind classes instead of custom CSS when possible */
</style>
```

### State Management (Pinia)

- Keep stores focused and single-responsibility
- Use `persistedstate` plugin for localStorage persistence
- Define clear interfaces for store state
- Use getters for computed state
- Actions should be async when needed

```typescript
// Example store structure
export const useUrgeStore = defineStore('urge', {
  state: (): UrgeStoreState => ({
    logs: [],
    currentTask: null
  }),

  getters: {
    todayCount: (state) => {
      const today = new Date().setHours(0, 0, 0, 0)
      return state.logs.filter((log) => new Date(log.timestamp) >= today).length
    }
  },

  actions: {
    async addLog(log: Partial<UrgeLog>) {
      // Action logic
    }
  },

  persist: true // Enable localStorage persistence
})
```

### Error Handling

- Use try-catch blocks for async operations
- Display user-friendly error messages
- Log errors to console for debugging
- Validate user input with clear feedback

### Styling (Tailwind CSS)

- Use utility classes directly in templates
- Create custom components for repeated patterns
- Follow mobile-first responsive design
- Use Tailwind's color palette for consistency
- Keep custom CSS minimal - use `@apply` when needed

### PWA Configuration

- Service Worker must cache intervention flow assets
- Manifest should use `display: "standalone"`
- Ensure offline functionality for core features
- Test installability on mobile devices

## Development Rules

### Privacy & Security

- NO external API calls without explicit permission
- All data must be processed client-side
- Use localStorage for persistence
- No user authentication in MVP phase
- No collection of personal information

### Performance

- Lazy load non-critical components
- Optimize images and assets
- Minimize bundle size
- Use virtual scrolling for long lists
- Cache intervention assets for offline use

### Accessibility

- Use semantic HTML elements
- Add proper ARIA labels
- Ensure sufficient color contrast
- Support keyboard navigation
- Test with screen readers

### Testing Guidelines

- Write unit tests for composables and utilities
- Write component tests for complex UI logic
- Test intervention flow integration
- Mock localStorage for store tests
- Test PWA functionality

## Formatting & Linting Rules

- **Prettier**: Semicolons disabled, single quotes, 100 character line width
- **ESLint**: TypeScript + Vue rules with strict unused var checks
- **TypeScript**: Strict mode with no unused locals/parameters
- Always run `npm run lint` and `npm run type-check` before committing

## Build Configuration

- Vite development server runs on port 13348 (strict mode)
- Type checking is part of production build
- PWA configuration includes extensive caching for offline use
- Aliases: `@` maps to `src/` directory

## Agent Instructions

When working on this codebase:

1. Always check the technical documentation (`技术文档.md`) for architectural decisions
2. Follow the product requirements (`产品文档.md`) for feature implementation
3. Use TypeScript strict mode
4. Implement PWA features for offline capability
5. Keep UI minimalist and low-pressure (avoid warning colors)
6. Ensure core buttons are in mobile thumb zone (bottom 40% of screen)
7. Test intervention flow works completely offline
8. Run lint and typecheck commands before completing tasks
