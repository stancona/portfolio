# Screenshot Capture Workflow

Step-by-step guide for capturing screenshots from the Stancona live applications.

---

## Prerequisites

- [ ] Live grimoire instance running locally (`pnpm dev`)
- [ ] Chrome/Edge browser with DevTools access
- [ ] ImageMagick installed (`brew install imagemagick`)
- [ ] Dummy data seeded in the local database

---

## Step 1: Prepare the Environment

### 1.1 Seed Dummy Data

Before capturing, ensure the database has TTRPG-themed demo data:

- Users: Artemis Starweaver, Shadow Elf, Flame Blade, Dark Master, Crystal Sage
- Events: Dark Cavern Adventure, Dragon Slayer Tournament, Mystic Forest Trail
- Products: Dark Dungeon Map, Dragon Figure Set, Player's Black Journal

### 1.2 Set Browser Configuration

Open Chrome DevTools (F12) and configure:

1. **Device Toolbar:** Toggle on (Cmd+Shift+M on Mac)
2. **Viewport:** 1440 x 900
3. **Device Pixel Ratio:** 2x (for retina quality)
4. **Theme:** Dark mode (match Stancona's default `dim` theme)

### 1.3 Navigate to Target Page

Open the application you want to capture:

- **Design System:** `http://localhost:4321/design/overview`
- **Keep PWA:** `http://localhost:3004`
- **Admin Panel:** `http://localhost:3000/dashboard`

---

## Step 2: Capture Screenshots

### 2.1 Full Page Screenshot

For pages with scrollable content:

1. Open DevTools Console
2. Run: `Cmd+Shift+P` → "Capture full size screenshot"
3. Save to `raw-screenshots/` folder

### 2.2 Specific Element Screenshot

For individual components:

1. Right-click the element → "Inspect"
2. In DevTools: `Cmd+Shift+P` → "Capture node screenshot"
3. Save to `raw-screenshots/` folder

### 2.3 Viewport Screenshot

For above-the-fold content:

1. Ensure the content is visible in the viewport
2. `Cmd+Shift+P` → "Capture screenshot"
3. Save to `raw-screenshots/` folder

---

## Step 3: Naming Convention

Use consistent naming:

```
screenshots/
├── en/
│   ├── design-system/
│   │   ├── 01-overview.png
│   │   ├── 02-colors-theme.png
│   │   ├── 03-typography.png
│   │   └── ...
│   ├── architecture/
│   │   ├── 01-three-tier.png
│   │   └── ...
│   └── ...
└── tr/
    └── ... (same structure, Turkish UI)
```

**Naming pattern:** `XX-descriptive-name.png`

- `XX` = two-digit sequence number
- Use lowercase kebab-case
- Be descriptive but concise

---

## Step 4: Bilingual Screenshots

For pages with visible text, capture in both languages:

1. **English:** Set app language to EN → capture
2. **Turkish:** Set app language to TR → capture
3. Save to respective `screenshots/en/` and `screenshots/tr/` folders

---

## Step 5: Process Images

Run the image processing script:

```bash
# Process raw screenshots into portfolio-ready assets
./scripts/process-images.sh raw-screenshots processed

# Output:
# processed/full/      → 2880x1800 (retina)
# processed/thumbnail/ → 720x450 (gallery grid)
# processed/og/        → 1200x630 (Open Graph)
```

---

## Step 6: Sanitize

Run the sanitize checklist before committing:

```bash
./scripts/sanitize-checklist.sh
```

Verify:

- [ ] No real user data visible
- [ ] No API keys or tokens
- [ ] No localhost URLs
- [ ] No email addresses with real domains
- [ ] All dummy data is TTRPG-themed

---

## Step 7: Commit

```bash
git add screenshots/ processed/
git commit -m "chore(portfolio): add design system screenshots EN/TR"
```

---

## Screenshot Checklist

### Design System (15-20 screenshots)

| #   | Page                   | Focus Area         | Notes                           |
| --- | ---------------------- | ------------------ | ------------------------------- |
| 1   | `/design/overview`     | Full page          | Hero + category cards           |
| 2   | `/design/colors-theme` | Theme palette      | Color swatches + theme switcher |
| 3   | `/design/typography`   | Font samples       | Full hierarchy                  |
| 4   | `/design/button`       | Button grid        | All size/color/style variants   |
| 5   | `/design/card`         | Card examples      | 3-4 card types                  |
| 6   | `/design/modal`        | Modal open state   | Dialog + backdrop               |
| 7   | `/design/navbar`       | Navbar             | Logo + menu + language switcher |
| 8   | `/design/alert`        | Alert examples     | Success/error/warning           |
| 9   | `/design/badge`        | Badge variants     | Color + size combos             |
| 10  | `/design/table`        | Table              | With dummy data                 |
| 11  | `/design/form`         | Form elements      | Input, select, checkbox, toggle |
| 12  | `/design/toast`        | Toast notification | Success/error                   |
| 13  | `/design/tooltip`      | Tooltip examples   | Different positions             |
| 14  | `/design/hero`         | Hero blocks        | CTA sections                    |
| 15  | `/design/accordion`    | Accordion          | Open/closed states              |

### Keep PWA (5-6 screenshots)

| #   | Page       | Focus Area               | Notes                |
| --- | ---------- | ------------------------ | -------------------- |
| 1   | Home       | Welcome + ticket summary | Dummy ticket cards   |
| 2   | Events     | Event list               | TTRPG events         |
| 3   | My Tickets | Ticket + QR code         | QR must be readable  |
| 4   | League     | Standings table          | Dummy scores         |
| 5   | Profile    | User profile             | TTRPG character info |
| 6   | Offline    | Service worker state     | "Offline" badge      |

### Admin Panel (4-5 screenshots)

| #   | Page            | Focus Area         | Notes              |
| --- | --------------- | ------------------ | ------------------ |
| 1   | Dashboard       | KPI cards + charts | Dummy statistics   |
| 2   | RBAC            | Role table         | 15 role list       |
| 3   | Module System   | Module registry    | Manifest structure |
| 4   | Command Palette | Cmd+K open         | Search + results   |
| 5   | Link Management | CRUD table         | Dummy links        |

### Architecture (4-5 diagrams)

| #   | Content                 | Tool    | Notes                       |
| --- | ----------------------- | ------- | --------------------------- |
| 1   | Three-tier architecture | Mermaid | Astro → Remix → PWA         |
| 2   | Monorepo structure      | Mermaid | apps/ + packages/           |
| 3   | Same-origin routing     | Mermaid | Family cookie flow          |
| 4   | Auth flow (L0-L3)       | Mermaid | OTP → Passkey               |
| 5   | Data flow               | Mermaid | Controller → Service → Repo |
