# Development Guide

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- A browser with [Tampermonkey](https://www.tampermonkey.net/) installed

## Setup

```bash
git clone https://github.com/tansautn/hypeddit-downloadwall-bypasser-reloaded
cd hypeddit-downloadwall-bypasser-reloaded
pnpm install   # also runs husky install via prepare script
```

---

## Option A — `file://` scheme (simpler, Firefox-friendly)

Tampermonkey can `@require` a `file://` URL directly — no web server needed.

### Steps

1. **Firefox only** (Chrome requires "Allow access to file URLs" in extension settings).
2. In your installed `[DEV]` skeleton (`dev/dev.userscript.js`), change the `@require` line:
   ```js
   // @require  file:///D:/Z-Data/git/user_scripts/.../script.js
   ```
3. Edit `script.js`. On page reload, TM reads the file directly from disk.
4. To bust the cache, bump `@version` in the skeleton (or use the Vite hook below which does this automatically).

> ✅ Less cache friction than HTTPS — file reads bypass HTTP caching entirely.  
> ⚠️ Path is machine-specific; don't commit the skeleton with a `file://` URL.

---

## Option B — Vite HTTPS dev server (portable, team-friendly)

### 1. Start the local HTTPS server

```bash
pnpm dev
```

Vite starts at **`https://localhost:8443`** and serves `script.js` raw.

The Vite plugin also **automatically bumps `@version`** on startup and on every save:

```
2026.2.1.2  →  2026.2.1.2-dev-a3f9   (on pnpm dev start)
   <save>   →  2026.2.1.2-dev-c712   (on each file change)
   <stop>   →  2026.2.1.2            (restored on Ctrl-C / server close)
```

This forces TM to re-fetch `@require` on every reload without manual intervention.

### 2. Trust the self-signed certificate (one-time)

Open `https://localhost:8443` → accept the cert warning. One-time per browser profile.

### 3. Install the dev skeleton

Create a new script in Tampermonkey and paste [`dev/dev.userscript.js`](./dev/dev.userscript.js).

```js
// @require  https://localhost:8443/script.js
```

### 4. Develop

Edit `script.js`. Vite bumps `@version` → TM detects change → re-fetches file.

---

## ⚠️ @require cache problem

TM has its own internal cache for `@require` URLs on top of the browser cache.
The version-bumping Vite plugin is the primary mitigation. If you still get stale content:

| Fix | How |
|---|---|
| TM "Update interval" → **Always** | Dashboard → Settings → Externals → _Update every_ = `Always` |
| Bump `@version` in skeleton manually | Increment the number and Save |
| Delete cached instances | TM Editor → toolbar → _Delete cached instances_ |

---

## Lint

```bash
pnpm lint          # check
pnpm lint:fix      # auto-fix style issues
```

ESLint is configured with all Tampermonkey/GM globals (`unsafeWindow`, `GM_*`, etc.).

---

## Hook & Automation

### Git pre-commit (husky)

The `.husky/pre-commit` hook strips the `-dev-XXXX` suffix from `@version` in `script.js` before any commit. This ensures the dev bump never leaks into the repo history or published releases.

```
Edit  →  2026.2.1.2-dev-c712
commit →  pre-commit hook fires
        →  2026.2.1.2          (suffix stripped, git add re-staged)
```

### Version naming convention

Format: **`YYYY.major.minor[.patch]`**

| Example | Meaning |
|---|---|
| `2026.2.1` | Year 2026, feature release 2.1 |
| `2026.2.1.2` | Year 2026, bug-fix patch 2 of feature 2.1 |

Rules:
- **Always starts with the current 4-digit year** (>= 2000), never a letter prefix.
- `patch` — bug-fix (smallest increment)
- `minor` — new feature
- `major` — full rewrite / breaking change

Tags in this repo are mixed-format historically. Automation reads only tags matching `^[0-9]{4}\.` (4-digit year prefix).

### What happens at release

1. **Publish a GitHub Release** with a tag like `2026.2.1.2`.
2. CI (`build.yml`) runs:
   - Forces `@version` in `script.js` to match the tag (strips any `-dev-*` remnant)
   - Copies to `muzikDwlBypass3r.user.js`
   - Attaches that file to the Release assets
   - Updates `CHANGELOG.md` (new section at top)
   - Updates `## Versions` table in `README.md`
3. `@downloadURL` / `@updateURL` in the script point to:
   ```
   https://github.com/.../releases/latest/download/muzikDwlBypass3r.user.js
   ```
   GitHub redirects this URL to the **latest release asset automatically** — no need to update the script header on every release.

You never need to edit `CHANGELOG.md`, the README version table, or `@version` manually for a release.

---

## Project structure

```
script.js                   ← the actual userscript (only file you edit)
dev/
  dev.userscript.js         ← Tampermonkey skeleton for live reload
eslint.config.js            ← ESLint flat config with GM globals
vite.config.js              ← Vite HTTPS dev server + version bump plugin
.husky/
  pre-commit                ← strips -dev suffix before commit
.github/workflows/
  build.yml                 ← CI: changelog, README table, release assets
CHANGELOG.md                ← auto-updated on release tags
```
