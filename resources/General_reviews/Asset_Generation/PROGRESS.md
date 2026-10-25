# Petra's World — Asset Generation Progress

This file is the single progress tracker for the emoticon replacement project. Update it as source inventory, user approvals, generation, and QA proceed.

## Current phase

**Phase 1 — Source audit and inventory.** A literal pictograph scan has now been run across the first-party runtime JS/MJS/HTML/CSS/JSON files in `game/` (excluding the third-party minified Three.js bundle). The inventory has been expanded and duplicate asset IDs consolidated. It remains a review draft: every candidate's visual role and render scale still need final semantic verification and user approval. One generated object candidate (`object-bone`) has been user-approved as an illustration candidate and recorded below; it is not yet designated production-ready.

## Fixed decisions

- [x] Use the exact user-supplied brown bear as the main style reference.
- [x] Use the exact user-supplied plain golden star as the matching secondary reference.
- [x] Keep Explorer character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] Keep Kitty character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] In 3D Racing, replace only emoji glyphs; preserve 3D models, geometry, environment, and rendering.
- [x] Preserve suitable existing illustrations; do not regenerate assets just to make them new.
- [x] Keep standard interface controls as SVG/CSS icons or text where appropriate.
- [x] Store project documentation and prompts in `resources/`; approved runtime assets only in `game/`.
- [x] Run literal emoji/pictograph scan across first-party runtime JS/MJS/HTML/CSS/JSON files under `game/` (excluding third-party minified Three.js).
- [x] Add initial source-confirmed candidates from animals, animal counting, candy, sorting, spatial, classroom, sequencing, rhythm, piano, maze, animal puzzle, adventure-mode fish, shared celebration, and 3D Racing page UI.
- [x] Enumerate the emoji-backed Serbian phonics data and identify dynamic compare/adventure/world-theme pools; final semantic/render-path verification remains.
- [x] Scan canonical `game/` pages, game modules, shared modules, CSS, manifests, and runtime configs for literal pictographs; comments/docs and generated values require judgment.
- [ ] User approves final asset inventory.
- [ ] Generate and review first small test batch.
- [ ] User approves the test batch against the fixed references.
- [ ] Generate remaining approved assets in manageable batches.
- [ ] Run image transparency, dimensions, file-size, naming, and visual consistency checks.
- [ ] Prepare final implementation handoff for implementation AI.
- [ ] Implementation AI swaps only the approved emoji render sites and runs regression checks.

## Source-confirmed starting findings

### 3D Racing — `game/pages/racing3d.html`

- [x] 🏎️ page title decoration — review whether to keep as a small illustration or remove.
- [x] 🌸 flower counter — review for a small matching flower asset.
- [x] 🌍 world selector icon — prefer a consistent UI icon or small simple illustration; reuse it wherever repeated.
- [x] 🔊 / 🔇 music state — UI icon task, not watercolor illustration.
- [x] 🏁 win/start finish decoration — review for a small matching flag asset or remove decoration.
- [x] ➡️ next-world arrow — UI icon task, not watercolor illustration.
- [x] 🔄 restart arrow — UI icon task, not watercolor illustration.
- [x] 🏎️ favicon — app-icon task, not part of the object asset batch.
- [x] Audit `game/games/racing3d.mjs` render/UI path. Confirmed emoji UI glyphs (e.g. sound state/finish fallback); 3D pickups/obstacles are mesh geometry and remain out of scope.

## Batch log

| Batch | Scope | Status | Notes |
|---|---|---|---|
| B0 | Source audit and inventory | IN PROGRESS | Inventory v0.4 has expanded source coverage and deduplicated repeated asset IDs. Literal scan completed; semantic candidate approval is still pending. |
| B1 | 1–3 test objects selected from approved inventory | NOT STARTED | Wait for user approval of final inventory. |
| B2+ | Small generation batches | NOT STARTED | Avoid wasting free-tier image generations; do not regenerate approved assets. |
| QA | Transparency, dimensions, consistency, runtime/offline checks | NOT STARTED | Use approved assets only. |
| Handoff | Asset map and implementation instructions | NOT STARTED | Final handoff must list exact source render sites and filenames. |

## Asset status ledger

Add one row per asset. Keep this table synchronized with the inventory.

