# Openclaw Dashboard (Local-Only v1)

This dashboard is a fully local, browser-only workspace. All data is stored on-device and never leaves your machine.

## Storage model
- IndexedDB: boards, columns, cards, projects, notes, docs, labels
- localStorage: UI settings (active view, selected items), seed version marker

## What’s included
- Read-only dashboard (Locked — ask Ex-Machina to edit)
- Kanban boards with columns and cards (view-only)
- Projects list + detail view, with optional board linkage (view-only)
- Notes and Docs with search + tag filtering (view-only)
- Label palette display
- Header reset button to reseed demo data

## Persistence
Data persists across reloads. Seed data auto-reapplies when the seed version changes (or when using the Reset data button). Clearing browser storage will reset the workspace to the seeded demo data.

## Development
- `npm install`
- `npm run dev`
