# Netlify Deploy Handoff -- For AI Agents

## Purpose

This document tells you exactly how to deploy static sites to Netlify from Bodhi's Mac. No guessing, no drag and drop, no browser needed. CLI only.

---

## Prerequisites

1. **Desktop Commander MCP** must be connected. You need `start_process` to run shell commands on Bodhi's Mac.
2. **Netlify CLI** is available via `npx netlify` (no global install required).
3. **Netlify auth token** is set as `NETLIFY_AUTH_TOKEN` in `~/.zshrc`. For Desktop Commander deploys, export it before running: `export NETLIFY_AUTH_TOKEN="$NETLIFY_AUTH_TOKEN"` (or source .zshrc). Token configured 2026-04-03, verified working.

---

## Critical Path Information

### Bodhi's Home Directory

```
/Users/bodhivalentine
```

Do NOT use `/Users/bodhi` -- that path does not exist and will throw EACCES errors.

### Where Site Files Live

All Cowork workspace files map to iCloud Drive on Bodhi's Mac:

```
/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/
```

If the user selected a folder called "Hard Hat Healthcare", the full path is:

```
/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/Hard Hat Healthcare/
```

If you are unsure of the exact path, run this via Desktop Commander:

```bash
mdfind -name "<filename>" 2>/dev/null
```

`mdfind` uses Spotlight and is the fastest way to locate files on macOS. Do NOT use `find /` -- it's slow and hits permission errors everywhere.

### Netlify Sites on This Account

| Site Name | Site ID | URL |
|-----------|---------|-----|
| hhh-ops-dashboard | `7408f80e-8a92-4201-9af3-482de303693a` | https://ops.hardhathealthcare.com |
| bodhi-command-center | `752b83b7-1e62-41f7-8761-da2e262c533a` | https://bodhi-command-center.netlify.app |
| mirrorops | `20a169de-0300-429e-ae1b-4ba076b929a3` | https://mirrorops.netlify.app |
| eclectic-scone-ecddc2 | `9c504ac7-3cc9-4c0b-94b0-e2990b59a21d` | https://thebookofoneness.com |

To get a fresh list at any time:

```bash
npx netlify sites:list
```

---

## How to Deploy

### The Command

```bash
export NETLIFY_AUTH_TOKEN="$NETLIFY_AUTH_TOKEN" && cd "<full-path-to-site-folder>" && npx netlify deploy --prod --dir=. --site=<SITE-ID>
```

If running from a shell that has already sourced `~/.zshrc`, the export is automatic. For Desktop Commander `start_process` calls, always include the explicit export to be safe.

### Important Details

1. **Use the Site ID (UUID), not the site name.** The `--site` flag with a name often fails with "Not Found". Always use the UUID from the table above.

2. **Netlify serves `index.html` by default.** If your main file is named something else (like `ops-dashboard-live.html`), you MUST copy it to `index.html` before deploying:

```bash
cd "<folder>" && cp my-file.html index.html && npx netlify deploy --prod --dir=. --site=<SITE-ID>
```

If you skip this step, the site will return a 404 "Page not found" error.

3. **The `--dir=.` flag** tells Netlify to deploy everything in the current directory. This is correct for single-page sites. If you only want to deploy specific files, create a dedicated deploy folder, copy the files into it, and point `--dir` there instead.

4. **First run may install the package.** If `netlify` isn't cached in npx yet, you'll see "The following package was not found and will be installed" -- this is normal. Give it up to 60 seconds timeout.

---

## Example: Deploying Book of Oneness

```bash
# Step 1: Find the files
mdfind -name "index.html" | grep -i oneness

# Step 2: Deploy (using the site ID from the table)
cd "<path-from-step-1's-parent-folder>" && npx netlify deploy --prod --dir=. --site=9c504ac7-3cc9-4c0b-94b0-e2990b59a21d
```

Expected output on success:

```
Deploy is live!
Production URL: https://thebookofoneness.com
```

---

## Example: Deploying HHH Ops Dashboard

```bash
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/Hard Hat Healthcare/framezero/clients/hhh" && cp ops-dashboard-live.html index.html && npx netlify deploy --prod --dir=. --site=7408f80e-8a92-4201-9af3-482de303693a
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "Not Found" error on deploy | Used site name instead of site ID | Use the UUID from the sites table |
| 404 on the live site | No `index.html` in the deploy folder | Copy your main HTML file to `index.html` |
| EACCES or permission denied | Wrong home directory path | Use `/Users/bodhivalentine`, not `/Users/bodhi` |
| "Temporary failure in name resolution" | Running from a sandboxed environment (Cowork VM) | You MUST run via Desktop Commander on Bodhi's Mac. The Cowork sandbox cannot reach external DNS. |
| Timeout on npx | First-time package install | Set timeout to 60000ms or higher |

---

## What NOT to Do

- Do NOT tell the user to drag and drop files in the Netlify browser UI. That's what humans do. You have CLI access. Use it.
- Do NOT try to deploy from the Cowork sandbox (`/sessions/...`). Those paths don't exist on Bodhi's Mac. You must use Desktop Commander.
- Do NOT use `netlify link` or `netlify init` -- the sites are already created and configured. Just deploy directly with `--site=<ID>`.
- Do NOT guess file paths. Use `mdfind` to confirm where files actually are on the Mac.

---

## Quick Reference Command

Copy-paste template:

```bash
cd "<FOLDER_PATH>" && npx netlify deploy --prod --dir=. --site=<SITE_ID>
```

That's it. The auth token lives in `~/.zshrc`, the sites exist, just deploy. Token is NOT stored in any CLAUDE.md or brain file -- only in the shell profile on Bodhi's Mac.