| Asset ID | Replaces glyph / current visual | Used by | Prompt/reference saved? | File | Status | QA / notes |
|---|---|---|---|---|---|---|
| `object-bone` | 🦴 | `game/games/spatial.js` — “Where is the bone?” task | Prompt was generated in chat; no separate prompt file verified | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bone.png` | GENERATED / USER-APPROVED CANDIDATE | User praised the result and reported adding it to the repo; production readiness, transparency, dimensions, file size, and in-game scale not independently checked |

## Decisions / issues

- The broad preliminary inventory document was intentionally superseded by the narrower emoticon-only scope. Do not generate all of its speculative candidates.
- The exact original reference image files should be stored in `references/` before production generation if they are not already available as project files.
- Source inventory must distinguish emoji pictographs from SVG controls, CSS geometry, ordinary text, and actual 3D models.


## Latest source-audit update — 2026-10-11

- [x] Scanned the canonical first-party runtime source/data/page/style/manifest files for literal emoji/pictograph characters.
- [x] Expanded inventory with additional concepts from Serbian phonics, comparison/spatial activities, day/night classroom scenes, seasonal racing scenery, and page-level UI.
- [x] Consolidated duplicate asset IDs and merged their known use sites (including cow glyph variants and repeated shell rows); inventory table IDs are now unique.
- [ ] Manually verify every proposed illustration against actual render scale, semantic teaching purpose, existing PNG assets, and excluded character/3D areas.
- [ ] User approves the final treatment of each row before any generation begins.


## Asset update — 2026-10-16

- [x] Recorded `object-bone` as generated at `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bone.png` after verifying the path exists on `main`.
- [x] User praised the bone result and reported adding it to the repository; this is recorded as approval of the illustration candidate, not as proof of production QA.
- [ ] Verify image dimensions, file size, alpha/transparency, and visual legibility at the actual spatial-game render size.
- [ ] After QA, decide whether to promote the asset to a production-ready location and update its inventory location accordingly.


## Asset update — 2026-10-18

- [x] Verified commit `bd526899f54940e627a4c5f7c3402e4c9a55b048` adds `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/elephant.png` to `main`.
- [x] Recorded `animal-elephant` in the asset inventory as a **generated, user-approved candidate**.
- [ ] Independently inspect the committed PNG at full size and verify dimensions, file size, alpha/transparency, edge quality, and legibility at the actual animal-flashcard render size.
- [ ] Compare the committed file directly with the canonical bear/star reference images before declaring style QA complete.
- [ ] Decide whether to promote it to a production-ready location after QA; it is not integrated into runtime and is not marked production-ready.
- Note: the user approved the illustration in conversation. That approval does not by itself establish technical QA or runtime integration.


## Animal asset update — 2026-10-18

- [x] Verified on `main` that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/lion.png` exists (GitHub returned blob SHA `c493a9e7bc3c78d1b177889f6a874dc34a64b895`).
- [x] Verified on `main` that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/frog.png` exists (GitHub returned blob SHA `3a46c83840b1e0babbcda6eb71de65b621202411`).
- [x] Updated the asset inventory rows for lion and frog to record their WIP paths.
- [ ] Inspect both committed PNG files at full size and verify dimensions, file size, alpha/transparency, edge quality, and legibility at the actual animal-flashcard render size.
- [ ] Compare both images directly with the canonical bear/star references and existing animal candidates.
- [ ] Decide whether either candidate is ready for promotion; neither is marked production-ready or integrated into runtime.
- Note: GitHub's file fetch returned empty Base64 content for lion and frog despite returning blob SHAs. Existence is verified; image bytes and technical properties were not verified by that fetch.

## Animal asset update — 2026-10-19

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/pig.png` exists on `main`; GitHub blob SHA: `ef3e52435f005acd57f06d4ff9eabed4690e3b50`.
- [x] Updated the `animal-pig` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Inspected the actual repository image. PNG IHDR reports 1448 × 1086 pixels, 8-bit RGBA (color type 6). The illustration is readable and broadly matches the soft, warm storybook direction.
- [ ] Verify actual alpha values/background transparency, file size, edge quality, and visible colored fringes around the silhouette; RGBA support alone does not prove transparent background pixels.
- [ ] Compare pig directly against the canonical bear/star references and related animal candidates at full size and representative game sizes.
- [ ] Confirm whether the same pig image reads correctly in both counting and candy-game contexts; no runtime integration or game tests were performed as part of this update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated by this documentation update.

## Animal asset update — 2026-10-19 (horse)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/horse.png` exists on `main`; GitHub blob SHA: `a00b4f51b379880f7a8d38dc0796e0e2567ade00`.
- [x] Updated the `animal-horse` inventory row with its verified WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated horse illustration shown in this conversation for subject readability and broad storybook-style fit.
- [ ] Inspect the exact committed PNG bytes at full size and verify dimensions, file size, actual alpha/transparency, edge quality, and any colored fringes. The current GitHub file fetch returned an empty Base64 payload despite confirming the blob/path, so those technical properties remain unverified.
- [ ] Compare the committed horse file directly against the canonical bear/star anchors and other animal candidates at full size and representative in-game sizes.
- [ ] Confirm the horse image's intended rendering contexts (animal memory, candy game, Serbian phonics) and whether its background/crop is suitable in each. No runtime integration or game tests were performed for this update.
- Status remains a WIP candidate; it is not marked production-ready or runtime-integrated.

## Next-asset analysis — chicken vs. existing duck candidate

- **Recommended next action: audit the existing duck candidate before generating another animal.** The inventory already points to `assets_work_in_progress_bundle/duck.png`, so mandatory preflight requires checking whether it can be accepted, refined, or rejected before spending another generation attempt.
- If the duck is not suitable, **chicken** is the next sensible new-animal candidate: current source uses it in counting and candy contexts, and the inventory also has a separate rooster use in the farm puzzle/scenery. Before generating, reconcile whether a single chicken illustration can clearly serve both chicken and rooster contexts or whether those should remain distinct.
- Avoid generating a duplicate chicken until the existing duck file has been inspected and the chicken/rooster semantic decision is recorded. Keep the fixed bear/star references as style anchors; do not treat the horse as a new approved style exemplar until the user explicitly approves the specific image.

## Animal asset update — 2026-10-20 (chicken)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chicken.png` exists on `main`; GitHub blob SHA: `ea7c737007bf7d198d8a45e36616c6fb3e86d523`.
- [x] Updated the `animal-chicken` inventory row with the verified WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated chicken image shown in the conversation: a recognizable, warm watercolor hen with a cream/tan body, red comb/wattle, yellow beak/feet, and cream background. Its feather detail and eye highlights are more pronounced than the canonical bear; consistency at game size still needs review.
- [ ] Inspect the exact committed PNG bytes and verify dimensions, file size, actual alpha/transparency, edge quality, and colored fringes. GitHub confirmed the blob/path, but the file-fetch endpoint returned an empty Base64 payload, so technical image properties cannot be confirmed from that response.
- [ ] Compare the committed chicken file directly against bear/star references and the other animal candidates at full size and representative game sizes.
- [ ] Confirm whether the image is intended only for counting/candy, or whether any rooster-specific farm puzzle/scenery use exists that must remain visually distinct. No runtime integration or tests were performed as part of this documentation update.
- Status remains a WIP candidate: not marked production-ready or runtime-integrated.

