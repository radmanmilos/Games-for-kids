# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-04 **App version:** 3.0.1 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids **Branch:** `main`

## Where we are

- **Art audit (2026-11-04, OpenCode/Big Pickle) — findings only, nothing fixed yet.** Full read-only pass over
  `game/assets/art/` (161 files), `game/data/art-registry.js` (147 glyphs → 142 stems) and every render site (215
  distinct pictographs). Four defect classes, now queued as tasks 358–362:
  1. **6 files are opaque PNGs named `.webp`** — `crab`, `octopus`, `shark`, `sun`, `sunrise`, `sunset`: rgb24 1024²,
     0% alpha, 7.6 MB of the 11.9 MB payload (commits `3a64237`/`487c1aa`/`4301b13`, tasks 350/351). Children see
     cream squares in ocean, classroom time tiles and the cat-forest day/night toggle.
  2. **15 painted illustrations have no consumer** — `animal-crab/-octopus/-dolphin/-whale/-dinosaur/-ladybug`,
     `flower-hibiscus`, `lollipop`, `food-rice-ball`, `object-anchor/-flag/-gift/-money-bag`, `owl`, `plant-clover`,
     `puzzle-piece` (+ `card-stack`, `meteor`, `puddle` genuinely redundant).
  3. **Surfaces never wired to the pipeline** — the hub (`index.html:331-339` loads no art), classroom/tracing/matching
     static buttons, `racing3d.mjs:805-821` decor billboards drawn with `fillText`, world picker raw emoji.
  4. **Animal Puzzle never got scene art** — task 352 is marked DONE but `animal_puzzle.js` was last touched at
     `0ca3c0e`; scenes are canvas gradients, the sea scene falls back to `🐠/🐬` emoji and the opaque `🦀`.
- **Root cause:** no gate enforces format/alpha/size/consumer for `game/assets/art/`; `detectFormat` and `asset_qa`
  can measure all of it but are never run over the shipped folder. Lesson recorded in
  `project/lessons/asset-generation.md` ("Before a file enters `game/assets/art/`").
- **Git health:** clean tree, in sync with `origin/main`, CI + CodeQL green, local `check_fast` 9/9.

## Open tasks

- **358** Art integrity: re-encode the 6 opaque/mislabelled assets, remap crab+octopus, register every orphaned file.
- **359** Painted art on the last emoji surfaces: hub, classroom/tracing/matching, racing3d decor, puzzle sea.
- **360** Art-integrity gates in `check_fast` (`tools/check_art.js`: format, size, alpha, consumer).
- **361** Animal Puzzle painted scene backgrounds (8 scenes, `game/assets/scenes/`).
- **362** Remaining unmapped child-facing glyphs: generate or record as accepted emoji.
- **328** DEFERRED — hub/nav tile icons and shell-chrome glyphs; needs a user decision (see `DECISIONS.md` line 16).

## Security & privacy

- Gate: `node tools/check_secrets.js` (`--quiet` for exit code only). A finding means: remove the value, **rotate** the
  credential, then re-commit — never add an allowlist entry to "fix" it.
- Server-side nets: secret scanning + push protection enabled; code-scanning 0 open.
- `.gitignore` protects `tools/vendor/` (the Cloudflare pair) and `.env`; `docs/` mirrors `game/` and must never hold
  credentials.

## Asset generation

- Production art: **161 files** under `game/assets/art/`, of which **155** are real 512² alpha WebPs. Registry:
  **147 glyphs / 142 stems**. `game/shared/art.js` exposes `url`, `html`, `fill`, `fillAttr`, `image`, `draw`, `_BASE`.
- Cloudflare credentials are local only: `tools/vendor/Cloudflare-credentials.json` (git-ignored, restored by hand after
  a fresh clone). Generation needs `--creds` and a user visual approval step.

## Validate

- `node tools/check_fast.js` — **9/9 green** (`syntax`, registry, CI workflow, `secrets/credentials`, scan-alert guards,
  generated artifacts, offline inventory, docs, hub smoke). This is what CI's `fast` job runs.
- `node tools/check_release.js` — release gate before a release (fast gate + full smoke battery).
- `node tools/check_art.js` — new in task 360: format/size/alpha/consumer gate for `game/assets/art/`.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots.
  Never edit `docs/` by hand.
- Never commit Cloudflare credentials. Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- **Tests must be updated to follow implementation changes.**
