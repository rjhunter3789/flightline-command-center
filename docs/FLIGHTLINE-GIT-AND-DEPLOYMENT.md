# Flightline Git and Deployment

Last Updated: June 21, 2026

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

After frontend changes, rebuild the frontend according to the active frontend build process for the project. Then verify Nginx routing and application behavior.

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