## Next-asset analysis — after chicken

- **Recommended next action: audit the existing cow candidate** at `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png` before generating another image. The inventory shows cow use across animal flashcards, counting, candy, farm puzzle/scenery, and Serbian phonics, so its semantic clarity and scalability are high-value to verify.
- If cow is already accepted in the user's workflow, move to the existing dog/cat candidates rather than generating a duplicate. Preflight should inspect the actual file and check for reuse before any new generation.
- For cow, check recognizability at small card sizes (clear cow face/markings/horns without excess detail), consistency with the bear's low-detail watercolor texture, clean silhouette/background handling, and whether the same art works for both a small icon/card and larger farm-scene use.
- Do not promote any candidate based only on its filename or the user's report that it was added. Keep technical QA and runtime integration as separate statuses.

## Animal asset update — 2026-10-20 (fox)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fox.png` exists on `main`; GitHub blob SHA: `45c2f84efbab006f3e98a3fa417db61e91836a3d`; repository-reported file size: 1,615,033 bytes.
- [x] Updated the `animal-fox` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated fox image shown in the conversation: recognizable rust-orange fox, cream muzzle/chest and tail tip, upright ears, four legs, and warm painted texture. Its eyes have conspicuous white highlights and the fur texture/detail is more pronounced than the canonical bear; check visual consistency at game size.
- [ ] Inspect the exact committed PNG bytes for dimensions, alpha-channel/background transparency, edge quality, and colored fringes. The directory listing confirms file size and blob SHA, but technical image inspection of the committed bytes has not been completed.
- [ ] Verify whether fox is actually used by the runtime animal list or only mentioned in smoke-test mapping before integrating it; the current inventory records this as needing confirmation.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after fox

- **Next candidate: wolf (`animal-wolf`).** The current WIP directory listing was checked on `main`; it contains no `wolf.png`. The inventory records wolf for `game/data/serbian.js` Serbian phonics picture use, so it has a concrete pedagogical use to investigate rather than being a speculative scenery asset.
- Before generating wolf, verify the current source entry and whether an existing wolf illustration is stored elsewhere in the repository; the WIP directory listing alone does not rule out another reusable asset.
- If no suitable existing asset is found, use a single full-body wolf with a calm, non-threatening expression, muted grey-brown fur, cream muzzle/chest, small understated dark eyes, rounded readable silhouette, and soft paper/watercolor texture aligned with the bear reference. Avoid sharp fangs, aggressive posture, glossy oversized eyes, heavy outlines, or highly detailed fur.
- Keep the wolf as a candidate pending file-level technical QA and in-context review. Do not generate an asset already present elsewhere in the repository.

