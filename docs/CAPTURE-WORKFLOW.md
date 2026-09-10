# Screenshot Capture Workflow

How portfolio screenshots are produced — locally and in CI. Everything is
scripted: manual DevTools captures are not used.

---

## Pipeline

```
grimoire dev servers (:4321 Astro, :3004 Keep, :3000 App)
        │
        ▼
scripts/prepare-capture-db.mjs  → demo data guard + showcase session
        │                           (SHOWCASE_SESSION cookie + SHOWCASE_TOKEN bearer)
        ▼
scripts/capture-design.js  →  Astro design system (shots.config.js)
scripts/capture-apps.js    →  Keep PWA + admin panel + homepage
        │
        ▼
raw-screenshots/  (+ raw-screenshots-tr/ for LOCALE=tr)
        │
        ▼
screenshots/en/  +  screenshots/tr/
```

`shots.config.js` is the single source of truth for the shot list. CI
(`.github/workflows/regenerate-screenshots.yml`) runs the same scripts after
every grimoire `dev` merge, so any curation done in scripts survives
regeneration.

---

## Prerequisites

- Grimoire dev servers running (`apps/main`, `apps/keep`, `apps/app`)
- `npm install` in this repo (Playwright + `postgres` driver)
- Playwright Chromium: `npx playwright install chromium`
- Env: `DATABASE_URL`, `SESSION_SECRET` (from `grimoire/.env`),
  `GRIMOIRE_APP_DIR` (path to `grimoire/apps/app`)

---

## Local run

```bash
# 1. Seed-guard demo data + mint showcase session (additive only,
#    never truncates — safe against the local dev database)
export GRIMOIRE_APP_DIR=/path/to/grimoire/apps/app
set -a; source /path/to/grimoire/.env; set +a
OUT=$(node scripts/prepare-capture-db.mjs)
export SHOWCASE_SESSION=$(echo "$OUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionCookie'])")
export SHOWCASE_TOKEN=$(echo "$OUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionToken'])")

# 2. Capture EN set
node scripts/capture-design.js
node scripts/capture-apps.js

# 3. Capture TR set (Astro TR lives at root paths, no /tr/ prefix)
LOCALE=tr OUTDIR=raw-screenshots-tr node scripts/capture-design.js
LOCALE=tr OUTDIR=raw-screenshots-tr SKIP_KEEP=1 node scripts/capture-apps.js

# 4. Copy into place
cp raw-screenshots/design-system/*.png screenshots/en/design-system/
cp raw-screenshots/keep-pwa/*.png screenshots/en/keep-pwa/
cp raw-screenshots/admin-panel/*.png screenshots/en/admin-panel/
cp raw-screenshots-tr/design-system/*.png screenshots/tr/design-system/
cp raw-screenshots-tr/admin-panel/*.png screenshots/tr/admin-panel/

# 5. Sanitize + commit
bash scripts/sanitize-checklist.sh
```

---

## Guarantees (verified per shot before commit)

- **No Astro dev toolbar:** capture scripts remove `<astro-dev-toolbar>` from
  the DOM and assert its absence — a present toolbar throws and fails the run
  (locally and in CI) instead of committing polluted shots.
- **Language purity:** `en/` = English UI, `tr/` = Turkish UI. Known
  exceptions live in grimoire source (showcase code samples, email
  placeholders) and are tracked as a fix list, not worked around here.
- **Authenticated surfaces:** the admin dashboard (`/dashboard`) and Keep
  tickets/profile/league render behind a minted showcase session —
  no login walls, no 404s, no empty states in committed shots.

---

## Environment quirks (documented, not fought)

- **Keep API proxy:** Keep's Vite proxy targets `app.stancona.localhost`
  (port 80, dead in capture envs). Capture scripts reroute `**/api/**`
  to `localhost:3000` via Playwright `route.fetch` + `fulfill` (CORS-safe).
- **Keep scroll-reveal:** `[data-reveal]` cards stay invisible until
  scrolled into view. Captures force `.is-visible` and disable transitions.
- **Keep is Turkish-only:** hardcoded TR strings + `"lang": "tr"` manifest.
  Keep shots live under `en/keep-pwa/` with a README note until grimoire
  ships Keep i18n.
- **Astro TR at root:** `/design`, `/` (no `/tr/` prefix); EN at `/en/*`.
- **Never run `db:seed` locally:** it truncates users/events/tickets.
  `prepare-capture-db.mjs` is additive-only by design.
