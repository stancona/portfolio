<div align="center">

# ⚔️ Stancona

**Full-Stack Web Ecosystem · TTRPG Platform**

[![Architecture](assets/banner.png)](https://stancona.org)

[![Stack](https://img.shields.io/badge/stack-Astro%20%7C%20Remix%20%7C%20Preact-6366f1?style=for-the-badge)](https://github.com/stancona/grimoire)
[![Components](https://img.shields.io/badge/components-85+-22c55e?style=for-the-badge)](https://stancona.org/design)
[![ADR](https://img.shields.io/badge/ADR-26-f97316?style=for-the-badge)](https://github.com/stancona/codex/tree/main/01-architecture/ADR)
[![License](https://img.shields.io/badge/license-MIT-eab308?style=for-the-badge)](https://github.com/stancona/portfolio/blob/main/LICENSE)

</div>

---

## Overview

Stancona is a full-stack web ecosystem built solo, designed for tabletop RPG (TTRPG) communities. It features a multi-surface architecture with 85+ design system components, a consumer PWA, and a modular admin panel.

> **Note:** This portfolio uses fictional TTRPG-themed data. No real customer information is displayed.

---

## Architecture

### Three-Tier Surface Architecture

```mermaid
graph TB
    subgraph "Apex — stancona.org"
        A1[Astro 7 + Preact Islands]
        A2[SEO / Content]
        A3[Blog / Changelog]
        A4[Shop / Studio]
        A5[Design System Showcase]
    end

    subgraph "Keep — keep.stancona.org"
        K1[Preact SPA + Vite]
        K2[Events]
        K3[Tickets + QR]
        K4[League]
        K5[PWA + Offline]
    end

    subgraph "App — app.stancona.org"
        R1[Remix 3]
        R2[Auth — OTP L0-L3]
        R3[API /api/v1/*]
        R4[Admin Panel — RBAC]
        R5[Module Registry]
    end

    subgraph "Shared Packages"
        P1["@stancona/ui — 85+ Components"]
        P2["@stancona/ui-style — Literal Class Maps"]
        P3["@stancona/db — Drizzle ORM"]
        P4["@stancona/i18n — TR/EN"]
        P5["@stancona/storage — R2/S3"]
        P6["@stancona/agents — LangGraph.js"]
        P7["@stancona/tailwind-config — Theme SSOT"]
    end

    subgraph "Infrastructure"
        I1[PostgreSQL 18]
        I2[Cloudflare R2]
        I3[Coolify PaaS]
        I4[Tailscale Mesh]
        I5[Cloudflare Tunnel]
    end

    A1 --> P1
    A1 --> P4
    A1 --> P7
    K1 --> P1
    K1 --> P4
    K1 --> P5
    R1 --> P3
    R1 --> P5
    R1 --> P6

    A1 -.->|Same-Origin| R3
    K1 -.->|Same-Origin| R3

    R3 --> I1
    P5 --> I2

    style A1 fill:#6366f1,stroke:#4f46e5,color:#fff
    style K1 fill:#22c55e,stroke:#16a34a,color:#fff
    style R1 fill:#f97316,stroke:#ea580c,color:#fff
    style P1 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style P3 fill:#06b6d4,stroke:#0891b2,color:#fff
```

### Monorepo Package Structure

```mermaid
graph TB
    subgraph "Monorepo Root"
        TR[Turborepo]
        PN[pnpm v10 Catalog]
    end

    subgraph "Apps"
        MAIN["apps/main — Astro 7<br/>stancona.org"]
        KEEP["apps/keep — Preact SPA<br/>keep.stancona.org"]
        APP["apps/app — Remix 3<br/>app.stancona.org"]
    end

    subgraph "Packages"
        UI["@stancona/ui<br/>85+ Preact Components"]
        UISTYLE["@stancona/ui-style<br/>Runtime-agnostic Style Data"]
        DB["@stancona/db<br/>Drizzle ORM Schemas"]
        I18N["@stancona/i18n<br/>TR/EN Dictionaries"]
        STORAGE["@stancona/storage<br/>Cloudflare R2"]
        AGENTS["@stancona/agents<br/>LangGraph.js"]
        TAILWIND["@stancona/tailwind-config<br/>Theme SSOT"]
        TSCONFIG["@stancona/tsconfig<br/>Shared Config"]
    end

    TR --> MAIN
    TR --> KEEP
    TR --> APP

    MAIN --> UI
    MAIN --> I18N
    MAIN --> TAILWIND

    KEEP --> UI
    KEEP --> I18N
    KEEP --> STORAGE

    APP --> DB
    APP --> STORAGE
    APP --> AGENTS

    UI --> UISTYLE
    UI --> TAILWIND

    style MAIN fill:#6366f1,stroke:#4f46e5,color:#fff
    style KEEP fill:#22c55e,stroke:#16a34a,color:#fff
    style APP fill:#f97316,stroke:#ea580c,color:#fff
    style UI fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style DB fill:#06b6d4,stroke:#0891b2,color:#fff
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Apex (Astro)
    participant K as Keep (Preact)
    participant App as App (Remix)
    participant DB as PostgreSQL

    Note over U,DB: Session Establishment
    U->>A: Visit stancona.org
    A->>A: Render static page (ISR/SSG)
    A-->>U: Response with session cookie

    Note over U,DB: Same-Origin API Call
    U->>K: Navigate to keep.stancona.org
    K->>App: API call (same-origin, family cookie)
    App->>App: Validate session (L0: email check)
    App->>DB: Query data
    DB-->>App: Result
    App-->>K: JSON response
    K-->>U: Render data

    Note over U,DB: Authenticated Flow
    U->>App: Login request (OTP)
    App->>App: Generate OTP → Email
    U->>App: Verify OTP
    App->>App: Upgrade to L1 session
    App-->>U: Set session cookie

    Note over U,DB: Admin Flow
    U->>App: Access /admin/*
    App->>App: Check RBAC (L2+ role required)
    App->>DB: Query with role context
    DB-->>App: Authorized data
    App-->>U: Admin interface
```

| Surface  | Domain            | Framework        | Purpose                     |
| -------- | ----------------- | ---------------- | --------------------------- |
| **Apex** | stancona.org      | Astro 7 + Preact | SEO, content, discovery     |
| **Keep** | keep.stancona.org | Preact SPA       | Events, tickets, QR, league |
| **App**  | app.stancona.org  | Remix 3          | Auth, API, admin panel      |

All surfaces share same-origin routing with a family cookie on `.stancona.org` — no CORS required.

---

## Design System

![Design System](screenshots/en/design-system/01-overview.png)

85+ production-ready Preact components with 74 interactive showcase pages. Built on daisyUI 5 + Tailwind CSS v4.

| Category         | Components | Examples                            |
| ---------------- | ---------- | ----------------------------------- |
| **Foundations**  | 5          | Colors, theme, typography, icons    |
| **Actions**      | 6          | Button, dropdown, FAB, modal        |
| **Data Display** | 18         | Table, card, badge, stat, timeline  |
| **Navigation**   | 9          | Navbar, breadcrumb, pagination, tab |
| **Feedback**     | 6          | Alert, toast, progress, skeleton    |
| **Data Input**   | 15         | Input, select, checkbox, toggle     |
| **Layout**       | 8          | Drawer, footer, hero, divider       |
| **Mockup**       | 3          | Browser, phone, window              |

![Button Variants](screenshots/en/design-system/06-button-variants.png)

![Card Examples](screenshots/en/design-system/10-card-examples.png)

---

## Keep — Consumer PWA

![Keep Home](screenshots/en/keep-pwa/01-home.png)

A mobile-first Progressive Web App for event discovery, ticket management with QR codes, and league standings. Full offline support via IndexedDB + Workbox.

| Feature            | Status                   |
| ------------------ | ------------------------ |
| Event discovery    | ✅                       |
| Ticket + QR code   | ✅                       |
| Offline storage    | ✅ (IndexedDB + Workbox) |
| League standings   | ✅                       |
| PWA install prompt | ✅                       |
| Capacitor mobile   | 🔄 Planned               |

![Tickets QR](screenshots/en/keep-pwa/03-tickets-qr.png)

---

## Admin Panel

![Dashboard](screenshots/en/admin-panel/01-dashboard.png)

Modular monolith backend with manifest-based module system and role-based access control.

| Feature             | Details                                 |
| ------------------- | --------------------------------------- |
| **RBAC**            | 15 role types, hierarchical permissions |
| **Module System**   | Manifest-driven, dynamic shell          |
| **Command Palette** | ⌘K quick access                         |
| **API**             | `/api/v1/*`, 2-tier rate limiting       |
| **Auth**            | Email OTP (L0-L3 account ladder)        |

![Admin Login](screenshots/en/admin-panel/02-login.png)

---

## Infrastructure

```mermaid
graph TB
    subgraph "Coolify PaaS"
        C[Coolify Dashboard]
    end

    subgraph "Applications"
        M[Main — stancona.org<br/>Astro 7]
        K[Keep — keep.stancona.org<br/>Preact SPA]
        A[App — app.stancona.org<br/>Remix 3]
    end

    subgraph "Reverse Proxy"
        T[Traefik<br/>SSL Termination]
    end

    subgraph "Database"
        PG[(PostgreSQL 18<br/>Coolify Managed)]
    end

    subgraph "Storage"
        R2[Cloudflare R2<br/>S3-compatible]
    end

    subgraph "Network"
        TS[Tailscale Mesh<br/>WireGuard VPN]
        CF[Cloudflare Tunnel<br/>HTTPS Access]
    end

    subgraph "Monitoring"
        UM[Umami<br/>Analytics]
        UK[Uptime Kuma<br/>Health Check]
    end

    subgraph "Backup"
        DUP[Duplicati<br/>→ Google Drive]
    end

    T --> M
    T --> K
    T --> A
    M --> PG
    A --> PG
    A --> R2
    C --> M
    C --> K
    C --> A
    TS --> C
    CF --> T
    M --> UM
    A --> UK
    PG --> DUP

    style C fill:#6366f1,stroke:#4f46e5,color:#fff
    style T fill:#22c55e,stroke:#16a34a,color:#fff
    style PG fill:#06b6d4,stroke:#0891b2,color:#fff
    style TS fill:#f97316,stroke:#ea580c,color:#fff
```

Self-hosted, cost-effective, secure infrastructure.

| Component      | Technology               | Purpose                 |
| -------------- | ------------------------ | ----------------------- |
| **PaaS**       | Coolify                  | Application management  |
| **Proxy**      | Traefik                  | SSL, routing            |
| **VPN**        | Tailscale                | Mesh networking, access |
| **Tunnel**     | Cloudflare Tunnel        | HTTPS access            |
| **Backup**     | Duplicati → Google Drive | Daily backups           |
| **Analytics**  | Umami                    | Privacy-first analytics |
| **Monitoring** | Uptime Kuma              | Service status          |

---

## AI Orchestration

```mermaid
graph TB
    subgraph "AI Orchestration Layer"
        LG[LangGraph.js<br/>State Graphs]
        LF[Langfuse<br/>Tracing & Observability]
        LL[LiteLLM<br/>Model Gateway]
    end

    subgraph "LLM Providers"
        O[OpenAI]
        AN[Anthropic]
        GO[Google]
        locally[Local Models]
    end

    subgraph "Job Queue"
        PG[pg-boss<br/>Background Workers]
        DB[(PostgreSQL)]
    end

    subgraph "Application Layer"
        APP[Remix App<br/>API Routes]
        AGENTS["@stancona/agents<br/>LangGraph Workflows"]
    end

    APP --> AGENTS
    AGENTS --> LG
    LG --> LF
    LG --> LL
    LL --> O
    LL --> AN
    LL --> GO
    LL --> locally
    PG --> DB
    AGENTS --> PG

    style LG fill:#6366f1,stroke:#4f46e5,color:#fff
    style LF fill:#22c55e,stroke:#16a34a,color:#fff
    style LL fill:#f97316,stroke:#ea580c,color:#fff
    style PG fill:#06b6d4,stroke:#0891b2,color:#fff
```

| Component        | Purpose                   |
| ---------------- | ------------------------- |
| **LangGraph.js** | State graph orchestration |
| **Langfuse**     | Tracing and observability |
| **LiteLLM**      | Model gateway (multi-LLM) |
| **pg-boss**      | Background job queue      |

---

## Data Flow

```mermaid
graph LR
    subgraph "Controller Layer"
        C1[Route Action]
        C2[Form Validation]
        C3[Response]
    end

    subgraph "Service Layer"
        S1[Business Logic]
        S2[Authorization]
        S3[Data Transformation]
    end

    subgraph "Repository Layer"
        R1[Drizzle Query]
        R2[SQL Builder]
        R3[Migration]
    end

    subgraph "Storage"
        DB[(PostgreSQL 18)]
        R2B[(Cloudflare R2)]
    end

    C1 --> S1
    C2 --> S2
    S1 --> R1
    S2 --> R1
    S3 --> R2B
    R1 --> DB
    R2 --> DB
    R3 --> DB

    style C1 fill:#f97316,stroke:#ea580c,color:#fff
    style S1 fill:#6366f1,stroke:#4f46e5,color:#fff
    style R1 fill:#22c55e,stroke:#16a34a,color:#fff
    style DB fill:#06b6d4,stroke:#0891b2,color:#fff
```

---

## Tech Stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| **Frontend**        | Astro 7, Remix 3, Preact 10, Vite 8 |
| **Styling**         | Tailwind CSS v4, daisyUI 5          |
| **Backend**         | Remix 3 (Node.js ≥24.3)             |
| **Database**        | PostgreSQL 18, Drizzle ORM          |
| **Storage**         | Cloudflare R2 (S3-compatible)       |
| **Package Manager** | pnpm v10 (catalog)                  |
| **Monorepo**        | Turborepo                           |
| **Linter**          | Biome                               |
| **Testing**         | Playwright (E2E), Vitest (unit)     |
| **CI/CD**           | GitHub Actions                      |
| **Infrastructure**  | Coolify, Traefik, Tailscale         |

---

## By the Numbers

| Metric                        | Value                    |
| ----------------------------- | ------------------------ |
| Components                    | 85+                      |
| Showcase pages                | 74                       |
| Architecture Decision Records | 26                       |
| Applications                  | 3 (Astro, Remix, Preact) |
| Packages                      | 8 (@stancona/*)          |
| Role types                    | 15                       |
| Languages                     | 2 (TR/EN)                |
| daisyUI themes                | 10+                      |

---

## Getting Started

```bash
# Clone the main application repo
git clone https://github.com/stancona/grimoire.git
cd grimoire

# Install dependencies
pnpm install

# Run all apps
pnpm dev

# Run individual apps
pnpm dev:main     # stancona.org
pnpm dev:keep     # keep.stancona.org
pnpm dev:app      # app.stancona.org

# Run tests
pnpm test         # Unit tests
pnpm e2e          # Playwright E2E
pnpm typecheck    # TypeScript check
pnpm lint         # Biome lint
```

---

## Portfolio Structure

```
portfolio/
├── assets/              # Banners, social media images
├── screenshots/
│   ├── en/              # English screenshots
│   └── tr/              # Turkish screenshots
├── diagrams/            # Mermaid architecture diagrams
├── fixtures/            # TTRPG-themed demo data
├── scripts/             # Image processing scripts
└── docs/                # Showcase guides
```

---

## License

MIT License © 2026 Stancona

---

<div align="center">

**[stancona.org](https://stancona.org) · [GitHub](https://github.com/stancona) · [LinkedIn](https://linkedin.com/in/emin)**

</div>
