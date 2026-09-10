# Contributing to stancona/portfolio

## How to Add Screenshots

1. Capture from live `grimoire` instance (never mock up manually).
2. Follow the capture workflow in `docs/CAPTURE-WORKFLOW.md`.
3. Run `scripts/sanitize-checklist.sh` before committing.
4. Place in both `screenshots/en/` and `screenshots/tr/` if text is visible.

## How to Update Fixtures

1. Edit the JSON files in `fixtures/`.
2. Keep both EN and TR versions in sync.
3. Maintain the TTRPG theme.
4. Update `generatedAt` timestamp.

## How to Add Diagrams

1. Create Mermaid source in `diagrams/`.
2. Export to PNG using `mmdc` (Mermaid CLI).
3. Place exported PNG in `screenshots/en/architecture/` and/or `screenshots/tr/architecture/`.

## Commit Convention

```
chore(portfolio): description
```

Examples:

- `chore(portfolio): add design system screenshots EN`
- `chore(portfolio): update demo fixtures v1.1`
- `chore(portfolio): add architecture diagram`
