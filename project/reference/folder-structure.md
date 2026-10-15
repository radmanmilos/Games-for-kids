# Folder structure (detailed, older)

Moved verbatim from the README. It predates the 2026-10-13 refactor (`project/`, `archive/`); the README has the current top-level map.

# Project Folder Structure

The repository follows a strict folder organization.

```
PetrinSvet/

resources/
game/
tools/
AGENTS.md
project/tasks/INDEX.md
project/STATUS.md
README.md
```

---

## resources/

This folder is the **development workspace**.

Everything related to creating the project belongs here.

Examples:

- Original HTML files
- Reference projects
- Images
- Sounds
- Fonts
- Icons
- Mockups
- Documentation
- AI-generated assets
- Notes
- External libraries
- Experimental code
- Temporary assets

Development tooling kept here (not part of the runtime):

- `tts_generate.js` — Serbian speech MP3 generator (Google Translate TTS, `node resources/tts_generate.js`).
- `visual_audit_capture.js` — headless-Chrome screenshot harness for the visual audit (no deps, run from repo root).
- `visual_audit_instructions.md` — full read-only instructions for the visual audit model (task 47).

Test tooling lives in `tools/` (see `tools/README.md`). Run with `node tools/<file>.js` — no install needed, no `package.json`.

- **`node tools/check_all.js`** — the one-command validation ritual: `node --check` over `game/` + `tools/`, then the whole 24-tool smoke battery in parallel. Add `--docs` to also run `tools/sync-docs.sh` (required whenever `game/` changed) and `--offline` to rebuild the offline package.
- **`node tools/check_fast.js`** — the read-only fast gate, ~9 s, no browser battery beyond the hub: syntax, registry/metadata, CI-workflow topology, code-scanning-alert guards, generated-artifact freshness, offline inventory, hub smoke. **Writes nothing.** CI's `fast` job is exactly this one command, so the gate has a single definition instead of YAML steps that can drift.
- **`node tools/check_scan_alerts.js`** — read-only guard for the two GitHub code-scanning alerts: a dangerous-scheme filter must test `javascript:` **and** `vbscript:` (not a partial denylist), and an HTML stripper must consume the whole closing tag (`</script foo="bar">`, not just `</script>`). Both rules are checked behaviourally and self-tested against the pre-autofix shapes. Runs inside `check_fast`.
- **`node tools/check_release.js`** — the read-only release gate: `check_fast` + the whole battery (through `run_all.js`). It **fails on a stale generated artifact instead of rewriting it**, and enforces that promise on itself by fingerprinting `docs/`, the cache list, the manifest and the ZIP before and after and exiting non-zero if it changed anything. `--fast` skips the battery; `--release` adds the two advisory gates (offline E2E, a11y report) that are known-unreliable until R6/R10.
- **`node tools/check_syntax.js`** — syntax only: `node --check` over every `.js`/`.mjs` in `game/` + `tools/`, no browser.
- **`node tools/validate_pages.js`** / **`node tools/validate_offline.js`** — read-only structural gates: the game registry/routes/PWA metadata, and the three offline inventories (cache list, manifest, ZIP contents). Both also run inside `check_fast`, so a bad manifest fails the build instead of shipping.
- **`node tools/validate_generated.js`** — read-only freshness check for the generated artifacts: the committed `docs/` mirror must hold exactly the same 208 files as `game/` with canonically identical bytes, and `game/sw-cache-list.json` must equal what `generate_sw_list.js --stdout` produces. It reports the fix (`sync-docs.sh` / `generate_sw_list.js`) and never applies it. This is the guard for "edited `game/` and forgot to sync", which shipped a stale site silently — `sw_update_smoke.js` cannot catch it, because a stale `docs/` is internally consistent.
- **`node tools/validate_workflow.js`** — read-only guard over `.github/workflows/ci.yml` (17 checks): referenced tools exist, every `needs.<job>.outputs` read is a **direct** dependency, no tabs/CR, balanced `${{ }}`, `runs-on` on every job, affected matrix wiring/empty-selection guard, `fail-fast: false`, `extended` gated to manual/schedule. R4 fixed two silent CI failure modes by hand; this makes them permanent.
- **`tools/manifest_hash.js`** — canonical-bytes hashing (text hashed as LF, binaries byte-for-byte) shared by the offline builder and validator. Without it the manifest was hashed off raw work-tree bytes, so with `core.autocrlf=true` on Windows it depended on the machine that built it, and a Windows rebuild would have made every Linux checkout plus the parent area's «Проверити ажурирања» report the whole app as changed. `tools/build_offline.ps1` hashes through the .NET BCL, not the `Get-FileHash` cmdlet, because `check_all.js` spawns `powershell` and the child inherits a `PSModulePath` that cannot auto-load `Microsoft.PowerShell.Utility`. It now also refuses to write an empty or partial `game/offline-manifest.json` and exits non-zero, so a broken offline pack can never be reported as green again. `tools/build_offline.js` is the Node entry point and **both builders now generate only the two service-worker inventories** — the ZIP step and its `zip` dependency are gone (2026-10-02).
- **`node tools/run_all.js`** — the parallel smoke runner on its own. `--game <name>`, `--since <sha>` (only the smokes covering your changes), `--watch` (re-run affected smokes as you save), `--concurrency N`, `--list`, `--list --json`.
- **`node tools/<game>_smoke.js`** — one game directly; fastest edit loop.
- Extended browser/device gate: **`node tools/play_matrix.mjs`** (Chromium + WebKit across 5 phone/tablet/desktop viewports); unavailable browsers are reported as incomplete coverage, not a pass. The axe-core 4.10.2 accessibility scan is pinned in `tools/vendor/` and runs as a blocking CI/release gate.
- The `.opencode/skills/validate-game-change/SKILL.md` skill spells out which smokes to run for which change.

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR, split into independent layers so one failure cannot hide the others: a `setup` job generates the smoke matrix from `node tools/run_all.js --list --json` (so a newly added smoke is never silently left out), `fast` runs the read-only gates + the hub smoke, `smoke` runs one leg per smoke with `fail-fast: false`, each leg through `node tools/run_all.js <smoke>` so it inherits the same boot-crash retry the local runners use (a smoke that exits non-zero with **zero** checks is a cold browser, not a failed assertion; a run with at least one `FAIL` is never retried), `release` runs blocking offline E2E and accessibility checks, and `extended` runs the complete Playwright device matrix manually or weekly. A manual workflow dispatch runs both release and extended coverage. See `CONTRIBUTING.md` → CI.

