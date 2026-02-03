# Openclaw Dashboard (Local-Only v1)

This dashboard is a fully local, browser-only workspace. All data is stored on-device and never leaves your machine.

## Storage model
- IndexedDB: boards, columns, cards, projects, notes, docs, labels
- localStorage: UI settings (active view, selected items)

## What’s included
- Kanban boards with columns and cards, plus drag-and-drop between columns
- Projects list + detail view, with optional board linkage
- Notes and Docs editors with search + tag filtering
- Label manager with color palette

## Persistence
Data persists across reloads. Clearing browser storage will reset the workspace to the seeded demo data.

## Development
- `npm install`
- `npm run dev`
