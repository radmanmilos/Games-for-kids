# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `fix/visual-ux-priorities-task-380`, based on main `d82a0d2`.

## Current state

- **Tasks 379 / PR #13 — merged.** 164-image battery (108 default + 56 PLAY), all provenance at task 379; visual confirmation report merged as `d82a0d2`; CI green.
- **Task 380 — DONE, on the branch, not yet merged.** Hub learning tile restored (art pass no longer walks the tile label; four centred glyph cells + intact `УЧЕЊЕ` label), parent multiplication gate moved directly under the heading so all four answers fit the first 844×390 viewport, and compare/sorting/maze + shared adventure headers compacted at short heights without shrinking any touch target.
- **Evidence:** 36 PNGs refreshed for the 9 affected pages with provenance at task 380; short-landscape audit **13 OK / 14 WARN / 0 FAIL** (parent moved WARN→OK); `check_docs` OK; affected smoke battery green; offline manifest rebuilt and `docs/` re-synced.
- **Remaining WARNs (by design):** compare 89, sorting 92, maze 92, arcade four 83 px against the conceptual 56–72 px budget — no clipping, no FAIL, approximate metric. Plus stage-led "no header text" WARNs and the known `animal_counting` selector false positive.
- **Next:** merge the branch, then optionally fix the audit title selector (`h2`/`.count-title`).

### CI follow-up (same branch)

The first CI run on this branch (`42101432563`) went red on one `compare_smoke` leg with a Chrome boot crash and **zero checks** — the documented environmental class, not a regression: its identical twin leg passed 29/29. Root cause of the twin: `run_all.js --affected` normalised names *after* the `Set` dedupe, so `compare_smoke` and `compare_smoke.js` both survived and four smokes were scheduled twice (`compare`, `hub`, `maze`, `sorting`, `sw_update`). `normalizeSmokes` now dedupes after adding the extension; `--affected` and `--since` emit 37 unique legs instead of 42 with 5 duplicates. Editing `tools/run_all.js` escalates the next CI run to the full battery by design.

## Validation

- `node tools/screenshot.js --review=Screenshot_Review --pages=hub,parent,compare,sorting,maze,driving,ocean,dino,space --task=380` — 36 captures, no browser runtime errors.
- `node tools/short_landscape_audit.js` — 0 FAIL.
- `node tools/check_docs.js` — OK (5 budgets, 48 links).
- `node tools/run_all.js --since 208f9fb` — all affected smokes pass (parent 46/46).
- `node tools/validate_offline.js` — all 10 inventory checks pass.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- Keep all child touch targets large; task 380 did not reduce any interactive target size.
- No manual child/family playtesting is claimed without evidence.
