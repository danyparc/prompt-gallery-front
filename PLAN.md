¡Perfecto, Daniel! Ajusté el prompt para Claude Code con un stack **sencillo para principiantes** y una **UI deslumbrante**:

* **JavaScript vainilla (sin TS)** sobre **Vite + React**. ([vitejs][1])
* **React Router** para navegación. ([reactrouter.com][2])
* **Context API** para estado global simple (auth, likes, filtros). ([react.dev][3])
* **Tailwind CSS + daisyUI** para acelerar una interfaz flashy con pocos estilos manuales. ([v3.tailwindcss.com][4])
* **Supabase Auth** con Magic Link/OTP **solo desde el frontend**. ([Supabase][5])

---

# Claude Code Prompt (Frontend-only, beginner-friendly)

**Role:** You are my frontend pair-programmer for a hackathon. Keep code simple, readable, and beginner-friendly. Use **JavaScript (no TypeScript)**.

## Project: Prompt Gallery

A social hub to write, share, like, clone, browse, search and favorite prompts.

## Tech constraints (do not change)

* **Build:** Vite + React (JavaScript)
* **Routing:** React Router
* **State management:** React **Context** + local component state (no external state libs)
* **UI:** Tailwind CSS + **daisyUI** components (no heavy design system)
* **Auth:** Supabase Auth (Magic Link/OTP) – **frontend only**
* No tests, no accessibility work beyond defaults, no unnecessary abstractions.

## Today’s scope (frontend only)

Build the **Feed** listing “Prompt” posts and basic interactions.

### Screens / Routes

* `/` → **Feed** (list of `PromptCard`s with pagination)
* `/favorites` → user’s favorites (redirect unauthenticated users to sign-in dialog)
* Modal/Dialog for **Sign in** (email Magic Link)

### Components (keep them small)

* `Header` (brand, search box, category pills, user avatar / sign-in button)
* `PromptCard` (title, short excerpt, categories/tags, models, author, like count, “copy prompt” action)
* `LikeButton` (toggles like; optimistic UI)
* `AuthDialog` (email input → Supabase Magic Link)
* `EmptyState`, `ErrorState`, `LoadingSkeleton`

### App state (Context)

Create two contexts:

1. **AuthContext**: `{ user, loading, signInWithEmail, signOut }`
2. **FeedContext**: `{ filters: { q, category, language }, page, setFilters, setPage, likes: Map<promptId, boolean>, toggleLike(id) }`

> Use `useState` in providers and update context via setters. Likes should optimistically update the UI, then sync with Supabase; on error, revert.

### Data model (frontend types as JS JSDoc)

```js
/** @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string[]} categories
 * @property {string} authorName
 * @property {string} language
 * @property {string[]} models
 * @property {number} likesCount
 * @property {boolean=} currentUserLiked
 * @property {string} createdAt
 * @property {string} updatedAt
 */
```

### Supabase (frontend)

* `lib/supabase.js`: export a configured `supabase` client.
* **Auth**: `supabase.auth.signInWithOtp({ email })` (Magic Link). On success, close dialog and refresh UI state.
* **Queries** (assume tables/APIs exist):

  * `listPrompts({ q, category, language, page, pageSize })` → `{ data, total }`
  * `toggleLike({ promptId })` → returns updated `{ likesCount, currentUserLiked }`
    *(If RPC names differ, add light adapters. Keep calls in a single `lib/api.js` file.)*

### Styling / UI polish

* Tailwind + daisyUI themes; default to `data-theme="dark"` for a striking look.
* Use daisyUI `card`, `badge`, `button`, `navbar`, `avatar`, `input`, `modal`, `skeleton`, `pagination` patterns.
* Micro-interactions: hover/focus/active states, subtle transitions.
* Mobile-first; simple responsive grid for cards (1col → 2/3cols on larger screens).

### File structure (beginner-friendly)

```
src/
  main.jsx
  App.jsx
  routes/
    Feed.jsx
    Favorites.jsx
  components/
    Header.jsx
    PromptCard.jsx
    LikeButton.jsx
    AuthDialog.jsx
    EmptyState.jsx
    ErrorState.jsx
    LoadingSkeleton.jsx
  context/
    AuthContext.jsx
    FeedContext.jsx
  lib/
    supabase.js
    api.js
  styles/
    index.css
```

### What to produce (step-by-step)

1. **Plan first**: print a numbered checklist of files to add/change.
2. **Scaffold**:

   * Add React Router to `main.jsx` and simple routes.
   * Add **AuthContext** and **FeedContext** providers wrapping `<App />`.
   * Configure Tailwind + daisyUI and a dark theme in `index.css`.
3. **Build UI**:

   * `Header` with brand, search input (updates `FeedContext.filters.q`), category chips, sign-in button/user menu.
   * `Feed` rendering skeletons → cards → empty/error states; simple “Previous / Next” pagination.
   * `PromptCard` with badges (categories/models), like button with count, copy-to-clipboard button.
   * `AuthDialog` with email field → `signInWithEmail` (Magic Link).
4. **Data hooks (inside `api.js`)**:

   * `listPrompts` to fetch paginated data from Supabase (client-side).
   * `toggleLike` to like/unlike. **Do optimistic UI**: update context immediately, then call API; on failure, revert and show a toast.
5. **Wire contexts**:

   * `AuthContext`: subscribe to Supabase auth state changes; store `user`.
   * `FeedContext`: store filters/page/likes; expose setters and `toggleLike`.
6. **Polish**: add subtle transitions, skeletons, and daisyUI components for a “wow” factor without complexity.
7. **Output**: return full file contents or unified diffs in small, copy-pasteable chunks; include minimal run steps (`npm i`, `npm run dev`).

### Acceptance criteria

* Feed shows loading → cards; supports search and basic filters.
* Like/unlike feels instant (optimistic) and persists when API succeeds.
* Unauthenticated users see a **Sign in** dialog when trying to like/favorite.
* Minimal code, plain JS, easy to read; no TypeScript or external state libs.

### Notes & constraints

* Keep everything **beginner-friendly**; prefer simple components and Context over advanced patterns.
* No tests, no a11y audits, no complex error boundaries—just friendly messages.
* Keep UI snappy and attractive using Tailwind + daisyUI only.

