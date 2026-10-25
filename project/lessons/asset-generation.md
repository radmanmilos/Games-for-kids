# Asset generation — tooling and process

Read this before generating any image asset. It complements `resources/General_reviews/Asset_Generation/MANDATORY_ASSET_GENERATION_PREFLIGHT.md` (the preflight rules) and `STYLE_BIBLE.md` (the visual standard). This file records the **tooling and the repeatable command-level process** that a new session needs.

## Where things live

- Bundle (WIP images): `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`
- Prompts: `resources/General_reviews/Asset_Generation/prompts/<subject>.md` (category prefix dropped from filename, e.g. `banana.md`, `water-drop.md`)
- References: `resources/General_reviews/Asset_Generation/Reference/bear.png` (canonical anchor), `Reference/star.png` (canonical secondary)
- Inventory: `resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md` (rows + Technical QA facts table)
- Progress ledger: `resources/General_reviews/Asset_Generation/PROGRESS.md`
- Style standard: `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md`
- Usage log: `tools/.cache/asset-usage.json` (git-ignored)

## Tooling

- `tools/asset_generate.js` — generate one candidate via Cloudflare Workers AI (`@cf/black-forest-labs/flux-2-klein-4b`). Free tier = 10,000 neurons/day, resets 00:00 UTC.
  - Usage: `node tools/asset_generate.js --prompt <brief.md> --out <file.png> [--refs N] [--ref-files a.png,b.png] [--subject-ref <file>] [--dry-run] [--creds <file>]`
  - `--dry-run` prints the composed prompt and references without calling the API.
  - `--subject-ref <file>` sends that file as image 0 with role *subject* (copy its shape + colours, take only style from family refs). Use when words cannot pin the silhouette (finding 9).
- `tools/asset_qa.js <file.png> --against Reference/bear.png` — technical QA (canvas, alpha, palette, palette-match, small-size legibility proxy).
- `tools/asset_refpool.js` — builds/lists the approved reference pool (`--pick N`, `--json`).
- `tools/asset_upscale.js` — Lanczos-3 resample to family resolution (1024²), never repaint.

## Credentials

Never committed. Read from (in order): env vars `CF_ACCOUNT_ID` / `CF_API_TOKEN`, a file passed via `--creds`, or the drop-in file `%TEMP%\opencode\cloudflare-creds.json` (PowerShell writes a BOM; the script strips it). In this repo the user keeps them at `tools/vendor/Cloudflare-credentials,json` (git-ignored). Pass with `--creds "tools/vendor/Cloudflare-credentials,json"`.

## Naming convention

- Inventory ID keeps the category prefix: `food-banana`, `animal-dog`, `object-water-drop`.
- Bundle filename drops the category prefix: `banana.png`, `dog.png`, `water-drop.png` (matches `food-apple` → `apple.png`, `animal-dog` → `dog.png`).
- Prompt filename drops the category prefix: `banana.md`, `water-drop.md`.

## Reference sets

- Default `pickReferences` = canonical bear + star + top painted by palette similarity. Override with `--ref-files` when the subject needs specific guidance.
- For a cool-coloured subject inside a warm family, send a cool reference (e.g. `water-drop.png`, `elephant.png`) and state the colour explicitly, banning the grey/muddy variants (see water-drop iteration 1 → 2).
- For a food, use bear + star + bone (simple-object exemplar). State the colour explicitly; the family is warm so warm colours sit naturally, but state it anyway.

## Standard per-asset workflow

1. Preflight (MANDATORY_ASSET_GENERATION_PREFLIGHT.md §1–6): inspect source-of-truth files, confirm eligibility/approval, search for duplicates, decide generation is right, define the brief, run the pre-generation challenge. Stop if anything is unknown.
2. Write the prompt brief at `prompts/<subject>.md` following the established format (Replaces / Inventory row / Why / Category / References / Canvas / Background / `--- prompt ---` / prompt body / exclusions).
3. Dry-run: `node tools/asset_generate.js --prompt ... --out ... --creds ... --refs N --ref-files ... --dry-run` to inspect the composed prompt.
4. Generate: same command without `--dry-run`. Output goes to the bundle as `<subject>.png`.
5. Run QA: `node tools/asset_qa.js <file> --against Reference/bear.png`.
6. Present the file + QA metrics to the user for visual review (the assistant cannot see images). Wait for explicit approval.
7. On approval:
   - Update `ASSET_INVENTORY.md`: row status → `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`, add WIP asset path; add a row to the Technical QA facts table.
   - Append a section to `PROGRESS.md` (preflight, category, brief, references, generation, QA, approval, "not done here").
   - Commit with `Agent: OpenCode/Big Pickle` trailer and push to `main`.
8. Move to the next candidate.

## Status discipline

Never conflate: Proposed / Eligible / Approved-for-generation / Generated / Reviewed / User-approved / Production-ready / Integrated / Committed / Verified. Generated ≠ approved. No runtime integration, glyph swap, smoke, screenshot refresh, offline build, or sync-docs unless separately requested — `game/` is not touched by this pipeline.

## Cost planning

~120 neurons per 1024×1024 candidate with 3 references. Free tier 10,000/day ≈ 80 candidates/day. The local log (`tools/.cache/asset-usage.json`) is per-run planning only; read the Cloudflare dashboard for the real total.