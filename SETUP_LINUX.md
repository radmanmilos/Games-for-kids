# Per-Server Setup Guide

This project was originally built on Windows. This file lists prerequisites
needed for smooth project running per server, and gets updated when something
changes.

---

## Alpine Linux (current server)

### Prerequisites

| Package | Purpose | Install |
|---------|---------|---------|
| Node.js >= 22 | All smoke tests, `check_all.js`, `build_offline.js` | Pre-installed |
| `zip` | Offline zip creation (`build_offline.js`) | `apk add --no-cache zip` |
| `curl` | Downloading assets | `apk add --no-cache curl` |
| `tar` | Extracting archives | `apk add --no-cache tar` |
| `bash` | `sync-docs.sh` | Pre-installed |
| `git` | Version control | Pre-installed |
| Chrome/Chromium | Headless smoke tests | Pre-installed |

### What was changed

- **`build_offline.ps1` → `build_offline.js`** — PowerShell doesn't work on
  Alpine (musl libc). Replaced with Node.js. `check_all.js` calls
  `node tools/build_offline.js`.

### Quick start

```sh
apk add --no-cache zip curl tar
node tools/check_all.js --docs --offline
```

---

## Debian / Ubuntu

### Prerequisites

| Package | Purpose | Install |
|---------|---------|---------|
| Node.js >= 22 | All smoke tests, `build_offline.js` | Pre-installed or `apt-get install -y nodejs` |
| `zip` | Offline zip creation | `apt-get install -y zip` |
| `curl` | Downloading assets | `apt-get install -y curl` |
| `tar` | Extracting archives | Pre-installed |
| `bash` | `sync-docs.sh` | Pre-installed |
| `git` | Version control | Pre-installed |
| Chrome/Chromium | Headless smoke tests | Pre-installed |

### Quick start

```sh
apt-get install -y zip curl
node tools/check_all.js --docs --offline
```

---

## Windows (original environment)

### Prerequisites

| Package | Purpose | Install |
|---------|---------|---------|
| Node.js >= 22 | All smoke tests, `build_offline.js` | Pre-installed |
| PowerShell 5.1+ | `build_offline.ps1` (original) | Pre-installed |
| `zip` | Offline zip creation | Pre-installed (or use `build_offline.js`) |
| Chrome/Chromium | Headless smoke tests | Pre-installed |

### Quick start

```sh
node tools/check_all.js --docs --offline
```

No setup needed — everything works as-is. `build_offline.js` also works on
Windows (Node.js is cross-platform).

---

## What works on all platforms

- **Node.js** (>= 22) — all smoke tests, `check_all.js`, `run_all.js`,
  `build_offline.js`
- **`tools/sync-docs.sh`** — bash script
- **All headless Chrome smoke tests** — `tools/headless.js` was fixed for
  Linux (TMPDIR fallback, `/usr/bin/chromium` paths, `--no-sandbox`)

## What was changed (cross-platform)

- **`build_offline.ps1` → `build_offline.js`** — Node.js replacement. Works on
  all platforms. `check_all.js` calls `node tools/build_offline.js`.

---

## Update log

- **2026-09-28** — Initial version. Alpine Linux prerequisites, `build_offline.js`
  replacement.
