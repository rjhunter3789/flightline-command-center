# Flightline Smart Doc Retirement Note

Last Updated: June 21, 2026

## Summary

Smart Doc / Smart Document Assistant was an earlier Google Drive RAG/document assistant prototype. It was useful conceptually, but it is not part of the active Flightline runtime.

During the June 2026 server recovery, Smart Doc was intentionally stopped in PM2 to reduce memory pressure and stabilize the server.

## Current Status

| Item | Status |
|---|---|
| `smart-doc-v2` PM2 process | Stopped |
| `/var/www/smart-doc-v2` | Exists |
| `/opt/smart-document-assistant` | Exists |
| `/var/www/smart-document-assistant` | Exists |
| Required for Flightline | No |
| Required for Auto Audit Pro | No |

## Why It Should Stay Stopped

- It is a retired/shelved prototype.
- It consumes memory on a small server.
- The server previously experienced MongoDB OOM failure.
- Flightline and Auto Audit Pro are the active production priorities.
- Nova is the conceptual successor path, not the old Smart Doc process.

## Do Not Delete Yet

The Smart Doc folders should not be deleted casually because they may contain:

- `.env` files
- Google credential files
- token files
- old backups
- potentially useful historical code

Before deleting or archiving any Smart Doc folders, perform a careful review and backup plan.

## If Smart Doc Is Accidentally Running

```bash
pm2 status
pm2 stop smart-doc-v2
pm2 save
```

## Future Cleanup Recommendation

When there is time, archive Smart Doc carefully:

1. Identify which folder is canonical.
2. Review credential-bearing files.
3. Confirm GitHub backup status.
4. Create an archive outside the active web/app paths.
5. Remove duplicate virtual environments, caches, and retired runtime folders only after review.

Recommended archive location:

`/root/retired-app-archives`

Do not include active secrets in a public repo.
