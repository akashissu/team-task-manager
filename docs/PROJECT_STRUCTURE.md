# Repository structure

The project uses two top-level folders: **`backend`** (REST API + MongoDB) and **`frontend`** (Vite + React). The repo root holds shared **glue** (`Dockerfile`, root `package.json`, `docs/`).

```
Team Task Manager/
├── backend/                 # NPM package — Express API
├── frontend/               # NPM package — SPA
├── docs/
├── Dockerfile
└── package.json
```

---

## `backend/` (Express + MongoDB)

| Path | Role |
|------|------|
| `package.json` | Dependencies; `dev` / `start` → `src/server.js`. |
| `.env.example` | Copy to `.env`: `MONGODB_URI`, `JWT_SECRET`, optional `CLIENT_URL`, `PORT`. |
| `src/server.js` | **Entry**: connect DB → `createApp()` → listen. |
| `src/app/create-app.js` | Express setup, `/api/*` routes, **`frontend/dist`** static + SPA fallback in production. |
| `src/config/database.js` | Mongoose connection. |
| `src/lib/` | Small shared helpers (JWT). |
| `src/middleware/` | `*.middleware.js` — auth, project membership. |
| `src/database/models/` | Mongoose `*.model.js` only. |
| `src/modules/*/` | Feature slices: routes + controllers (`auth`, `dashboard`, `projects`, tasks). |

**Production static**: from `backend/src/app/create-app.js`, path is `../../../frontend/dist` (up to repo root → `frontend/dist`).

---

## `frontend/` (Vite + React)

| Path | Role |
|------|------|
| `vite.config.js` | Proxy `/api` → `localhost:4000`; alias `@` → `src`. |
| `jsconfig.json` | Editor path mapping for `@/*`. |
| `index.html` | Entry script: `src/app/main.jsx`. |
| `src/app/` | `main.jsx`, `App.jsx` (routing). |
| `src/layouts/` | Authenticated shell + auth layouts. |
| `src/pages/` | Route screens (`auth/`, `dashboard/`, `projects/`). |
| `src/providers/` | `AuthProvider` + `useAuth`. |
| `src/shared/api/http-client.js` | REST client. |
| `src/shared/components/ui/` | Reusable UI bits. |
| `src/styles/global.css` | Global styles. |
| `dist/` | Build output (gitignored); read by backend in prod. |

**Imports**: `@/foo` resolves to `frontend/src/foo`.

---

## Root scripts (`package.json`)

- `npm run setup` — `npm install` in `backend` and `frontend`
- `npm run build` — Vite production build in `frontend`
- `npm start` — run `backend/src/server.js` with `NODE_ENV=production`

---

## Docker

`Dockerfile` copies **`backend`** and **`frontend`**, builds the SPA, runs **`node backend/src/server.js`**.

`.dockerignore` excludes **`frontend/dist`** so the image always bundles a fresh build.
