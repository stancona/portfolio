---
status: Draft | Accepted
type: feat | fix | chore | docs
tier: full | mini
author: [originator name or alert source]
date: YYYY-MM-DD
---

# Intent: [Descriptive name]

<!--
Golden template — `stancona/srd` payload ([M:sdlc], TEMPLATE.md §5.5).
Copied to intent/<YYYY-MM-DD-<slug>>/intent.md at capture. The folder is the work item's permanent
record — never renamed or emptied. Written in the originator's own words — no formal language
required. The product owner corrects what the agent misunderstood, then accepts it as the
Plan-stage gate.

Tier rules (check-sdlc.mjs enforces): `tier: mini` requires `type: fix`, folds the Spec/Plan into
this file (uncomment the two mini sections below), and cannot touch sensitive paths. Everything
else is `tier: full` — spec.md and plan.md are separate files in this folder.
-->

## Problem

What cannot be done today, who is affected, and what better looks like.

## Proposed outcome

What success looks like — user-visible behaviour, system behaviour, or business outcome.

## Affected users & systems

Components, teams, and neighbouring systems this touches.

## Constraints

Security/compliance, performance, architectural, and operational constraints the spec must respect.

## Out of scope

What this change explicitly will not touch — the agent's drift fence.

## Open questions

- [ ] Ambiguities the design stage must settle or carry forward explicitly.

## Capture log

<!-- Optional for full-tier units; folded mini units must keep it. Record the capture
     interview's Q→A pairs — including explicit "unanswered → agent recommends X" entries — so
     the product-owner gate can audit completeness without the chat transcript. -->

- **Q:** … **A:** …
- **Q:** … **A:** _unanswered → agent recommends …_

<!-- ── tier: mini fold — uncomment both sections only for mini units ───────────────────────
## Spec (mini)

What changes, where, and the acceptance check (one paragraph each).

## Plan (mini)

Files touched + order of work + the exact verify command that proves it.

──────────────────────────────────────────────────────────────────────────────────────────── -->
