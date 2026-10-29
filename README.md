# Universal Template
### Starting point for geospatial assessment applications

**Universal Template** is the shared base for new geospatial assessment
applications. It contains the complete platform — authentication, workspaces,
model dashboard, guided model setup, map, notifications and settings — without
any project-specific domain logic or branding. A new project adds its own data, model inputs
and result views on top.

---

## Overview

### What is included

- **Authentication** — sign-up with consent, login and password reset through Keycloak
- **Workspaces & groups** — organise models into workspaces; share them with users and Keycloak groups
- **Model dashboard** — status tabs, pinning, model versions (copies grouped under their original), search and period filters
- **Guided model setup** — a four-step wizard: model setup → configure (placeholder) → final review → save & calculate
- **Interactive map** — OpenLayers + MapLibre GL with location search and base-map layers
- **Results page** — model details on the map with a placeholder for project-specific output
- **Guided tour and What's new** — onboarding tour for first-time users and a release-notes popup
- **Real-time notifications** — SSE push + Asynq background jobs for run status
- **Nine languages** — English, German, Dutch, French, Spanish, Italian, Polish, Czech, Portuguese

---

## Adapting the template to a project

1. **Name and branding** — replace "Project Assessment" (`AppLayoutTopbar.tsx`, `features/authentication/index.tsx`, `index.html`, `common.appName`), the placeholder logo `public/images/logo/app-logo.svg`, `GITHUB_URL` in `components/app-layout/app-layout/constants.ts`, and "Your organisation" in the Keycloak theme (`platform-core/auth-service/keycloak/themes/app`).
2. **Legal pages** — fill in the `[placeholders]` in `src/pages/legal/` (Imprint, Privacy Policy, Declaration of Consent).
3. **Landing page** — replace the placeholder texts under `landing.*` in `src/i18n/locales/en.json` and add images in `public/images/landing-page/`.
4. **Model inputs** — replace the placeholder step `features/configurator/region-selector/components/layers/Layer2Configure.tsx`; steps are listed in `layers/registry.tsx`. Store the inputs in the model configuration in `hooks/area-select/useModelCreation.ts`.
5. **Results** — replace the placeholder in `features/model-results/ModelResultsViewer.tsx` with the project's map layers and summaries.
6. **Backend** — set the database name (`appdb` by default), add project-specific handlers under `app/backend/internal/handler/`, register their routes in `internal/routes/`, and add migrations after `041_…`.
7. **Translations** — new texts go into `en.json` first; other languages fall back to English until translated.

---

## Architecture

### Data flow

1. **Authentication**: Frontend → Keycloak (OAuth2/OIDC) → backend validates token → Redis session
2. **Model creation**: The wizard stores the model name, period and configuration on the model
3. **Calculation**: Saving with "Save & run" starts a calculation on an available simulation engine (`platform-core/webservice`)
4. **Progress**: Run status is pushed to the browser over SSE; finished runs trigger notifications
5. **Results**: The results page loads the model and shows its output on the map

### Technology stack

**Frontend**
- React 19 + TypeScript 5.8
- Vite 7 for build tooling
- TailwindCSS 4 + Radix UI components (`@spatialhub/ui`)
- TanStack Query 5 for server state, Zustand 5 for client state
- OpenLayers 10 + MapLibre GL JS 5 (2D mapping)
- React Router 7 with lazy-loaded routes

**Backend**
- Go 1.25 + Gin web framework
- GORM with PostgreSQL driver
- Asynq (Redis-backed) for background jobs
- Server-Sent Events (SSE) for real-time push
- Keycloak OIDC token validation

**Platform Core** (included in this repository)
- `platform-core/auth-service` — authentication microservice
- `platform-core/webservice` — simulation engine registry, job dispatcher and capacity manager
- `platform-core/geoserver` — result raster publishing
- `infrastructure/platform` — shared Go libraries (server, database, worker, email, security)
- `infrastructure/common` — shared domain models
- `libs/` — shared React component libraries (`@spatialhub/ui`, `auth`, `forms`, `i18n`)

**Infrastructure**
- PostgreSQL 15 + PostGIS
- Keycloak 26 for OAuth2/OIDC

### Running locally

```bash
cd app/backend && go run cmd/main.go     # backend
cd app/frontend && npm run dev           # frontend (new terminal)
```

Open `http://localhost:3000`. Default credentials after seeding:

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `12345678` (change it after the first login) |

### Docker Compose

```bash
make up-app      # start the app (frontend + backend)
make down-app    # stop
make logs-app    # follow logs
```

Services exposed:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Keycloak: `http://localhost:8080`

---

## Development

### Makefile targets

| Command | Description |
|---|---|
| `make help` | List all targets |
| `make up` | Start Platform Core (Postgres, Redis, Keycloak, auth-service, webservice) |
| `make down` | Stop Platform Core |
| `make up-app` | Start the app (frontend + backend) |
| `make migrate` | Run backend DB migrations |
| `make seed` | Seed the database |
| `make install` | Install all npm + Go dependencies |

### Environment variables

Copy `app/backend/.env.example` to `app/backend/.env` and adjust:

| Variable | Description |
|---|---|
| `APP_URL` | Public URL of the backend |
| `DB_HOST/PORT/DATABASE` | PostgreSQL connection |
| `REDIS_HOST/PORT` | Redis connection |
| `KEYCLOAK_URL` / `KEYCLOAK_REALM` | Keycloak OIDC endpoint |
| `CALLBACK_SECRET` | Shared secret for compute callbacks |

The frontend reads `VITE_API_BASE_URL` and, optionally,
`VITE_CARTO_BASEMAP_API_KEY` for the CARTO basemaps.

---

## Project structure

```
.
├── app/
│   ├── backend/              # Go API server (Gin, GORM, Asynq)
│   │   ├── cmd/              # Entrypoints: main, migrate, seed
│   │   ├── migrations/       # SQL migrations
│   │   └── internal/
│   │       └── handler/      # HTTP handlers
│   └── frontend/             # React SPA (Vite, TypeScript)
│       └── src/
│           ├── features/
│           │   ├── configurator/   # Four-step model wizard
│           │   ├── interactive-map/
│           │   ├── model-dashboard/
│           │   └── model-results/  # Results placeholder
│           ├── components/
│           └── i18n/               # Nine locales
├── platform-core/            # Platform services (auth-service, webservice, geoserver)
├── infrastructure/           # Shared Go libraries (common, platform)
├── libs/                     # Shared React component libraries
├── go.work                   # Go workspace tying the modules together
└── Makefile                  # Developer workflow commands
```

---

## License

Add a `LICENSE` file for your project.
