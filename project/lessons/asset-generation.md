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
- `tools/asset_cutout.js` — the missing cut-out step: edge flood-fill matte on an opaque painted PNG, drop enclosed
  paper specks, frame the subject, encode a 512² alpha WebP (needs `ffmpeg` with `libwebp`). Use it on every candidate
  before it enters `game/assets/art/`; it prints format/alpha/corner evidence and exits non-zero if the result is not
  real alpha art.
  `node tools/asset_cutout.js <bundle>/<subject>.png --out game/assets/art/<stem>.webp`

## Credentials

Never committed. Read from (in order): env vars `CF_ACCOUNT_ID` / `CF_API_TOKEN`, a file passed via `--creds`, or the drop-in file `%TEMP%\opencode\cloudflare-creds.json` (PowerShell writes a BOM; the script strips it). In this repo the user keeps them at `tools/vendor/Cloudflare-credentials.json` (git-ignored). Pass with `--creds "tools/vendor/Cloudflare-credentials.json"`.

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

## Before a file enters `game/assets/art/` — verify, do not assume (task 358)

The Workers AI endpoint returns **opaque rgb PNGs**. Renaming one to `.webp` produces a file that
passes every review, passes `git`, and then renders as a cream square in the game. That is exactly
what happened to `crab`, `octopus`, `shark`, `sun`, `sunrise` and `sunset` (tasks 350/351): 6 files,
1024², rgb24, 0% alpha, 7.6 MB of an 11.9 MB payload.

Every glyph asset must clear these four checks **before** it is committed, and `node tools/check_art.js`
(task 360) enforces them in `check_fast`:

1. **Magic bytes** — `require('./lib/imagefile').detectFormat(bytes).format === 'webp'`.
   A `.webp` name is not evidence.
2. **Canvas** — 512×512 for glyph art (1024² only in the WIP bundle).
3. **Alpha** — corner pixels must be transparent and the background a real cut-out, not a painted
   matte. `node tools/asset_qa.js <file>` prints `alpha opaque/transparent/partial` and `cornerA`;
   "GENERATED / USER-APPROVED" in the inventory says nothing about alpha.
4. **A consumer** — a registry entry (or an explicit decision that the file is scenery). An art file
   with no consumer is dead weight in the offline manifest.

Cut-outs are not a step the generator performs. There is no background remover in `tools/`; the 155
correct files came from a one-off cutout pass (task 296). When adding art, budget for that step
explicitly instead of assuming "generated" means "ready".

Full-bleed scene art is legitimately opaque — keep it out of `game/assets/art/` (it lives in
`game/assets/scenes/`) so the glyph alpha gate stays strict.

## Cost planning

~120 neurons per 1024×1024 candidate with 3 references. Free tier 10,000/day ≈ 80 candidates/day. The local log (`tools/.cache/asset-usage.json`) is per-run planning only; read the Cloudflare dashboard for the real total.