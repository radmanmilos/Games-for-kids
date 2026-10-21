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
