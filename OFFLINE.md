# How offline works in Petrin svet

**Status: the manual ZIP download was removed on 2026-10-02 (user decision).**
This file documents what replaced it, so the mechanism is not lost.

---

## The short version

A parent presses one button — **«📥 Преузми за офлајн рад»** in the parent area
(`game/pages/parent.html`) — and a **service worker** caches every file the app
needs. After that the whole site works with no network at all.

There is **no archive to download and unzip.** That option existed for a long time
(`docs/game-offline.zip`, ~5.4 MB). It was never published to GitHub Pages, was
therefore a dead link for real parents, and cost a build step that could not even
run on CI. It has been deleted along with every reference to it.

---

## The parts

| Piece | File | What it does |
| --- | --- | --- |
| The worker | `game/sw.js` | Serves from cache first, network second. Knows nothing about a repo path — it derives `APP_ROOT` from `self.registration.scope`. |
| The cache list | `game/sw-cache-list.json` | **Generated.** Exactly which files get pre-cached. |
| The manifest | `game/offline-manifest.json` | **Generated.** `sha256` + byte size for exactly those files. |
| Hashing | `tools/manifest_hash.js` | One definition of "the bytes of this file", shared by the builder and the validator so they cannot disagree. |
| The button | `game/pages/parent.html` | Triggers the worker's `cacheAll` and waits for its explicit `cache-complete`. |
| The validator | `tools/validate_offline.js` | Proves the inventories match reality. |
| The builder | `tools/build_offline.js` / `.ps1` | Regenerates both inventories. Writes nothing to `docs/`. |

### The two inventories, and why they are not the same thing

- **`sw-cache-list.json`** — *what* to cache. A flat list of paths.
- **`offline-manifest.json`** — *what it should look like*. One hash + size per entry.

`sw.js` diffs the online manifest against the cached one to power **«🔄 Провери
ажурирања»**, so a stale file is detected and **named** rather than silently
re-downloaded.

### One rule that looks like an oversight

**`offline-manifest.json` must never list itself.** It is written *after* the
hashes are computed, so a self-entry could only ever hold the hash of the
*previous* manifest. Because the update check reports every differing key, a
self-entry made the parent area report "changed" on **every single check** and
never come back clean. It stays in `sw-cache-list.json` (the worker reads it back
out of the cache to diff against) but is excluded from its own contents.
`build_offline.js` and `validate_offline.js` both enforce this.

### Caregiver docs are deliberately not cached

`game/docs/OFFLINE_INSTALL.md` ships with the site (via the `docs/` mirror) but no
runtime page loads it, so it must **not** be in the cache list. `validate_offline.js`
checks exactly that.

---

## Deployment shape (why paths are never hard-coded)

The site is served by **GitHub Pages from `docs/`**, i.e. from a **subpath**:

```
https://<host>/Games-for-kids/
```

`/game/...` is correct in the repo and **wrong at runtime**. `sw.js` derives
`APP_ROOT` from the registration scope and builds every URL from it, using the same
derived string for both the network fetch and the `caches` lookup. A hard-coded
`cache.match('/game/offline-manifest.json')` shipped once and made the update
check report *every* file as changed, forever.

`game/` is the source of truth; `docs/` is a generated mirror. Never edit `docs/`.

---

## Working on it

```bash
node tools/sync-docs.sh              # game/ -> docs/ mirror (run after ANY game/ change)
node tools/build_offline.js          # regenerate the two inventories
node tools/validate_offline.js       # prove they match reality (10 checks + a report)
node tools/check_fast.js             # the ~9 s read-only gate; includes validate_offline
```

**Hashes are computed over canonical bytes, not work-tree bytes** (`manifest_hash.js`:
text as LF, binaries byte-for-byte). This checkout is CRLF on Windows
(`core.autocrlf=true`) and LF in git/CI. Hashing raw bytes would have made the
manifest machine-dependent — a Windows rebuild would bake in CRLF hashes and then
*every* Linux checkout, plus the parent's update check, would report the whole app
as changed.

---

## How it is tested

`tools/offline_smoke.mjs` is the `Release QA` gate and it **really** tests offline:

1. Prime the cache online; wait for the worker's explicit `cache-complete`.
2. **Cut the network** with CDP's own `Network.emulateNetworkConditions`. (Not a
   proxy rule — the entire app is served from `127.0.0.1`, so a blanket block would
   kill the origin too and the old design passed *vacuously*.)
3. Play all 16 games with real trusted input, asserting geometry and
   `document.elementFromPoint` — `element.click()` bypasses hit-testing, so a test
   can pass while a child cannot reach the control.
4. **Negative control:** a URL that is *not* in the offline inventory must fail to
   load. If it succeeds, the network is still reachable and the run proves nothing.

This is the gate that found three real product bugs: dead back buttons in
`explorer.html` and `parent.html`, a back button trapped under racing3d's start
modal, and an update check that hung forever offline.