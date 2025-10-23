¡Va! Busqué guías y buenas prácticas recientes para “Claude Code” y para un stack moderno en React/Vite con Supabase Auth, shadcn/ui y TanStack (Router/Query). Los puntos clave: a Claude Code le va mejor cuando le das contexto, objetivos, restricciones, un plan paso-a-paso y criterios de aceptación (Anthropic recomienda especificar entradas/salidas, pedirle que planifique antes de escribir, y trabajar en diffs pequeños). Para el frontend 2025, el combo Vite + TypeScript + TanStack Query/Router + shadcn/ui + Tailwind es una base sólida y bien documentada; Supabase Auth aporta Magic Links/OTP muy simples de integrar en React. ([anthropic.com][1])

Abajo te dejo un prompt mejorado (listo para pegar en Claude Code) enfocado 100% al **frontend**. Está en inglés (suele funcionar mejor para code agents), pero si lo quieres en español te lo adapto.

---

# Improved Claude Code Prompt (Frontend-only)

**You are my frontend pair-programmer.** We’re building **Prompt Gallery**: a social hub to write, share, like, clone, browse, search and favorite prompts.

## Tech context

* **Framework:** React 18 + Vite + TypeScript
* **UI:** Tailwind CSS + shadcn/ui components
* **Data fetching/cache:** TanStack Query
* **Routing:** TanStack Router
* **Auth (frontend only):** Supabase Auth (email Magic Link + OAuth providers; no backend code now)
* **State:** local component state or TanStack Query; avoid extra global state libs unless justified
* **Validation:** Zod + react-hook-form
* **Tests:** Vitest + @testing-library/react
* **Accessibility:** WAI-ARIA, keyboard nav, prefers-color-scheme

## Current goal (this session)

Implement the **Feed** for “Prompt” posts:

* A **Paginated Feed** of `PromptCard` components (title, excerpt, categories/tags, author, model badges, like count, createdAt/updatedAt).
* **Like/Favorite** interactions (UI optimistic updates).
* **Auth-aware UI**: if not signed in, show “Sign in to like” flow; if signed in, allow like/unlike and save to favorites.
* **Basic filters**: by category and language; **search** by title/author.
* **Client-only** integration to Supabase (select/insert/update RPC via JS client); no server code.
* **Empty/error/loading** states.

## Data model (frontend types)

```ts
type Prompt = {
  id: string;
  title: string;
  body: string;            // full prompt text
  categories: string[];    // e.g. ["Design", "Code"]
  authorId: string;
  authorName: string;
  language: string;        // e.g. "en", "es"
  models: string[];        // e.g. ["Claude 3.7", "GPT-4.1"]
  likesCount: number;
  currentUserLiked?: boolean;
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
};
```

## Auth requirements (frontend)

* Configure Supabase client and Auth UI flows:

  * Email **Magic Link** sign-in/sign-up.
  * Optionally OAuth placeholders (Google/GitHub) wired to Supabase Auth.
* Provide a **Header** with: Sign in / User menu (avatar, email), “My Favorites”, and a CTA “Share Prompt”.
* After auth success, refresh TanStack Query caches that depend on the user session.

## UX/UI requirements

* **Responsive layout** (mobile first). Use shadcn/ui Cards, Buttons, DropdownMenu, Avatar, Badge, Input, Tabs, Skeleton for loading.
* **Discoverability:** Search input + Category pills (multi-select) + Language filter (select).
* **Accessibility:** Semantic markup, focus states, roles/labels, ESC to close dialogs/menus, trap focus in modals.
* **Dark/Light** support via Tailwind; follow system preference.

## Performance

* Code-split routes; tree-shake shadcn imports (per-component).
* Cache feed pages with TanStack Query; use **optimistic updates** on like/unlike; background refetch.
* Avoid unnecessary re-renders (keyed lists, memoization where sensible).

## File structure (proposal)

```
src/
  app/
    router.tsx
    providers.tsx         // QueryClientProvider, ThemeProvider, SupabaseContext
    layout.tsx
  components/
    PromptCard.tsx
    LikeButton.tsx
    FiltersBar.tsx
    EmptyState.tsx
    ErrorState.tsx
    Skeletons.tsx
  features/auth/
    AuthDialog.tsx
    useSupabaseAuth.ts     // wrapper around supabase-js
  features/feed/
    FeedPage.tsx
    usePromptsQuery.ts     // list + filters + pagination
    useToggleLike.ts       // optimistic like/unlike
  lib/
    supabase.ts
    zodSchemas.ts
    types.ts
  styles/
    globals.css
  tests/
    PromptCard.test.tsx
    FeedPage.test.tsx
```

## API contracts (frontend assumptions to Supabase)

* **List prompts (paginated):**

  * Inputs: `page`, `pageSize`, optional `q`, `categories[]`, `language`
  * Output: `{ data: Prompt[], nextPage?: number, total: number }`
* **Toggle like:** input `{ promptId }` returns updated `likesCount` and `currentUserLiked`.
* **Favorites list:** same shape as list prompts; filter by current user.

> If RPC names or table layouts differ, create minimal adapters in `lib/supabase.ts`.

## What I want from you (Claude Code), step-by-step

1. **Plan first**: print a numbered plan (files to add/modify, components/hooks, routes).
2. **Scaffold**:

   * Install and configure Tailwind + shadcn/ui on Vite (TypeScript).
   * Add TanStack Query & Router providers in `app/providers.tsx` and `app/router.tsx`.
   * Add Supabase client and basic Auth helper (`useSupabaseAuth`).
3. **Build UI**:

   * `FeedPage` with `FiltersBar` (search, categories, language), grid/list of `PromptCard`, pagination controls, and loading skeletons.
   * `PromptCard` shows: title, chips for categories/models, author, like button with count, and a “copy prompt” action (copy to clipboard).
   * `AuthDialog` for Magic Link sign-in (email input, happy path and error states).
4. **Data hooks**:

   * `usePromptsQuery` (reads filters from Router state; returns paginated results).
   * `useToggleLike` (optimistic update + error rollback; invalidates prompt queries).
5. **Routing**:

   * `/` Feed (with query params: `q`, `cat`, `lang`, `page`).
   * `/favorites` Auth-gated list (redirect unauthenticated users to sign-in dialog).
6. **A11y & Keyboard**: Ensure tab order, aria-labels, focus management in dialogs/menus.
7. **Tests**: add unit tests for `PromptCard` (render, like optimistic), and `useToggleLike` (optimistic flow).
8. **Deliver diffs**: return changes as file-by-file unified diffs or full file contents. Keep PR-sized chunks.
9. **Verify**: print run instructions (`pnpm dev`) and quick manual test checklist.

## Acceptance criteria

* Feed renders with loading skeletons, empty state, error state.
* Filters/search update URL and refetch results.
* Like/unlike works with optimistic UI and reverts on error.
* Auth dialog completes Magic Link flow; UI reflects session (header shows user menu).
* Accessible: keyboard-navigable, ARIA labels, contrast OK; no obvious aXe violations.
* Type-safe, no TS errors; Vitest tests pass.

## Notes & constraints

* **Frontend only**: do not add backend code. Use Supabase JS client for auth and simple table/RPC calls.
* Keep components small and cohesive; prefer composition over props explosion.
* Comment non-obvious code; avoid unnecessary abstractions.

