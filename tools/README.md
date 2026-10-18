# tools/ — Dev tooling (never deployed)

Headless-Chrome test harnesses and helpers for this project. Everything in here
is dev-only; `game/` stays deployable-only and never requires `tools/` at runtime.

Run any tool from anywhere with `node` (Node >= 22 — uses global `fetch` +
`WebSocket`). No npm install needed. `CHROME_PATH` env overrides the Chrome
binary.

On a fatal CDP websocket disconnect, `headless.js` reports one socket/browser
diagnostic and sets a nonzero exit code instead of letting Node terminate — both
for a promise left un-awaited (the unhandled-rejection absorber) and for an
awaited command whose rejection escaped as an exception through a `.mjs` tool's
top-level await (task 204's second path). See `guards/cdp_fail_negtest.js` for the
real disconnect regression test.

**Chrome boot crashes are routine on GitHub runners, and `run_all.js` is the retry
that absorbs them (task 181).** In run #40, 13 of 27 matrix legs hit
`Chrome did not start (debug port N) after 4 attempts ... no assertions ran` with
the browser process still **alive** and the port simply silent; all 13 passed on
`run_all.js`'s retry. Two details make that retry usable by a release gate: the
environmental-death test is `code !== 0 && ((pass === 0 && fail === 0) || /no
assertions ran/.test(out) || (fail === 0 && (/CDP websocket (closed unexpectedly|
error)/.test(out) || /Chrome exited while a CDP session was open/.test(out))))` —
the marker clauses matter because `offline_smoke.mjs` prints three PASS lines
*before* it boots a browser, so the old zero-check rule missed it. Task 204 added
the last clause: a MID-SESSION death is the same flake one stage later — Chrome
exited / the DevTools websocket dropped after boot with zero FAIL checks, the
shape that made Release QA red on run #40 (raw `CDP websocket closed unexpectedly`
crash, 3 passes, no retry). A tool that printed even one FAIL is never retried, so
a deterministic regression still goes red on all three attempts. Positional names
ending in `.mjs` are accepted, so a gate that is deliberately not
in the battery can be run explicitly (`node tools/run_all.js offline_smoke.mjs`)
without joining it (the battery is still 27 tools). **Never run a `*_smoke` tool raw
in CI**: that was the last asymmetry in the repo and it made `Release QA` red on every
single run. `offline_smoke.mjs` also sets a nonzero exit code from `getFails()` — it
used to have none, so the blocking gate could only go red by crashing, never by
failing an assertion.

`gh` is installed here (`/usr/local/bin/gh`, official tarball — Alpine has no `gh`
package) and authed, so CI step logs are readable. Two traps: the device flow's
waiting process is killed by a session restart and the token is then lost, so start
it detached with `setsid`; and `gh api .../jobs/<id>/logs` fails with "the response
contains terminal escape sequences" — use `gh run view <id> --log`.

Task 156 profiling found Windows teardown spent 2.1–4.3 s starting PowerShell
to locate Chrome by profile, while removing its profile took only ~32 ms.
`close()` now terminates the exact `ChildProcess` handle first, waits up to the
existing bounded debug-port window, and falls back to the profile-specific
PowerShell match if Chrome is still serving. Five measured closes averaged 52 ms;
POSIX keeps the existing profile-tag kill.

`run_all.js --affected <base>` selects smoke coverage from a whole-repository diff for CI: game files map to their smokes, smoke-script edits rerun themselves, removal of a smoke and shared harness/selector/workflow/release-gate edits expand to the remaining full battery. Unrelated/doc-only changes yield an empty list; manual and weekly CI runs omit the base and use the full battery.

## Files