## Animal asset update — 2026-10-20 (wolf)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/wolf.png` exists on `main`; GitHub blob SHA: `394e557d18912db80db957c431dbccb1c913601e`; repository-reported file size: 2,000,940 bytes.
- [x] Updated the `animal-wolf` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated wolf image shown in the conversation: recognizable full-body grey-brown wolf, cream muzzle/chest, upright ears, fluffy tail, and warm painted finish. The surface has highly repetitive, dense feather-like fur marks and conspicuous white eye highlights, which may depart from the canonical bear's simpler painted surface. Compare at game size before approval.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha channel/background transparency, edge quality, and colored fringes. GitHub confirms the path, blob SHA, and file size; these do not by themselves verify image properties.
- [ ] Confirm the wolf's Serbian phonics data entry and any other runtime uses before integration. No runtime code was changed and no tests were run during this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after wolf

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. It contains `apple.png`, `bear.png`, `bone.png`, `cat.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `star.png`, and `wolf.png`. Do not recommend any of these as a new asset unless the user explicitly asks to revise one.
- **Next candidate to investigate: sheep (`animal-sheep`).** No `sheep.png` appears in the current WIP directory listing. The inventory currently marks sheep as `AUDIT` and says it is mentioned in smoke-test mapping; verify actual runtime use and search the rest of the repository for a reusable sheep illustration before generating anything.
- If a new sheep asset is justified, use a clearly readable rounded wool silhouette, muted warm off-white/cream wool, a restrained face with small dark eyes, simple warm-grey/beige face and legs, and subtle watercolor/paper texture. Avoid hundreds of tiny curls, high-contrast outlines, glossy eyes, or fluffy detail that becomes noisy at card size.
- Keep sheep distinct from `animal-chick` and `animal-baby-chick`; they are different learning concepts. Candidate status remains separate from approval, technical QA, and runtime integration.

## Animal asset update — 2026-10-21 (sheep)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sheep.png` exists on `main`; GitHub blob SHA: `587a4d094e9d24d33a57b4d0167716a54c12118b`; repository-reported file size: 1,657,084 bytes.
- [x] Updated the `animal-sheep` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated sheep image in the conversation: recognizable full-body sheep with cream wool, tan face and legs, warm painted finish, and a plain light background. Wool texture is dense and eyes have visible highlights; compare with canonical bear at game size before approval.
- [ ] Inspect the exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; those do not verify the PNG's actual pixel properties.
- [ ] Confirm whether sheep is actually present in a runtime list or only in smoke-test mapping. No runtime code was changed and no tests were run as part of this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after sheep

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. Existing PNGs are `apple.png`, `bear.png`, `bone.png`, `cat.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend any of these as a new asset unless the user explicitly requests a revision.
- **Next candidate to investigate: caterpillar (`animal-caterpillar`).** No `caterpillar.png` is present in the WIP directory listing. The inventory maps it to `game/data/serbian.js` and `sequencing.js` for phonics and life-cycle sequencing.
- Before generating, inspect both runtime uses and search the entire repository for any reusable caterpillar PNG/SVG/illustration outside the WIP folder. Do not infer absence from the WIP folder alone.
- If no suitable reusable asset exists, art direction: a small, friendly caterpillar with a simple curved row of a few rounded segments, muted garden greens with subtle warm variation, tiny understated dark eyes, and a calm expression. Keep the silhouette clean and instantly readable at card size; avoid many tiny legs, hard black outlines, glossy eyes, or a saturated neon palette. For life-cycle sequencing, ensure it reads as a caterpillar rather than a generic worm.
- Keep caterpillar as a candidate pending explicit approval, technical QA, and context review; do not mark it production-ready or integrated merely because a PNG is added.

## Animal asset update — 2026-10-21 (caterpillar)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/caterpillar.png` exists on `main`; GitHub blob SHA: `94072bc053a92bf6837dcac163aad5910d716ff1`; repository-reported file size: 1,599,296 bytes.
- [x] Updated the `animal-caterpillar` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated image shown in the conversation: recognizable green caterpillar with a curved segmented body, antennae, tiny legs, warm light background, and a soft painted finish. Its surface texture is very dense and the eyes have strong white highlights; compare against the canonical bear and test at card size.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; those do not verify pixel properties.
- [ ] Verify the current Serbian phonics and sequencing runtime use sites before integration. No runtime code was changed and no tests were run as part of this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after caterpillar

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. Existing PNGs are `apple.png`, `bear.png`, `bone.png`, `cat.png`, `caterpillar.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend these as new assets unless the user explicitly asks to revise one.
- **Next candidate to investigate: chick / baby chick**, but first resolve whether the inventory's `animal-chick` and `animal-baby-chick` rows refer to distinct learning concepts and use sites. The inventory lists chick/baby-chick in the life-cycle sequencing context, and they must remain distinct from chicken.
- No `chick.png` or `baby-chick.png` is present in the WIP directory listing. Before generating, inspect the full repository for reusable chick illustrations and verify the exact runtime entries in `sequencing.js` and any relevant Serbian data.
- If the source confirms both a chick stage and an adult chicken, prefer one clearly juvenile, fluffy, pale-yellow chick asset only if it can satisfy both listed concepts without confusing learners; otherwise keep separate assets. Use the project's soft watercolor/paper style, rounded silhouette, tiny understated dark eyes, warm cream/yellow palette, and minimal feather detail. Avoid glossy oversized eyes, thick outlines, and excessive fluff texture.
- Do not generate until repository-wide reuse and runtime semantics are checked. Candidate generation, user approval, technical QA, and runtime integration remain separate statuses.

## Animal asset update — 2026-10-21 (chick)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chick.png` exists on `main`; GitHub blob SHA: `bf52c9835e122ab3809f2aeec85d846c573170ba`; repository-reported file size: 1,793,805 bytes.
- [x] Updated the `animal-chick` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated chick image in the conversation: clearly juvenile, pale-yellow, rounded body, orange beak and feet, warm cream background, and painted texture. The surface is highly detailed with pronounced feather-like marks and large glossy eyes with white highlights; compare with the canonical bear and evaluate at sequencing-card size.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; these do not verify pixel properties.
- [ ] Confirm whether the same chick image is suitable for both the egg-to-bird sequence and the comparison/spatial contexts listed in the inventory; no runtime code was changed and no tests were run during this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after chick

