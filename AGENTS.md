# AGENTS.md

> Agent instruction set for `stancona/portfolio`. Every rule here prevents a likely mistake by an
> AI agent.

---

## 1. Core Purpose & Repository Boundaries

- **Single Source of Truth (SSOT):** `stancona/portfolio` stores portfolio showcase content — screenshots, architecture diagrams, demo fixtures, and presentation assets for the Stancona ecosystem.
- **Cross-Repo Relationships:**
  - `stancona/grimoire`: Source application — screenshots are captured from here.
  - `stancona/codex`: Strategic decisions — portfolio content must align with codex-approved architecture.
  - `stancona/bastion`: Infrastructure — diagrams reference bastion topology.
- **Update Workflow:** Always capture screenshots from live `grimoire` instances. Never hardcode mockups that drift from the actual UI.

---

## 2. Content Rules

- **All content MUST be in English** (primary). Turkish translations live in `*.tr.md` variants.
- **Dummy data MUST be fictional** — no real customer names, emails, API keys, or credentials.
- **Screenshots MUST be sanitized** — blur/redact any accidental real data before committing.
- **TTRPG theme consistency** — all demo data follows the fantasy/TTRPG theme (character names, events, products).
- **Bilingual images** — screenshots with text must exist in both `screenshots/en/` and `screenshots/tr/`.

---

## 3. Screenshot Governance

- Capture at **2x DPR** (retina quality, 2880x1800 native).
- Default theme: **stancona dark** (`dim` variant).
- Browser viewport: **1440x900**.
- No browser chrome in final exports — crop to content only.
- Frame with macOS window chrome + Stancona gradient background (#0a0a0a → #1a1a2e).
- Export three sizes: **Full** (2880x1800), **Thumbnail** (720x450), **OG** (1200x630).

---

## 4. Task Workflow

1. Open GitHub Issue with `type:feat` or `type:chore` label.
2. Create `docs/plans/` entry if scope > single file.
3. Branch: `feat/XXXX-short-name` or `chore/XXXX-short-name`.
4. Commit: `chore(portfolio): description` (Conventional Commits).
5. PR → Review → Merge.

---

## 5. Verification Safeguards

- Run `scripts/sanitize-checklist.sh` before any commit containing screenshots.
- Verify no `.env`, API keys, or real credentials are visible.
- Check all image paths resolve correctly in README.md / README.tr.md.

---

## 6. SRD Anchor

This repository is adopted from `stancona/srd` (v1.1.1).

- `.srd.json` records the version, preset, slots, and sha256 of managed files.
- Drift check: `/srd-audit`.
