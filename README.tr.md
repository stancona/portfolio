<div align="center">

# ⚔️ Stancona

**Full-Stack Web Ekosistemi · TTRPG Platformu**

[![Architecture](assets/banner-tr.png)](https://stancona.org)

[![Stack](https://img.shields.io/badge/stack-Astro%20%7C%20Remix%20%7C%20Preact-6366f1?style=for-the-badge)](https://github.com/stancona/grimoire)
[![Components](https://img.shields.io/badge/components-85+-22c55e?style=for-the-badge)](https://stancona.org/design)
[![ADR](https://img.shields.io/badge/ADR-26-f97316?style=for-the-badge)](https://github.com/stancona/codex/tree/main/01-architecture/ADR)
[![License](https://img.shields.io/badge/license-MIT-eab308?style=for-the-badge)](https://github.com/stancona/portfolio/blob/main/LICENSE)

</div>

---

## Genel Bakış

Stancona, tek kişilik geliştirme ekibiyle oluşturulmuş, masa üstü rol yapma oyunları (TTRPG) toplulukları için tasarlanmış full-stack web ekosistemi. 85+ tasarım sistemi bileşeni, tüketici PWA'ı ve modüler admin paneli içeren çoklu yüzey mimarisine sahiptir.

> **Not:** Bu portföy kurgusal TTRPG temalı veriler kullanmaktadır. Gerçek müşteri bilgisi gösterilmemektedir.

---

## Mimari

### Üç Katmanlı Yüzey Mimarisi

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

### Monorepo Paket Yapısı

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

### Kimlik Doğrulama Akışı

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

| Yüzey        | Alan Adı          | Framework        | Amaç                           |
| ------------ | ----------------- | ---------------- | ------------------------------ |
| **Vitrin**   | stancona.org      | Astro 7 + Preact | SEO, içerik, keşfetme          |
| **Tüketici** | keep.stancona.org | Preact SPA       | Etkinlikler, biletler, QR, lig |
| **Yönetim**  | app.stancona.org  | Remix 3          | Auth, API, admin paneli        |

Tüm yüzeyler `.stancona.org` üzerinde aile cookie'si ile same-origin routing kullanır — CORS gerekmez.

---

## Tasarım Sistemi

![Design System](screenshots/en/design-system/01-overview.png)

daisyUI 5 + Tailwind CSS v4 üzerine inşa edilmiş 85+ üretim hazırı Preact bileşeni ve 74 interaktif showcase sayfası.

| Kategori           | Bileşenler | Örnekler                                        |
| ------------------ | ---------- | ----------------------------------------------- |
| **Temeller**       | 5          | Renkler, tema, tipografi, ikonlar               |
| **Aksiyonlar**     | 6          | Buton, dropdown, FAB, modal                     |
| **Veri Gösterimi** | 18         | Tablo, kart, rozet, istatistik, zaman çizelgesi |
| **Gezinme**        | 9          | Navbar, breadcrumb, sayfalama, sekme            |
| **Geri Bildirim**  | 6          | Alert, toast, progress, iskelet                 |
| **Veri Girişi**    | 15         | Input, select, checkbox, toggle                 |
| **Yerleşim**       | 8          | Drawer, footer, hero, ayırıcı                   |
| **Mockup**         | 3          | Tarayıcı, telefon, pencere                      |

![Button Variants](screenshots/en/design-system/06-button-variants.png)

![Card Examples](screenshots/en/design-system/10-card-examples.png)

---

## Keep — Tüketici PWA

![Keep Home](screenshots/en/keep-pwa/01-home.png)

Etkinlik keşfi, QR kodlu bilet yönetimi ve lig sıralamaları için mobil öncelikli Progressive Web App. IndexedDB + Workbox ile tam çevrimdışı destek.

| Özellik             | Durum                    |
| ------------------- | ------------------------ |
| Etkinlik keşfetme   | ✅                       |
| Bilet + QR kod      | ✅                       |
| Çevrimdışı depolama | ✅ (IndexedDB + Workbox) |
| Lig sıralaması      | ✅                       |
| PWA kurulum istemi  | ✅                       |
| Capacitor mobil     | 🔄 Planlanıyor           |

![Tickets QR](screenshots/en/keep-pwa/03-tickets-qr.png)

---

## Admin Paneli

![Dashboard](screenshots/en/admin-panel/01-dashboard.png)

Manifest tabanlı modül sistemi ve rol tabanlı erişim kontrolüne sahip modüler monolit backend.

| Özellik           | Detaylar                           |
| ----------------- | ---------------------------------- |
| **RBAC**          | 15 rol tipi, hiyerarşik yetkiler   |
| **Modül Sistemi** | Manifest tabanlı, dinamik shell    |
| **Komut Paleti**  | ⌘K hızlı erişim                    |
| **API**           | `/api/v1/*`, 2 katmanlı rate limit |
| **Auth**          | Email OTP (L0-L3 hesap merdiveni)  |

![RBAC Roles](screenshots/en/admin-panel/02-login.png)

---

## Altyapı

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

Self-hosted, maliyet-etkin, güvenli altyapı.

| Bileşen       | Teknoloji                | Amaç                        |
| ------------- | ------------------------ | --------------------------- |
| **PaaS**      | Coolify                  | Uygulama yönetimi           |
| **Proxy**     | Traefik                  | SSL, yönlendirme            |
| **VPN**       | Tailscale                | Mesh ağ, erişim             |
| **Tünel**     | Cloudflare Tunnel        | HTTPS erişimi               |
| **Yedekleme** | Duplicati → Google Drive | Günlük yedekleme            |
| **Analitik**  | Umami                    | Gizlilik öncelikli analitik |
| **İzleme**    | Uptime Kuma              | Servis durumu               |

---

## AI Orkestrasyon

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

| Bileşen          | Amaç                      |
| ---------------- | ------------------------- |
| **LangGraph.js** | State graph orkestrasyonu |
| **Langfuse**     | Tracing ve observability  |
| **LiteLLM**      | Model gateway (çoklu LLM) |
| **pg-boss**      | Background job kuyruğu    |

---

## Veri Akışı

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

## Teknoloji Yığını

| Katman               | Teknoloji                           |
| -------------------- | ----------------------------------- |
| **Frontend**         | Astro 7, Remix 3, Preact 10, Vite 8 |
| **Stil**             | Tailwind CSS v4, daisyUI 5          |
| **Backend**          | Remix 3 (Node.js ≥24.3)             |
| **Veritabanı**       | PostgreSQL 18, Drizzle ORM          |
| **Depolama**         | Cloudflare R2 (S3 uyumlu)           |
| **Paket Yöneticisi** | pnpm v10 (catalog)                  |
| **Monorepo**         | Turborepo                           |
| **Linter**           | Biome                               |
| **Test**             | Playwright (E2E), Vitest (unit)     |
| **CI/CD**            | GitHub Actions                      |
| **Altyapı**          | Coolify, Traefik, Tailscale         |

---

## Rakamlarla Stancona

| Metrik             | Değer                    |
| ------------------ | ------------------------ |
| Bileşen sayısı     | 85+                      |
| Showcase sayfası   | 74                       |
| Mimari Karar Kaydı | 26                       |
| Uygulama           | 3 (Astro, Remix, Preact) |
| Paket              | 8 (@stancona/*)          |
| Rol tipi           | 15                       |
| Dil desteği        | 2 (TR/EN)                |
| daisyUI temaları   | 10+                      |

---

## Nasıl Başlanır

```bash
# Ana uygulama reposunu klonla
git clone https://github.com/stancona/grimoire.git
cd grimoire

# Bağımlılıkları kur
pnpm install

# Tüm uygulamaları çalıştır
pnpm dev

# Tek tek uygulamaları çalıştır
pnpm dev:main     # stancona.org
pnpm dev:keep     # keep.stancona.org
pnpm dev:app      # app.stancona.org

# Testleri çalıştır
pnpm test         # Unit testler
pnpm e2e          # Playwright E2E
pnpm typecheck    # TypeScript kontrolü
pnpm lint         # Biome lint
```

---

## Portföy Yapısı

```
portfolio/
├── assets/              # Banner'lar, sosyal medya görselleri
├── screenshots/
│   ├── en/              # İngilizce screenshot'lar
│   └── tr/              # Türkçe screenshot'lar
├── diagrams/            # Mimari diyagramlar (Mermaid)
├── fixtures/            # TTRPG temalı demo verileri
├── scripts/             # Görsel işleme scriptleri
└── docs/                # Showcase rehberleri
```

---

## Lisans

MIT License © 2026 Stancona

---

<div align="center">

**[stancona.org](https://stancona.org) · [GitHub](https://github.com/stancona) · [LinkedIn](https://linkedin.com/in/emin)**

</div>