- The current `assets_work_in_progress_bundle/` listing on `main` contains `apple.png`, `bear.png`, `bone.png`, `cat.png`, `caterpillar.png`, `chick.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend any of these as new assets unless the user explicitly requests a revision.
- **Next candidate to investigate: bird (`animal-bird`).** The inventory lists it in `sequencing.js` for the egg-to-bird sequence, where the current sequence uses the bird emoji `🐦`. No `bird.png` appears in the WIP directory listing.
- Before generating, search the rest of the repository for reusable bird PNG/SVG artwork and verify whether any existing bird illustration is appropriate for this final life-cycle stage. The WIP folder alone does not establish repository-wide absence.
- If no suitable reusable asset exists, make a simple generic small bird (not another chick and not a species-specific parrot/duck): rounded compact body, muted natural blue/grey or warm brown accents, tiny understated dark eye, small beak and feet, simple wing shape, and restrained watercolor/paper texture. It should read as a grown/young bird stage distinct from the chick, remain clear at card size, and match the bear's quieter detail level. Avoid glossy eyes, dense feather strokes, thick outlines, or saturated decorative plumage.
- Keep the bird as a candidate pending explicit approval, technical QA, and context review. Candidate generation, approval, and runtime integration are separate statuses.

## Generation pipeline — 2026-10-21 (OpenCode/Big Pickle)

### Decisions

- [x] **Backend: Cloudflare Workers AI, free plan.** It is the only free image backend that accepts *reference images* (`input_image_0`…`input_image_3`, each below 512x512), which is what keeps a new candidate inside the approved family instead of guessing the style from text. Model `@cf/black-forest-labs/flux-2-klein-4b`; the free allowance is 10,000 neurons per day. Gemini image models were checked and rejected as "free" (free tier: not available), and the keyless Pollinations Classic endpoint cannot take references.
- [x] **The whole `assets_work_in_progress_bundle/` is the reference pool.** The user confirmed on 2026-10-21 that every already created asset is approved and that each of them is a reference for the next candidate, and so on down the line.
- [x] **Reference order for a generation run:** the canonical bear (`Reference/bear.png`) and the canonical golden star (`Reference/star.png`) first, then the approved *painted* illustrations whose colour distribution matches the bear best. The small rasterised emoji (165-305 px) are not part of the painted family and are only sent when named explicitly. The set can be overridden per run with `--ref-files`.
- [x] **Runtime integration stays out of this task.** This work touches `tools/` and `resources/` only — no `game/` change, so no offline pack, no `sync-docs.sh`, no screenshot refresh.
- [x] **The credentials live outside git.** `tools/vendor/` is now git-ignored; the token never enters the repository.

### New tooling

- `tools/lib/png.js` — dependency-free PNG decode/encode, premultiplied-alpha resize, alpha/border/palette stats, 64x64 legibility proxy. `node tools/lib/png.js --selftest` proves round-trip, resize and palette behaviour.
- `tools/asset_qa.js` — objective QA of a PNG or a folder of PNGs (dimensions, format, alpha coverage, border alpha, palette mean, palette match against the bear, small-size contrast, sha256). It reports facts, never art.
- `tools/asset_refpool.js` — turns the bundle + `Reference/` into the ranked reference pool and writes API-ready copies below 512x512 into `tools/.cache/asset_refs/`.
- `tools/asset_generate.js` — one candidate per run: composes the prompt (reference routing + brief), posts multipart to Cloudflare, writes the picture into the bundle, then prints the QA line. Credentials come from `CF_ACCOUNT_ID` / `CF_API_TOKEN` or a JSON file outside the repository.

### Measured technical QA of the approved bundle

- [x] Real dimensions, format, alpha coverage, border alpha, palette match and small-size contrast measured for all 20 bundle files and both canonical references; recorded in `ASSET_INVENTORY.md` ("Technical QA facts" section).
- [x] **No approved asset has a transparent background.** Every bundle PNG is fully opaque; `Reference/star.png` has an alpha channel it never uses.
- [x] `pig.png` needs a fresh cut-out: only 0.02% of its pixels are fully opaque and 22% are semi-transparent, so the subject is faded edge to edge.
- [ ] Naming checks and the visual-consistency pass are still open — the second needs a human (or a vision model) looking at the pictures.

### API notes

- The image endpoint returns **JPEG**, not PNG, whatever the output file name says. The generator now sniffs the real format from the magic bytes and converts the result to PNG (the bundle convention) before writing it, so a mislabelled file can never land in the bundle again. `tools/lib/imagefile.js` holds the sniffer and the conversion; on Windows it uses the built-in System.Drawing assembly, elsewhere it keeps the original bytes under their true extension and says so.
- Reference images must stay below 512x512; the prepared copies are 500 px on the long edge.

### Candidate — bird (`animal-bird`), generated 2026-10-22

- [x] **Preflight.** The bird glyph `🐦` is live in the egg → chick → bird sequence at `game/games/sequencing.js:25-29` (stage 3, label `Птица`). A repository-wide search of `game/` and `resources/` found **no** reusable bird illustration, so the row was eligible for generation.
- [x] **Brief written:** `prompts/bird.md` — a generic small songbird, explicitly *not* a chick, chicken, rooster, parrot, duck or owl; no crest, no long tail, no saturated plumage; one subject, full body, small mobile size.
- [x] **Iteration 1 — rejected by the user as too chick-like.** References were `bear.png` + `star.png` + `chicken.png` + `chick.png`. Two causes: two round yellow birds pull the model towards a round yellow bird, and the brief itself said "compact rounded body", "tiny understated dark eyes" — baby-anatomy words. Rejected file kept at `%TEMP%\opencode\bird-v1-rejected-chicklike.png`.
- [x] **Iteration 2 — generated** with `bear.png` + `star.png` + `horse.png` (a painted family member for the finish and paper tone, a non-bird silhouette, so nothing in the reference set can be mistaken for a bird to copy) and a rewritten brief spelling out adult proportions: body longer than tall, head in proportion to the body, slim pointed beak, thin legs, a folded wing with a shoulder line, a short tail projecting past the body, no down, no ball body, no oversized head or eyes, and a slate-blue-grey / warm buff / brown palette with no yellow.
- [x] **Measured:** `assets_work_in_progress_bundle/bird.png` — 1024x1024 PNG, 1,169,139 bytes, fully opaque, paper 247.5/244.3/234.8 (iteration 1 was 243.3/239.5/231.8 — v2 sits on the canonical bear's tone), subject mean RGB 180.1/175.5/164.1 and desaturated (the chick's is 249.4/213.7/118.5, bright yellow), subject covers 16.2% of the frame (family 21-35%), small-size contrast 55.6 (family 36.8-146, median ~89).
- [x] **User approved iteration 2** (2026-10-22) after comparing it with `chick.png` and `chicken.png`. The row moved to `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`. Approval only — production readiness and runtime integration stay separate steps.
- [ ] If a later round still reads too young: iteration 3 should enlarge the bird in the frame (16.2% coverage is below the family) and deepen the palette (small-size contrast 55.6 is under the family median), not re-pick references.

## Next-asset analysis — after bird (bundle audit 2026-10-22)

The bundle was audited file by file against the inventory: **every `.png` in
`assets_work_in_progress_bundle/` is a finished, user-approved asset**, and every inventory row
that points at one of those files now says so. The audit script found **11 stale rows** that still
read `REVIEW` although their `.png` exists (`animal-dog`, `animal-cat`, `animal-cow`,
`animal-duck`, `animal-bear`, `maze-start-bear`, `food-apple`, `reward-star`, `piano-song-star`,
`adventure-fish`, `kitty-fish`) plus 3 status spellings that did not match the rest
(`animal-lion`, `animal-elephant`, `object-bone`). All 14 rows now carry the same status:
**GENERATED / USER-APPROVED / TECHNICAL QA MEASURED**.

Result: **21 bundle files, 24 inventory rows** (three rows share a file: `bear.png` → animal-bear
+ maze-start-bear, `fish.png` → adventure-fish + kitty-fish, `star.png` → reward-star +
piano-song-star), 0 rows pointing at a missing file, 0 bundle files without a row. (The rooster and
the egg were added later the same day, so the bundle now holds 23 files and 26 rows.) The note column
now also says which files are legacy rasters rather than painted family members:

| file | canvas | note |
|---|---|---|
| apple.png | 265x295 | legacy raster |
| cat.png | 275x305 | legacy raster |
| cow.png | 190x165 | legacy raster |
| dog.png | 285x295 | legacy raster |
| duck.png | 165x135 | legacy raster |
| fish.png | 280x220 | legacy raster (shared by two rows) |
| star.png | 290x280 | legacy raster (shared by two rows) |
| bear.png | 800x800 | canonical style anchor, pixel-identical to `Reference/bear.png` |

**Next candidate (chosen 2026-10-22): rooster (`animal-rooster`) — generated and approved the same day, see the candidate section below.** The glyph 🐓 is live in two places —
`game/games/animal_puzzle.js:8` (the farm-puzzle scene) and `game/games/racing-config.js:180`
(racing decor) — and no rooster picture exists anywhere in the repository, so the row is eligible.
The `animal-chicken` row says to keep the rooster "distinct from rooster-specific farm
puzzle/scenery use unless visual semantics are confirmed", and the user chose the rooster as the
next candidate on 2026-10-22, so the rooster gets its own picture and stays visually distinct from
the approved hen (`chicken.png`): a large red comb and wattle, golden hackles, a rich russet body
and long arching dark tail feathers.

- Generate one subject at a time and keep it a candidate until the user reviews it.

## Candidate — rooster (`animal-rooster`), generated 2026-10-22 (task 288)

- [x] **Preflight.** The rooster glyph 🐓 is live in two places — `game/games/animal_puzzle.js:8` (the farm-puzzle scene) and `game/games/racing-config.js:180` (racing decor) — and a repository-wide search found **no** rooster picture in `game/` or `resources/`. The `animal-chicken` row asks to keep the rooster "distinct from rooster-specific farm puzzle/scenery use unless visual semantics are confirmed", and the user chose the rooster as its own candidate on 2026-10-22.
- [x] **Brief written:** `prompts/rooster.md` — a proud adult rooster with a large red comb and wattle, golden-orange hackles, a rich russet body, long arching deep green-black sickle tail feathers and sturdy yellow legs; explicitly not a hen, chick, turkey, ostrich or peacock.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `chicken.png` — the closest category example, which supplies the family's bird brushwork but not the hen's cream colouring or shape.
- [x] **Generated:** `assets_work_in_progress_bundle/rooster.png` — 1024x1024 PNG, 1,509,865 bytes, fully opaque. Measured: paper 246.8/243.3/236.5 (the canonical bear's tone is 247/246/244), subject mean RGB 163.7/121.9/97.6 — a warm russet, against the hen's 239.0/182.3/127.0 cream — subject covers 27.2% of the frame (family 21-35%), small-size contrast 136.4 (the strongest in the family; the hen's is 69.7), palette-match vs the bear **0.5042**, vs the hen 0.5181, vs the sheep 0.6954 — all inside the family range.
- [x] **User review: APPROVED 2026-10-22.** The user opened `rooster.png` next to `chicken.png` and `chick.png` and approved it, so the row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved-exemplar index in `STYLE_BIBLE.md` §18.4. Production readiness and runtime integration remain separate steps.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.





### What the numbers do not say

- `palette-match` against the bear is 0.0152 for the bird, but 0.3157 against the sheep. The metric is a 4-bit histogram intersection over the whole frame and the flat paper is ~80% of it, so a ~10-unit shift in the paper's green channel moves the entire background mass into another bin. The bird's paper (243.3/239.5/231.8) is inside the family range (251.8-254.3 / 249.5-254 / 237-254). Read the paper tone, subject colour and coverage instead — the detail is in `ASSET_INVENTORY.md` ("Technical QA facts", finding 7).
- Big Pickle cannot look at images. Every statement above is a measurement, not a judgement about how the bird looks.

## Candidate — egg (`object-egg`), generated 2026-10-22 (task 289)

- [x] **Preflight.** The 🥚 glyph is used in **two** sequences — `game/games/sequencing.js:26` (label `Јаје`, stage 1 of egg → chick → bird) and `game/games/sequencing.js:46` (label `Јаје`, stage 1 of egg → caterpillar → butterfly) — and every sibling step is already painted and approved (`chick.png`, `bird.png`, `caterpillar.png`). A repository-wide search found **no** egg illustration in `game/` or `resources/`, so the row is eligible for generation.
- [x] **Category decision — a simple object, not an animal.** The egg is the pipeline's first **object** candidate, so the reference set had to carry an object exemplar, and `bone.png` is the only approved simple object in the bundle. `chick.png` and `chicken.png` were deliberately **not** sent: their round, warm-yellow shapes pull the model towards a yellow chick-shaped blob.
- [x] **Brief written:** `prompts/egg.md` — one upright egg shell, a smooth oval, warm cream-beige, a scatter of soft warm-brown speckles, one deeper shaded side; no face, no crack, no chick peeking out, no nest, no straw, no ribbon, no props, no ground line.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `bone.png` (the approved object exemplar — finish and paper tone only, never its shape).
- [x] **Iteration 1:** 1024x1024, 1,214,827 bytes, opaque. Measured: paper 241.5/237.3/228.5, subject mean RGB 222.2/197.1/170.5, subject coverage 8.8%, **64 px legibility proxy 21.0** — the lowest value in the bundle, i.e. the whole card was nearly blank, because a cream shell on cream paper has almost no tonal range. The shape and the framing were right (silhouette bbox 65% x 80% of the canvas), so only the tone was wrong. **Re-briefed instead of handing it over**: the shell a clear step deeper than the paper, medium warm-brown speckles instead of faint light ones, a deeper tan shaded side, plus an explicit "the picture must not look almost blank" instruction.
- [x] **Iteration 2 (kept):** 1024x1024, 1,252,075 bytes, opaque. Measured: paper 241.3/238.8/231.3, subject mean RGB 219.2/193.8/167.0 (warm cream, no yellow), subject coverage **16.8%** (exactly `bone.png`'s 16.5%), **64 px legibility proxy 38.8** (up from 21.0, just above `bone.png`'s 36.8), 8.0% of the frame darker than luminance 200 (`bone.png` 5.7%, `chick.png` 4.2%), palette-match vs the bear 0.0164 — low, but that metric is dominated by the paper tone and a pale object has few tones to intersect (see `ASSET_INVENTORY.md` finding 7).
- [ ] **User review** — the picture has not been looked at by a human yet, so the row stays `GENERATED / CANDIDATE`. Approval, production readiness and runtime integration remain separate steps.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.

## Approved — water drop (`object-water-drop`), generated + approved 2026-10-22 (task 290)

- [x] **Preflight.** The 💧 glyph is used in **five** places — `game/games/sequencing.js:31` (label `Прљаво`, step 1 of the wash sequence 💧 → 🧼 → ✨), `game/games/sequencing.js:52` (label `Заливам`, the watering step of the vegetable sequence 🌱 → 💧 → 🥕), the dino lake collectible (`game/games/dino.js:137`), the fastcat lake theme (`game/games/fastcat.js:130`) and the racing puddle hazard (`game/games/racing-config.js:5`) — more runtime uses than any other open row. A repository-wide search found **no** water-drop illustration in `game/` or `resources/`.
- [x] **Category decision — a simple object.** As with the egg, the reference set needed an object exemplar (`bone.png`), but the **colour** problem was the real one: the family is warm and the canonical secondary reference `star.png` is golden, while a water drop is cool. `elephant.png` — the only approved family member in a cool blue-grey (measured subject mean 163.6/173.0/189.9) — was sent as the **coolness** reference, never as a shape.
- [x] **Brief written:** `prompts/water-drop.md` — one plump upright teardrop on its rounded bottom, tapering to a soft point at the top, one soft highlight on the upper left, deeper shading along the lower right, no face, no splash, no puddle spreading under it, no props, no ground line.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `elephant.png` (the cool tone only).
- [x] **Iteration 1:** 1024x1024, 932,242 bytes, opaque. Measured: paper 238.3/234.8/225.8 (the darkest paper in the bundle), subject mean RGB 163.98/172.23/178.14 — a **cool grey**, the blue only 14 units above the red — subject coverage 23.2%, 64 px legibility proxy 67.2. The shape was right but the colour read as grey, so it was **not** handed over as-is.
- [x] **User feedback: "water-drop to be more blue."** The brief was rewritten: instead of "a muted, slightly grey blue" it now asks for a *clear, unmistakable water blue*, names the greys to avoid (grey-blue, slate, steel, dusty, washed out) and states the red must be low and the blue high.
- [x] **Iteration 2 (kept):** 1024x1024, 1,163,711 bytes, opaque. Measured: paper **247.5/238.3/226.8** (back inside the family range), subject mean RGB **148.63/199.50/225.43** — the blue 77 units above the red, clearly blue — subject coverage 19.6%, 64 px legibility proxy 49.2, palette-match vs the bear 0.0117 and vs the elephant 0.0120 (the coolest reference, as expected for a cool subject on a warm-paper histogram). The silhouette check (ASCII mask of the subject) measured **32% of the canvas wide by 77% tall** — an upright teardrop; the wide threshold-45 bounding box was the paper wash around it, not the subject.
- [x] **User review: APPROVED 2026-10-22.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved-exemplar index in `STYLE_BIBLE.md` §18.4.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.

### Cost tracking (2026-10-22)
Workers AI bills in **neurons**: 10,000 per day are free and the allowance resets at 00:00 UTC; above that, the Workers Paid plan charges $0.011 per 1,000 neurons. The account total is on the Cloudflare dashboard (**AI -> Workers AI**, `https://dash.cloudflare.com/?to=/:account/ai/workers-ai`) — *Billing -> Billable Usage* does **not** list Workers AI neurons on the Free plan, so the AI dashboard is the place to look.