| File | What it is (first sentence; full text in `project/reference/tools-detail.md`) |
| --- | --- |
| `headless.js` | Shared harness: serves game/ over HTTP, boots headless Chrome on a unique temp profile, returns { evalv, evalp, navigate, close, port }. |
| `audio_buses_smoke.js` | Deterministic fake-Web-Audio checks for separate speech/music/SFX routing, Adventure music/effects, media ducking, speech completion/cancellation,… |
| `ci_affected_matrix.js` | CI setup helper: reads push/PR event metadata to find the diff base, invokes run_all.js --affected, removes hub_smoke.js (covered by fast), and… |
| `run_all.js` | Start here. |
| `check_syntax.js` | Read-only node --check over every .js/.mjs in game/ + tools/, exported as runSyntax() and runnable alone. |
| `check_fast.js` | The read-only fast gate (R5/task 165). |
| `audit_serbian_strings.js` | Advisory scan for exact repeated child-facing Cyrillic strings in game HTML/JS outside game/data/serbian.js. |
| `short_landscape_audit.js` | V3.1 short-landscape audit (task 217), spec §11. |
| `runtime_error_smoke.js` | R8/task 169 runtime-error gate. |
| `guards/cdp_fail_negtest.js` | Task 177d regression test for headless.js websocket loss. |
| `guards/boot_enable_negtest.js` | Task 214 regression guard for the parent_smoke CI boot crash (CDP Page.enable got no response within 30000ms, 0 checks, red on every run that hit it). |
| `validate_workflow.js` | CI-topology guard (R5/task 165), 17 read-only checks over .github/workflows/ci.yml: every tools/*.js the workflow invokes exists; every… |
| `validate_generated.js` | Generated-artifact freshness (R5/task 165), the command the roadmap asked for. |
| `check_scan_alerts.js` | Regression guard for the two GitHub code-scanning alerts (task 176). |
| `check_release.js` | Read-only release gate (rewritten in R5/task 165). |
| `registry.js` | Shared app-registry loader (R7/task 167). |
| `guards/registry_guards_negtest.js` | Negative test for the registry contract checks in validate_pages.js (R7/task 167). |
| `guards/route_contract_negtest.js` | Negative test for route_contract.js (R7/task 167). |
| `guards/games_map_negtest.js` | Negative test for the derived game-file → smoke mapping in run_all.js (R7/task 167). |
| `guards/chrome_diagnostic_negtest.js` | Task 178 regression guard for which Chrome the CDP diagnostic describes. |
| `check_all.js` | The one-command validation ritual: node --check over every .js/.mjs in game/ + tools/ (via check_syntax.js) → the full smoke battery → optional… |
| `parent_smoke.js` | The parent area (R12/task 163) — the four actions (offline download, update check, reset progress, audio test), the app version resolved from… |
| `sw_update_smoke.js` | Service-worker update-path correctness (R3/task 154) — 8 checks, served under a deliberate subpath /some/deep/prefix/ so any deployment-path… |
| `validate_offline.js` | Offline inventory validator (R2/task 153). |
| `manifest_hash.js` | Canonical-bytes hashing (task 164), shared by build_offline.js and validate_offline.js so the builder and the validator can never disagree about what… |
| `offline_smoke.mjs` | True offline browser test (not part of the 19-tool battery). |
| `play_matrix.mjs` | Blocking Playwright device matrix (R11/task 172): 5 viewports × Chromium/WebKit × every registry page. |
| `axe_check.js` | Accessibility scan of the hub, every registry child and the parent surface with axe-core 4.10.2 (WCAG 2.0/2.1 A+AA). |
| `screenshot.js` | Two modes. |
| `visual_compare.js` | Decodes PNG pixels using Node built-ins (no image dependency), checks dimensions, reports changed-pixel percentage plus average RGB-channel delta,… |
| `visual_compare_smoke.js` | Five deterministic checks for PNG round-tripping/checksum validation, changed-pixel metrics, diff-image encoding, and dimension mismatches. |
| `hub_smoke.js` | Canonical validation for the two-level hub (game/index.html): checks landing/sub-hub navigation, all game routes, the Explorer entry, absence of… |
| `memory_smoke.js` | Canonical validation for Памтилица (Memory, task 65) — 21 checks: board boots 16 cards, status line starts 0/8 pairs · 0 moves, card back uses the… |
| `candy_smoke.js` | Canonical validation for Слагалица бомбона (Candy, task 66) — 12 checks: boots at level 1 (4×4, 16 tiles, farm set), label + empty progress bar, grid… |
| `puzzle_smoke.js` | Canonical validation for Слагалице (Puzzle, task 67) — 16 checks: boots with scene preview + start button, pixel-verified painted image has NO title… |
| `tracing_smoke.js` | Canonical validation for the Писање (Tracing) free-draw game — 22 checks: hub, dashed guide present, layout (no ref/caption overlap), pointer… |
| `tracing_probe.js` | Matching-metric table for threshold tuning. |
| `dilate_test.js` | Standalone check that the integral-image dilate() in tracing.js produces a correct symmetric dilation (center/corner/corners cases). |
| `coloring_smoke.js` | Canonical validation for Бојење (Coloring, task 119) — 28 checks: palette renders every SERBIAN.colors entry (count derived in-test, not pinned),… |
| `classroom_smoke.js` | Validation for the Учионица kids tier (Phase 3, "За децу" quiz games) — 33 checks: two-set hub (6 baby + 4 kids buttons + labels), 4 category tabs… |
| `piano_smoke.js` | Canonical validation for Клавир (Piano, tasks 58/121, V2.6) - 30 checks: boots to 8 keys with free play active and the song panel hidden, free-play… |
| `driving_smoke.js` | Canonical validation for Возила (Driving, task 60) — 24 checks: boot + engine/theme HUD match, page chrome + background, 10 world configs, 10 music… |
| `ocean_smoke.js` | Canonical validation for Океан (Ocean, task 61, fly mode, V2.7) — 27 checks: boot + engine/theme HUD match, page chrome + background, fly controls… |
| `dino_smoke.js` | Canonical validation for Дино (Dino, task 62, ground mode) — 40 checks: boot + engine/theme HUD match, page chrome + background, ground controls… |
| `space_smoke.js` | Canonical validation for Свемир (Space, task 63, fly mode, final Phase 4 game) — 28 checks: boot + engine/theme HUD match, page chrome + background,… |
| `kitty_smoke.js` | Canonical validation for Мала истраживачица (Мала истраживачица, formerly Папир Маца/Paper Kitty) — 30 checks: boot + world HUD, 11 worlds × 4… |
| `adventure_smoke.js` | Canonical validation for the shared adventure engine (game/games/adventure.js) — 25 checks: drive mode (driving.html), ground mode (dino.html), and… |
| `racing3d_smoke.js` | Canonical validation for the 3D Мала тркачица 3Д (three.js racer, task 100) — 32 checks: boots to window.__r3d, canvas + Serbian HUD (Ливада / Круг… |
| `fastcat_smoke.js` | Canonical validation for Брзи мачак (Fastcat, task 254) — 67 checks: char picker, auto-run, jump/slide, coin→meter deltas, super gate + drain + 2× pace + pickup-free lapse, all four hazards with hit-flag anti-vacuous proofs, win/replay (round yellow icon-only replay button clicked for real, its glyph pinned as rendered — painted box ≥24px + computed dark-plum colours), play-test 5 (⚡ starts ready on a full meter with pulse + rotating ring, pointerdown activation while other controls are held, pickups prolong the super blast, win auto-advances to the next level), play-test 8 (3s blast — SUPER_FRAMES 180, cave = warm torch-lit rock with a hanging CEILING sampled from real canvas pixels, cave-vs-night warm/cool distinctness), play-test 6 (⚡ gap ≥40px, СЛЕДЕЋИ СВЕТ always offered incl. the last-level wrap to a new tour), play-test 7 (СЛЕДЕЋИ СВЕТ asserted COMPUTED-visible + clear green — the old inline style.display check was vacuous), themed levels (🌍 picker with 10 open choices, per-level pickup emoji/palette/music/seed, ♪ toggle on the shared pkMusic key), control geometry (⚡ stacked above jump; 🌍/♪ top-right), portrait playability, route contract. |
| `sync-docs.sh` | Publish helper: replaces the ENTIRE docs/ content with the current game/ content (GitHub Pages serves main → /docs). |
| `build_offline.js` | Generates the two service-worker inventories: game/sw-cache-list.json (what the worker pre-caches) and game/offline-manifest.json (canonical… |
| `build_offline.ps1` | The older PowerShell builder, kept as a Windows alternative. |
| `check_docs.js` | Doc guard (part of `check_fast`): size budgets for the startup docs, dead relative links, finished tasks left in `ACTIVE.md`. `--selftest` runs its negative tests. |
| `archive_tasks.js` | Session-end archiver: moves finished entries from `project/tasks/ACTIVE.md` to `archive/tasks/` and updates `INDEX.md`. `--dry-run` previews. |

## Commands

```
node tools/check_all.js                # THE ritual: node --check over game/ + tools/, then the whole battery
node tools/check_all.js --docs         # + tools/sync-docs.sh (run this whenever game/ changed)
node tools/check_all.js --docs --offline  # + tools/build_offline.js + validate_offline.js (only for new/changed assets)
node tools/check_syntax.js         # just node --check over game/ + tools/ (no battery) — what CI's fast job runs
node tools/validate_offline.js     # offline inventory validator (10 checks + report) — what CI's fast job runs
node tools/run_all.js --since HEAD     # just the smokes covering uncommitted game/ changes
node tools/run_all.js --game tracing   # one game
node tools/run_all.js --watch          # re-run affected smokes on every game/ save (dev loop)
node tools/run_all.js --list           # what the battery contains
node tools/run_all.js --list --json    # same, as a JSON array (this is what generates CI's matrix)
node archive/tools/plan_progress.js    # plan status line: x/y done, current task (reads the plan table)
node tools/dilate_test.js       # visual: r=1 dilation is a 3x3 box
node tools/tracing_probe.js     # metrics table (uses window.__traceDebug)
node tools/play_matrix.mjs      # chromium + webkit across 5 viewports (optional gate)
node tools/axe_check.js --report # blocking serious/critical WCAG scan, all 18 surfaces
node tools/hub_smoke.js         # hub landing + sub-hub navigation smoke test — expect ALL PASS
node tools/memory_smoke.js      # memory (Памтилица) smoke test — expect ALL PASS
node tools/candy_smoke.js       # candy (Слагалица бомбона) smoke test — expect ALL PASS
node tools/puzzle_smoke.js      # puzzle (Слагалице) smoke test — expect ALL PASS
node tools/tracing_smoke.js     # full game smoke test — expect ALL PASS
node tools/classroom_smoke.js        # classroom kids-tier smoke test — expect ALL PASS
node tools/coloring_smoke.js     # coloring (Бојење) smoke test — expect ALL PASS
node tools/piano_smoke.js       # piano (Клавир) smoke test — expect ALL PASS
node tools/racing3d_smoke.js    # 3D racing (Мала тркачица 3Д) — expect ALL PASS
node tools/driving_smoke.js     # driving (Возила) smoke test — expect ALL PASS
node tools/ocean_smoke.js       # ocean (Океан) smoke test — expect ALL PASS
node tools/dino_smoke.js        # dino (Дино) smoke test — expect ALL PASS
node tools/space_smoke.js       # space (Свемир) smoke test — expect ALL PASS
node tools/kitty_smoke.js       # Мала истраживачица (kitty) smoke test — expect ALL PASS
node tools/adventure_smoke.js   # shared adventure engine smoke test — expect ALL PASS
node tools/fastcat_smoke.js     # Брзи мачак (fastcat) smoke test — expect ALL PASS
bash tools/sync-docs.sh         # mirror game/ -> docs/ for GitHub Pages
```

## Rules / gotchas

- **Stale assertions:** when a check fails, first read the live page state printed
  in the FAIL info and decide whether the *game* or the *assertion* is wrong.
  Fix assertions to the observed truth — never change `game/` to satisfy a test.
  A count taken from a source file (e.g. a hub tile count) should be **derived**
  in the test, not hard-coded, or the next added game re-breaks it.
- **`game/shared/main.js` boots each standalone page exactly once** via a
  `started` guard. Do not remove it and do not add a second call site: start
  functions bind click/pointer listeners, so booting twice doubles every
  interaction (that bug made one ➡️ tap advance 3 scenes).

- **Deployment:** `game/` is the single source of truth; `docs/` is only the
  published copy. On every change to `game/`, run `tools/sync-docs.sh` (it
  deletes `docs/` and re-copies `game/`) and push to `main`. Never edit
  `docs/` by hand.

- Always test over HTTP, never `file://` — `file://` breaks audio and throws
  Unsafe-attempt warnings. `headless.js` serves `game/`
  automatically.
- Each `start()` uses a fresh unique Chrome profile, so parallel harnesses
  cannot collide; `close()` kills that run's Chrome by profile tag. If a run is
  interrupted and a later run says "Chrome did not start", kill stale Chrome:
  `Get-Process chrome | Where-Object { $_.CommandLine -match 'pkv-' } | Stop-Process -Force`.
- `celebration.js` caches its overlay element in a closure — a harness must hide
  overlays by removing the `.show` class, never by removing the element.
- `window.__adv` (adventure engine debug handle) exposes `cameraX`, `lastHitAt`
  etc. as **getter-only** — assignments silently no-op (and throw in strict
  mode). Reset state with `a.loadWorld()` instead; the obstacle-hit checks must
  wait ≥1100 ms after `loadWorld()` for the `lastHitAt` cooldown to expire.
- `tracing_probe.js` needs the `window.__traceDebug` hook that `tracing.js`
  exposes (`matchResult` / `refGrid` / `inkGrid`) — do not delete it.
- Matching rule to re-verify after touching `tracing.js` constants:
  pass = `coverage >= MIN_COVER && near >= MIN_NEAR && ink <= MAX_INK`, where
  `near` is the fraction of ink cells within 2 grid cells of the guide line.
  Measured separation: genuine traces `near ≈ 0.98–1.0`, blobs/scribbles ≤ 0.70.