Pushes and PRs use `tools/ci_affected_matrix.js` with `run_all.js --affected <base>` to limit smoke jobs to changed-file coverage; the fast gate always runs. Docs-only changes create no smoke legs and skip release checks, while manual and weekly runs retain the full battery.

Nothing inside this folder is required for the final application to run.

---

## game/

This folder contains **only the playable application**.

Everything inside this folder should be necessary to run Petrin svet.

Example (current structure):

```
game/

index.html

pages/
  animals.html
  shapes.html
  matching_game.html
  animal_puzzle.html
  animal_counting.html
  animal_memory.html
  coloring.html
  classroom.html
  tracing.html
  piano.html
  papper_kitty.html
  driving.html
  ocean.html
  dino.html
  space.html
  racing.html

games/
shared/
assets/
```

- `index.html` is the hub. It loads every game module and embeds Kitty.
- The standalone pages (`pages/animals.html`, `pages/shapes.html`, `pages/matching_game.html`, `pages/animal_puzzle.html`, `pages/animal_counting.html`, `pages/animal_memory.html`, `pages/coloring.html`, `pages/classroom.html`, `pages/tracing.html`, `pages/piano.html`, `pages/driving.html`, `pages/ocean.html`, `pages/dino.html`, `pages/space.html`, `pages/racing3d.html`, `pages/explorer.html`) each load only the modules they need.

```
games/

animals.js
shapes.js
candy.js
kitty-standalone.js
kitty-standalone.js
animal_puzzle.js
animal_counting.js
animal_memory.js
coloring.js
classroom.js
kids_games.js
tracing.js
piano.js
adventure.js
adventure-music.js
adventure-modes.js
driving.js
ocean.js
dino.js
space.js
racing-config.js
racing3d-config.js
racing3d.mjs
```

```
shared/

navigation.js
audio.js
speech.js
utils.js
main.js
celebration.js
accessibility.css
adventure.css
```

```
assets/

fonts/
sounds/
images/
```

Never store:

- Documentation
- Temporary files
- Backups
- Experiments
- Unused assets

The game folder should always represent the deployable version of the application.

---