`tools/asset_generate.js` now also prints a per-run estimate and keeps a local log (`tools/.cache/asset-usage.json`, git-ignored), so the usage is visible per candidate and not only as a daily total:

```
neurons: ~120.3 (3 input tile(s) x 5.37 + 4 output tile(s) x 26.05) | today: 6 run(s), ~638.3 of the 10000 free neurons
```

Rates from the Workers AI pricing page (checked 2026-10-22): `@cf/black-forest-labs/flux-2-klein-4b` costs **5.37 neurons per input 512x512 tile** and **26.05 per output 512x512 tile**, so one 1024x1024 candidate with three references costs **~120 neurons**. Six runs today (five candidates + one 256x256 smoke) used **~638 neurons** by the local estimate, and the **dashboard showed 721.64 / 10,000** for the day — the difference is the runs that were made before this counter existed, so the local figure is a per-run planning number, not the account total. Read the dashboard for the real number.

**Planning number:** at ~120 neurons per candidate the free 10,000 neurons cover roughly **80 candidates per day**, so a subject can afford two or three iterations and the limit never has to shape the creative decisions. Note `flux-2-klein-9b` is priced per megapixel (1363.64 for the first MP) and would need a different estimate — 9b is ~11x the cost of a 4b candidate.

## Candidate — soap (`object-soap`), generated 2026-10-23

