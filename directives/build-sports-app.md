# Directive: Build Sports Association Management App

## Goal
Design and build a web application for managing a sports association ("association sportive"). The app digitizes operations: member management, scheduling, communications, and financials.

## Status: 🟢 V1 Prototype Complete

## What's Built (v1 — 2026-04-14)

### Tech Stack
- **Frontend-only SPA** — Pure HTML/CSS/JS (no framework, no build step)
- **Location**: `app/` directory
- **Serves from**: Any static file server, or direct file:// opening

### Files
| File | Purpose |
|------|---------|
| `app/index.html` | Main shell — sidebar, 5 pages, modal, toast |
| `app/css/styles.css` | Full design system — dark/light modes, responsive |
| `app/js/data.js` | Mock data — 24 members, 15 events, 15 transactions |
| `app/js/charts.js` | Lightweight pure-CSS bar chart engine |
| `app/js/app.js` | SPA routing, rendering, CRUD, interactions |

### Features Implemented
1. **Dashboard** — Stats cards (animated counters), attendance chart, upcoming events, recent members, financial summary
2. **Members** — Full table with search/filter (status + category), add/edit/view via modals, attendance bars, dues status
3. **Planning** — Monthly calendar with event display, month navigation, add event modal, color-coded event types
4. **Finances** — Income/expense/balance/pending stats, monthly evolution chart, expense breakdown, transaction table, add transaction modal
5. **Communications** — Announcements feed, quick message form, notification bell with pending items

### Design
- Dark sidebar + light/dark mode toggle (persisted in localStorage)
- Inter font, Material Icons
- Glassmorphic topbar, animated charts, hover micro-interactions
- Fully responsive (desktop → mobile)

## Known Limitations
- Data is in-memory (mock) — not persisted across page reloads
- No authentication
- No backend/API
- Node.js/Python not installed on user's machine

## Next Steps (when user requests)
1. **Persistence** — Add localStorage or IndexedDB to save data locally
2. **Backend** — Python FastAPI or Node.js API with SQLite
3. **Authentication** — Login/roles for admin vs member
4. **Export** — CSV/PDF export of member lists, financial reports
5. **Deploy** — GitHub Pages (static) or cloud deployment

## Edge Cases & Learnings
- `npx` is not available on user's system
- `python` is not available on user's system
- App works fine opened directly as `file://` (no CORS issues with local files)
- French locale throughout
