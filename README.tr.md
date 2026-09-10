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
    U(("🌍 User")) --> T["Traefik + Cloudflare Tunnel"]
    T --> A["Apex<br/>stancona.org<br/>Astro 7 + Preact"]
    T --> K["Keep<br/>keep.stancona.org<br/>Preact SPA"]
    T --> R["App<br/>app.stancona.org<br/>Remix 3"]
    A --> PKG["@stancona/*<br/>ui · db · i18n · storage · agents"]
    K --> PKG
    R --> PKG
    R --> DB[("PostgreSQL 18")]
    R --> S[("Cloudflare R2")]

    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style K fill:#22c55e,stroke:#16a34a,color:#fff
    style R fill:#f97316,stroke:#ea580c,color:#fff
    style PKG fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style DB fill:#06b6d4,stroke:#0891b2,color:#fff
```

### Monorepo Paket Yapısı

```mermaid
graph TB
    TR["Turborepo · pnpm v10 Catalog"] --> MAIN["apps/main<br/>Astro 7"]
    TR --> KEEP["apps/keep<br/>Preact SPA"]
    TR --> APP["apps/app<br/>Remix 3"]
    MAIN --> PKG["packages/ — 8 packages<br/>ui · ui-style · db · i18n<br/>storage · agents · tailwind-config · tsconfig"]
    KEEP --> PKG
    APP --> PKG

    style MAIN fill:#6366f1,stroke:#4f46e5,color:#fff
    style KEEP fill:#22c55e,stroke:#16a34a,color:#fff
    style APP fill:#f97316,stroke:#ea580c,color:#fff
    style PKG fill:#8b5cf6,stroke:#7c3aed,color:#fff
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

![Design System](screenshots/tr/design-system/01-overview.png)

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

![Button Variants](screenshots/tr/design-system/06-button-variants.png)

![Card Examples](screenshots/tr/design-system/10-card-examples.png)

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

![Dashboard](screenshots/tr/admin-panel/01-dashboard.png)

Manifest tabanlı modül sistemi ve rol tabanlı erişim kontrolüne sahip modüler monolit backend.

| Özellik           | Detaylar                           |
| ----------------- | ---------------------------------- |
| **RBAC**          | 15 rol tipi, hiyerarşik yetkiler   |
| **Modül Sistemi** | Manifest tabanlı, dinamik shell    |
| **Komut Paleti**  | ⌘K hızlı erişim                    |
| **API**           | `/api/v1/*`, 2 katmanlı rate limit |
| **Auth**          | Email OTP (L0-L3 hesap merdiveni)  |

![RBAC Roles](screenshots/tr/admin-panel/02-login.png)

---

## Altyapı

```mermaid
graph TB
    CF["Cloudflare Tunnel<br/>HTTPS Access"] --> T["Traefik — SSL Termination"]
    T --> M["Main<br/>Astro 7"]
    T --> K["Keep<br/>Preact SPA"]
    T --> A["App<br/>Remix 3"]
    M --> PG[("PostgreSQL 18")]
    A --> PG
    A --> R2[("Cloudflare R2")]
    PG --> DUP["Duplicati → Google Drive"]
    T --> OPS["Coolify · Umami · Uptime Kuma"]

    style T fill:#22c55e,stroke:#16a34a,color:#fff
    style PG fill:#06b6d4,stroke:#0891b2,color:#fff
    style CF fill:#f97316,stroke:#ea580c,color:#fff
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
    APP["Remix App — API Routes"] --> AG["@stancona/agents"]
    AG --> LG["LangGraph.js — State Graphs"]
    AG --> LF["Langfuse — Tracing"]
    AG --> QB["pg-boss — Job Queue"]
    QB --> DB[("PostgreSQL")]
    LG --> LL["LiteLLM — Model Gateway"]
    LL --> P["OpenAI · Anthropic · Google · Local"]

    style LG fill:#6366f1,stroke:#4f46e5,color:#fff
    style LF fill:#22c55e,stroke:#16a34a,color:#fff
    style LL fill:#f97316,stroke:#ea580c,color:#fff
    style DB fill:#06b6d4,stroke:#0891b2,color:#fff
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
graph TB
    C["Controller<br/>route action · validation · response"] --> S["Service<br/>business logic · authorization · transform"]
    S --> R["Repository<br/>Drizzle ORM · query builder · migrations"]
    R --> DB[("PostgreSQL 18")]
    S --> R2[("Cloudflare R2")]

    style C fill:#f97316,stroke:#ea580c,color:#fff
    style S fill:#6366f1,stroke:#4f46e5,color:#fff
    style R fill:#22c55e,stroke:#16a34a,color:#fff
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