- [x] **Preflight / repository audit.** The current `main` branch WIP bundle was re-listed before documentation changes. It contains 25 PNGs, including the new `soap.png`; the repository-wide visual-file tree was also checked to look for other relevant image assets and duplicates. The wash sequence uses the soap glyph in `game/games/sequencing.js` between the water-drop and sparkle steps.
- [x] **Brief:** one uniform rectangular bar with rounded corners, soft pastel pink, subtle matte watercolor/paper texture, and a few delicate bubbles along the edges. No face, wrapper, excessive foam, glossy plastic or dramatic lighting.
- [x] **Generated:** `assets_work_in_progress_bundle/soap.png` was returned by image generation and is present in the current WIP directory listing.
- [ ] **Technical QA pending.** Dimensions, alpha/background, silhouette, small-size legibility and visual-family consistency have not yet been measured and recorded here.
- [ ] **User review pending.** Do not mark approved, production-ready or runtime-integrated until those steps actually occur.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no runtime tests, no screenshot refresh, and no offline-pack/sync-docs work; `game/` was not changed.

## Bundle/document synchronization audit — 2026-10-23

- [x] Re-read the current `main` branch WIP directory and recursive repository tree.
- [x] The WIP directory contains **27 PNG files**. This count is only for `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`; the repository-wide tree has many other PNGs (screenshots, app icons, legacy artwork, sprite frames and references) that are not all candidates for this inventory.
- [x] Compared every WIP PNG filename against the WIP asset paths recorded in `ASSET_INVENTORY.md` and `STYLE_BIBLE.md`.
- [x] Added missing inventory coverage for `sunflower.png` and `butterfly.png`; kept both as candidates, not approved or production-ready.
- [x] Updated the acorn row to reflect that no `acorn.png` is currently present in the WIP bundle.
- [ ] Technical QA for `sunflower.png` and `butterfly.png` is not yet recorded. The existence of a file does not mean it has been visually approved or technically measured.
- [ ] No runtime integration, glyph swap, tests, screenshot refresh or production asset copy was performed by this documentation audit.

