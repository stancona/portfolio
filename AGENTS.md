# AGENTS.md

> Generated from `stancona/srd` (preset: `solo-docs`). Template-owned regions are fenced
> (`srd:begin/end`); anything outside a fence belongs to this repository and survives template
> updates. Rule ids reference `TEMPLATE.md` §1. Line budget: 150 (R-10).

<!-- srd:begin §1 boundaries -->

## 1. Purpose & boundaries

- **Repository:** `stancona/portfolio` — the portfolio showcase SSOT: screenshots, architecture
  diagrams, demo fixtures, and presentation assets for the Stancona ecosystem.

<!-- srd:end -->

**Cross-repo relationships (project-owned):** `stancona/grimoire` is the source application —
screenshots are captured from live instances, never hardcoded mockups; `stancona/codex` holds the
strategic decisions portfolio content must align with; `stancona/bastion` defines the topology the
diagrams reference.

<!-- srd:begin §2 language -->

## 2. Language rules (R-06)

- Documentation, code comments, commits, branches, file and directory names: **`English`**.
- Conversation with the human: **`Turkish`**.
- File names: lowercase `kebab-case`. Raw capture material keeps its original language (R-06).

<!-- srd:end -->

<!-- srd:begin §3 decisions -->

## 3. Authority & decision records (R-01…R-05)

- Decisions: `docs/decisions/ADR-NNNN-kebab-title.md`, monotonic numbering, never reused; MADR
  format — Context / Options / Decision / Consequences (TEMPLATE.md §5.3).
- Plans: `docs/plans/<N>-<kebab>.md` scaffolded from `docs/plans/template.md`, linked to an issue —
  docs/meta work, and repositories without `[M:sdlc]`.
- **Scope test before writing any decision:** could this bind another repository? Yes → it belongs
  in the federation SSOT (`stancona/codex`) — ask the human first (R-01). Otherwise write it here.
- **Immutable history:** never delete or rewrite a decision body. New number + old status
  `Deprecated` or `Superseded by …` (R-03).
- **Index sync:** any added/removed/renamed file updates that directory's `INDEX.md` and the root
  `INDEX.md` in the same commit (R-04).

<!-- srd:end -->

## 4. Project Context

- **Content language:** English primary; Turkish translations in `*.tr.md` variants. Bilingual
  screenshots live in `screenshots/en/` and `screenshots/tr/`.
- **Dummy data MUST be fictional** — no real customer names, emails, API keys, or credentials.
  All demo data follows the fantasy/TTRPG theme.
- **Screenshots MUST be sanitized** — blur/redact any accidental real data before committing; the
  sanitize gate (`scripts/sanitize-checklist.sh`) runs before any screenshot commit.
- **Screenshot governance:** capture at 2x DPR (2880x1800 native), viewport 1440x900, default theme
  `stancona dark` (`dim`), no browser chrome, macOS window frame + Stancona gradient background
  (`#0a0a0a → #1a1a2e`); export Full (2880x1800), Thumbnail (720x450), OG (1200x630).
- **Pipeline SSOT:** `shots.config.js` + `docs/CAPTURE-WORKFLOW.md`; CI regenerates screenshots
  after every grimoire `dev` merge — script curation survives regeneration, hand edits do not.

## 5. Commands

```bash
bash scripts/sanitize-checklist.sh   # gate before any screenshot commit
node scripts/prepare-capture-db.mjs  # demo data + showcase session (additive only)
node scripts/capture-design.js       # Playwright: design-system shots
node scripts/capture-apps.js         # Playwright: app shots
```

<!-- srd:begin §8 delegation -->

## 8. Sub-agent delegation (R-08)

- Read-only discovery (structure scans, index reading, pattern search) → **explore** sub-agent.
- Independent multi-file work or document drafting → **general** sub-agent with a written brief.
- The main thread keeps orchestration and verification; review sub-agent output before merging it
  into a claim of completion.

<!-- srd:end -->

<!-- srd:begin §9 safety -->

## 9. Execution safeguards (R-09)

- **No secrets in tracked files.** Placeholders and environment expansion only
  (`{env:VAR}` in tool config, `${VAR}` in `.mcp.json`).
- **No raw container or remote commands** (`docker run/rm`, ad-hoc SSH) against any live system.
  Propose the configuration; a human applies it and pastes back the output.
- **Human-in-the-loop for destructive operations** — deletions, migrations, force-pushes, mass edits.

<!-- srd:end -->

<!-- srd:begin §10 verification -->

## 10. Verification before completion (R-07)

```bash
bash scripts/sanitize-checklist.sh
```

- [ ] Gate commands ran with visible output
- [ ] `INDEX.md` files updated for every added/renamed file (R-04)
- [ ] `AGENTS.md` still within the 150-line budget and free of domain rules (R-05, R-10)
- [ ] Image paths resolve in `README.md` / `README.tr.md`

<!-- srd:end -->

<!-- srd:begin §11 references -->

## 11. References (links, not copies — R-11)

- System specification: `stancona/srd` → `TEMPLATE.md` (rule ids `R-01…R-12`)
- Drift control: `.srd.json`, `/srd-audit`, `/srd-sync`

<!-- srd:end -->

## 12. Task Workflow (Issue → Plan → PR → Done)

1. **Issue:** GitHub issue with `type:feat` or `type:chore` label.
2. **Plan:** `docs/plans/` entry only when scope exceeds a single file.
3. **Branch:** `feat/XXXX-short-name` or `chore/XXXX-short-name`; Conventional Commits.
4. **PR:** review → merge. Never delete historical records — supersede (R-03).
