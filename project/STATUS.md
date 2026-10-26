# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-26 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99`, CI `39491259589` green. CF-00…CF-21 (tasks 261–283) DONE/archived. The reference-app "look & feel" phase is parked at the user's request. **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Tasks 284–286 DONE (2026-10-21)** — racing3d steering, smoke hardening, de-flake.
- **Task 287 DONE (2026-10-22, OpenCode/Big Pickle)** — Asset Generation pipeline and the `animal-bird` candidate.
- **Task 288 DONE (2026-10-22, OpenCode/Big Pickle)** — `animal-rooster` candidate and bundle audit; rooster user-approved.
- **Task 290 DONE (2026-10-22)** — `object-water-drop`; user-approved, archived and indexed on 2026-10-25 (the bookkeeping had not reached `main`).
- **Task 291 DONE (2026-10-25, OpenCode/Big Pickle)** — generation-process carry-over only: `tools/asset_generate.js --subject-ref` (image 0 = the *subject*: copy its shape and colours, take only the rendering style from the family references) plus finding 9 in `ASSET_INVENTORY.md`. The local 2026-10-22 soap render and `prompts/soap.md` were **discarded at the user's request**; the `soap.png` on `main` (2026-10-23 session, `38e22de`) stands. Committed `c10a59b`.
- **Task 292 DONE (2026-10-25, OpenCode/Big Pickle)** — resolution pass on the nine smallest approved files (`duck`, `cow`, `fish`, `star`, `apple`, `dog`, `cat`, `bear`, `pig`): resampled to 1024x1024 with the new `tools/asset_upscale.js` (Lanczos-3, same art, no repaint), verified at correlation 0.9587-0.9995 against the originals, **user-approved**, old files removed and the `_1` copies renamed to the original names. Docs updated with the new sizes.
- **Task 289 IN PROGRESS** — asset-bundle reconciliation. Bundle holds **91 PNGs**. The current generation queue through `cactus.png` is approved and documented; the volcano required one taller/more-lava retry. Existing measured candidates (`soap.png`, `sunflower.png`, `butterfly.png`, `acorn.png`, `mushroom.png`, `egg.png`) still await visual review where noted in the inventory. No runtime integration. Continue one missing bundle item at a time, choosing references from existing project images for each subject rather than defaulting to bear/star.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.

## Asset-generation next steps

1. Continue the user's one-by-one sequence of assets missing from the WIP bundle. Preflight each inventory candidate and select the best-matching existing references; user reviews each generated image before its inventory approval/commit.
2. **User visual review** of measured candidates (`soap`, `sunflower`, `butterfly`, `acorn`, `mushroom`, `egg`). No production copy or runtime integration before approval.
3. **Egg review** (`egg.png`, iteration 2: 1024×1024 opaque, proxy 38.8 vs `bone.png` 36.8) — still awaiting the user's eyes.
4. **Runtime integration of approved assets** stays a separate future task: copy only approved assets to `game/assets/images/`, swap glyphs, run smokes, rebuild offline artifacts, sync docs, refresh screenshots.

## Validate

`node tools/check_fast.js` — **8/8 green locally on 2026-10-25**. The fix for the `AGENTS.md` byte budget shipped in `28d9900`; CI `40216376927` passed its fast gate and Pages deployment. No `game/` source changed, so no game smokes, screenshot refresh, offline build or `sync-docs.sh` were needed.

## Rules of the road

- `game/` changes ⇒ `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Before touching a risky area read its lesson file: the table in `AGENTS.md`. Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