The current 27-file WIP bundle, in alphabetical order, is:

`apple.png`, `bear.png`, `bird.png`, `bone.png`, `butterfly.png`, `cat.png`, `caterpillar.png`, `chick.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `egg.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `rooster.png`, `sheep.png`, `soap.png`, `star.png`, `sunflower.png`, `water-drop.png`, and `wolf.png`.

The WIP file list and inventory coverage are now synchronized for the files visible on `main` at audit time. This does not assert that every PNG anywhere in the repository belongs in the asset-generation inventory; screenshots, app icons, legacy illustrations, sprite frames and reference boards have different purposes.


## Asset update — acorn (object-acorn), generated 2026-10-25

- [x] **Repository presence verified.** Commit 20e9d5974bb11ee49c2986bc71d1aae73d8b3947 adds resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/acorn.png to main.
- [x] **Source use confirmed.** game/games/sequencing.js uses 🌰 as stage 1 of the tree-growth sequence: acorn → sprout → tree.
- [x] **Inventory synchronized.** The object-acorn row now points to the committed WIP file and records it as a candidate.
- [ ] **Technical QA pending.** The exact committed PNG bytes have not been measured in this documentation pass; dimensions, file size, alpha/background, silhouette coverage, small-size legibility, and edge quality remain unverified. The generated image shown in chat has an opaque cream paper background, but that observation is not treated as a measurement of the committed file.
- [ ] **User review pending.** The image is not recorded as user-approved, production-ready, or runtime-integrated.
- [ ] **Not done here:** no copy into game/assets/images/, no glyph swap, no runtime tests, no screenshot refresh, no offline-pack build, and no sync-docs.sh; game/ was not changed.

## Next-candidate analysis — mushroom (object-mushroom), 2026-10-25

- **Recommendation: investigate mushroom next, but do not generate yet.** The inventory maps 🍄 to the forest scene in game/games/animal_puzzle.js and a Kitty collectible. A shared image could serve two contexts, but the actual Kitty render path and required scale/crop must be checked before deciding whether one asset is appropriate.
- **Duplicate check status:** GitHub code/file search for mushroom.png returned no result. That search alone does not prove no reusable mushroom artwork exists elsewhere in the repository; a recursive visual-file audit is still required before generation.
- **Prompt direction if preflight clears it:** a single recognizable woodland mushroom with a rounded warm red/rust cap and a short cream stem, softly painted storybook watercolor/paper texture, restrained natural shading, simple readable silhouette, no face, no surrounding grass/forest scene, no glossy 3D finish or thick outline. Final colors should be checked against the forest-puzzle palette and the existing bear/star/object references.
- **Decision gates before generation:** (1) inspect every repository mushroom image/SVG and relevant sprite folder, (2) inspect the Kitty collectible's actual use and scale, (3) confirm whether a single mushroom can serve both contexts without semantic/layout issues, and (4) finalize the prompt and reference set. No generation has been performed for mushroom.
