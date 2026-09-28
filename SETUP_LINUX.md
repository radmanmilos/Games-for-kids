# Linux Server Setup (Alpine / non-Windows)

This project was originally built on Windows. When working from a Linux server
(e.g. Alpine Linux), a few things need attention. This file captures the
non-obvious setup so you don't have to rediscover it.

## What works out of the box

- **Node.js** (>= 22) — all smoke tests, `check_all.js`, `run_all.js`, and the
  new `build_offline.js` run fine.
- **`tools/sync-docs.sh`** — bash script, works as-is.
- **All headless Chrome smoke tests** — `tools/headless.js` was already fixed
  for Linux (TMPDIR fallback, `/usr/bin/chromium` paths, `--no-sandbox`).

## What was changed / installed

### 1. Offline zip build — `build_offline.ps1` → `build_offline.js`

**Problem:** `tools/build_offline.ps1` requires PowerShell. PowerShell does NOT
work on Alpine Linux (musl libc — the `gcompat` compatibility layer is not
enough; `pwsh` crashes with a `NullReferenceException` in the AST parser).

**Fix:** Replaced with `tools/build_offline.js` (Node.js). `check_all.js` now
calls `node tools/build_offline.js` instead of `powershell -File ...`.
Functionally identical: regenerates `sw-cache-list.json`, writes
`offline-manifest.json` (SHA256 + size per file), and creates
`docs/game-offline.zip`.

### 2. `zip` package

The Node.js build script uses the `zip` command. On Alpine:

```sh
apk add --no-cache zip
```

### 3. `curl` and `tar` (for downloading PowerShell — no longer needed)

These were installed during the PowerShell attempt. They're commonly available
on most systems; if missing:

```sh
apk add --no-cache curl tar
```

## Quick start on a fresh Alpine server

```sh
# 1. Install dependencies
apk add --no-cache zip curl tar

# 2. Verify everything works
node tools/check_all.js --docs --offline
```

That's it. No PowerShell, no Windows-specific tooling.

## If you're on a different Linux distro

- **Debian/Ubuntu:** `apt-get install -y zip curl tar`
- **Fedora/RHEL:** `dnf install -y zip curl tar`
- **Arch:** `pacman -S zip curl tar`

Everything else (Node.js, bash, git) is standard.

## Windows (original environment)

No setup needed — everything works as-is. `build_offline.js` also works on
Windows (Node.js is cross-platform), so you can use either script.
