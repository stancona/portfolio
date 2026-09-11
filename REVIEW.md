# Review Policy (REVIEW.md)

<!--
Golden template — `stancona/srd` payload ([M:sdlc], TEMPLATE.md §5.5).
Repo-root review policy consumed by every review pass, human or agent. Findings never approve or
block a PR on their own — branch protection still requires the code owner's approval.
-->

Review every PR in three passes. Report findings as **Important** or **Nit**; at most five nits per
review.

## Pass 1 — Bugs & logical errors

Behaviour that breaks `plan.md`'s proof section, incorrect edge-case handling, and dead or
unreachable paths introduced by the diff.

## Pass 2 — Security

Secrets in the diff, unvalidated input on new surfaces, authorization gaps, and dependency changes
without justification.

## Pass 3 — Spec compliance

The diff implements `intent.md` + `spec.md` and nothing else; `plan.md`'s files-that-change list
matches what changed.

## Severity

- **Important** — would break behaviour, leak data, or breach a policy. Blocks merge until fixed.
- **Nit** — style or preference; never blocks, maximum five per review.

## Do not report

- Generated files and anything CI already enforces deterministically.
- Pre-existing issues outside the diff — file a new intent instead.
