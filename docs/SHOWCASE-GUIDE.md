# Showcase Guide

How to use the Stancona portfolio for different platforms.

---

## GitHub Profile README

Add to your GitHub profile README:

```markdown
## ⚔️ Stancona — Full-Stack Web Ecosystem

[![Architecture](https://raw.githubusercontent.com/stancona/portfolio/main/assets/banner.png)](https://stancona.org)

Full-stack TTRPG platform with 85+ components, multi-surface architecture (Astro + Remix + Preact), and self-hosted infrastructure.

[**View Portfolio →**](https://github.com/stancona/portfolio)
```

---

## GitHub Repository Social Preview

Upload `assets/social/github-preview.png` to repo Settings → General → Social preview.

Recommended: 1280×640px, shows architecture diagram + tech stack badges.

---

## LinkedIn Featured Section

1. Go to LinkedIn profile → Featured → +
2. Select "Add a link"
3. Enter: `https://github.com/stancona/portfolio`
4. Upload `assets/social/linkedin-banner.png` as thumbnail (1584x396 recommended)

### LinkedIn Post Template

```
⚔️ Stancona — Full-Stack Web Ecosystem

Built solo from scratch. Here's what's inside:

🎨 85+ design system components (daisyUI 5 + Tailwind v4)
📱 3 surfaces: Astro 7 + Remix 3 + Preact PWA
🛡️ RBAC with 15 role types
🤖 AI orchestration (LangGraph.js + Langfuse)
🏠 Self-hosted on Coolify + Tailscale

Tech: TypeScript, PostgreSQL 18, Drizzle ORM, Cloudflare R2

All decisions documented in 26 ADRs.

#webdevelopment #fullstack #ttrpg #portfolio
```

---

## Freelancer Applications

### Portfolio Attachment (PDF deck for private presentations)

Best quality, zero tooling — GitHub renders Mermaid natively:

1. Open `https://github.com/stancona/portfolio` in Chrome
2. `File → Print → Destination: Save as PDF`
3. Margins: Default, Background graphics: on

Alternative (requires install): `brew install pandoc basictex` then
`pandoc README.md -o stancona-portfolio.pdf --pdf-engine=xelatex`
(note: Mermaid blocks render as code, not diagrams, in pandoc output).

### Email Template

```
Subject: Stancona — Full-Stack Web Ecosystem Portfolio

Hi [Name],

I'd like to share my portfolio project: Stancona.

It's a full-stack web ecosystem for TTRPG communities, built solo with:
- 85+ production-ready design system components
- Multi-surface architecture (Astro + Remix + Preact)
- Self-hosted infrastructure (Coolify + Tailscale)
- AI orchestration layer (LangGraph.js)

Portfolio: https://github.com/stancona/portfolio
Live Demo: https://stancona.org

Best regards,
Emin
```

---

## Twitter/X Card

Upload `assets/social/twitter-card.png` (1200x628).

### Tweet Template

```
⚔️ Stancona — Full-stack web ecosystem built solo

🎨 85+ components
📱 3 surfaces (Astro + Remix + Preact)
🛡️ RBAC, AI orchestration, self-hosted

All architecture decisions in 26 ADRs.

#buildinpublic #webdev #ttrpg
```

---

## Personal Website

Embed the banner and key screenshots:

```html
<section class="portfolio">
  <img src="assets/banner.png" alt="Stancona Architecture" />
  <h3>Full-Stack Web Ecosystem</h3>
  <p>85+ components · 3 surfaces · Self-hosted</p>
  <a href="https://github.com/stancona/portfolio">View Portfolio</a>
</section>
```

---

## Screenshot Sizes Reference

| Platform              | Size               | File                                |
| --------------------- | ------------------ | ----------------------------------- |
| GitHub README         | Full width, retina | `screenshots/en/*/XX-name.png`      |
| GitHub Social Preview | 1280×640           | `assets/social/github-preview.png`  |
| LinkedIn Featured     | 1584×396           | `assets/social/linkedin-banner.png` |
| Twitter Card          | 1200×628           | `assets/social/twitter-card.png`    |
| OG Image              | 1200×630           | `screenshots/en/*/XX-name.png`      |
| Thumbnail             | 720×450            | `processed/thumbnail/XX-name.png`   |
