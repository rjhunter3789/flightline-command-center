# Flightline Git and Deployment

Last Updated: June 22, 2026

## Repository

GitHub repository:

`rjhunter3789/flightline-command-center`

Production server path:

`/var/www/flightline`

Main branch:

`main`

Remote:

`origin https://github.com/rjhunter3789/flightline-command-center.git`

## Standard Git Check

```bash
cd /var/www/flightline
git status
git remote -v
```

Expected clean state:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

## Pull Latest Documentation or Code

Before pulling, verify there are no local uncommitted changes:

```bash
cd /var/www/flightline
git status
git pull
```

## Commit Local Changes

```bash
cd /var/www/flightline
git status
git add <files>
git commit -m "<clear commit message>"
git push
```

## Deployment Process

Flightline backend is managed by PM2.

After backend code changes:

```bash
cd /var/www/flightline/backend
npm install
pm2 restart flightline-backend
pm2 status
```

## Frontend Build Process

Nginx serves the built frontend from:

`/var/www/flightline/frontend/build`

After frontend changes:

```bash
cd /var/www/flightline/frontend
npm run build
```

A successful build may show existing lint warnings. The important success markers are:

```text
Compiled with warnings.
The build folder is ready to be deployed.
```

A failed build shows:

```text
Failed to compile.
```

After a successful frontend build, commit the source changes from the repo root:

```bash
cd /var/www/flightline
git add <changed files>
git commit -m "<clear commit message>"
git push
git status
```

The `frontend/build` folder is ignored by Git, but the active server build is created locally by `npm run build`.

## Mobile MVP Deployment Notes

The June 22, 2026 mobile MVP changes were built and pushed successfully.

Important mobile source files:

- `frontend/src/App.jsx`
- `frontend/src/App.css`
- `frontend/src/components/Mobile/FlightlineMobile.jsx`
- `frontend/src/components/Mobile/FlightlineMobile.css`
- `frontend/src/hooks/useRealTimeData.js`

Mobile MVP expected behavior after build:

- iPhone loads Flightline Mobile instead of blank/dark screen.
- Mobile uses the desktop 12-deal demo source through `useRealTimeData()`.
- WebSocket is disabled for mobile demo mode.
- Pipeline stage cards are actionable.
- Deal/customer tap opens an in-page detail card.
- Today's Snapshot shows MVP metrics.

## PM2 State

Save PM2 state after intentionally changing process status:

```bash
pm2 save
```

## Sensitive Files

Environment files and credential files should not be committed.

Expected ignored examples:

- `.env`
- `backend/.env`
- credential files
- token files
- `node_modules`
- logs
- build caches

Before committing:

```bash
git status
```

Do not commit secrets, credentials, private tokens, or raw environment files.

## Current Deployment Notes

- Flightline is active in PM2 as `flightline-backend`.
- MongoDB must be running before Flightline can start cleanly.
- Smart Doc is retired/shelved and should remain stopped.
- Auto Audit Pro is a separate production PM2 process named `auto-audit`.
- Flightline Mobile MVP is currently usable on iPhone and should be treated as the active MVP mobile path.