# Flightline Operations Runbook

Last Updated: June 23, 2026

## Normal Health Check

Run from any shell:

```bash
pm2 status
systemctl status mongod --no-pager
df -h
free -h
```

Expected state:

| Item | Expected |
|---|---|
| `auto-audit` | Online |
| `flightline-backend` | Online |
| `smart-doc-v2` | Stopped |
| MongoDB | Active running |
| Disk | Healthy, ideally below 80% |
| Swap | Active |
| Flightline uptime | Climbing without PID resets |

## Flightline Backend Logs

```bash
pm2 logs flightline-backend --lines 80 --nostream
```

Application logs:

```bash
cd /var/www/flightline/backend
tail -n 150 logs/error.log
tail -n 150 logs/combined.log
```

## Restart Flightline

```bash
pm2 restart flightline-backend
pm2 status
```

If the process is stopped:

```bash
pm2 start flightline-backend
pm2 status
```

## Restart MongoDB

```bash
systemctl restart mongod
systemctl status mongod --no-pager
ss -ltnp | grep 27017
```

## Frontend Build and Mobile Verification

After frontend changes:

```bash
cd /var/www/flightline/frontend
npm run build
```

Build result guidance:

| Output | Meaning |
|---|---|
| `Compiled with warnings` and `The build folder is ready to be deployed` | Pass |
| `Failed to compile` | Fail |

Known current warnings are older dashboard lint warnings and are not blocking the build.

After a successful mobile build, test `https://flightline.autoauditpro.io` on iPhone.

Expected mobile MVP behavior:

- Page loads without blank/dark screen.
- Page scrolls normally.
- Flight Attendant panel appears near the top.
- Flight Attendant briefing buttons update the written summary.
- Speak Briefing reads the current summary out loud.
- Active Deals shows the desktop 12-deal demo source.
- Stage pills filter Active Deals.
- Deal Flow Pipeline cards jump to Active Deals filtered by selected stage.
- Customer/deal tap opens an in-page detail card.
- Today's Snapshot shows useful MVP metrics.

## Flight Attendant Verification

Flight Attendant v1 is frontend-only and read-only.

Test steps:

1. Open Flightline Mobile.
2. Tap Active Deal Summary.
3. Confirm written briefing updates.
4. Tap Speak Briefing.
5. Confirm browser speech reads the briefing.
6. Repeat with Deal Flow Summary, Today's Snapshot, and What Needs Attention.

Expected result:

- Briefing text updates.
- Browser speech readout works.
- No backend restart is required.

Known limitation:

- Native browser voice quality is poor and not acceptable for production.

Next voice pass should improve voice selection, add a stop speaking control, shorten scripts, and prepare premium TTS.

## Save PM2 State

Any time PM2 process state is intentionally changed:

```bash
pm2 save
```

## Git Status Check

```bash
cd /var/www/flightline
git status
git remote -v
```

Expected:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

## Commit and Push Documentation or Code Changes

```bash
cd /var/www/flightline
git status
git add <files>
git commit -m "<message>"
git push
```

GitHub may ask for username and a personal access token.

## Do Not Restart Smart Doc by Default

Smart Doc was an older team RAG prototype that evolved conceptually into Nova. It is currently retired/shelved and should remain stopped unless intentionally revived.

Check status:

```bash
pm2 status
```

If Smart Doc is online and not needed:

```bash
pm2 stop smart-doc-v2
pm2 save
```