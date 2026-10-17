# Mandatory Asset Generation Preflight and Verification Rule

**Applies to:** All image and visual-asset generation for the Kids Games project  
**Priority:** Mandatory  
**Core principle:** Think first. Verify first. Generate second.

This rule exists to prevent duplicate assets, style mismatches, avoidable rework, and wasted image-generation attempts. It applies in every project conversation and after context resets. Previous conversation memory is not a substitute for checking the current repository.

## 1. Inspect the current source of truth

Before proposing or generating an asset, inspect the latest relevant files on the active repository branch, including:

- `STYLE_BIBLE.md`
- `ASSET_INVENTORY.md`
- `PROGRESS.md`

Use the actual current paths recorded in the repository if these files are located elsewhere. Check the current branch and relevant repository state. Do not rely on stale summaries, remembered filenames, old screenshots, or assumptions about what has changed.

## 2. Establish which asset is eligible

Identify the candidate from the documented inventory and project priorities. Verify:

- its exact inventory row and intended purpose;
- its current status and whether generation is explicitly approved;
- any prerequisites, exclusions, or unresolved audit requirements;
- whether another asset or approved exemplar already fulfils the need;
- whether the candidate is genuinely the next eligible item, rather than merely the next item that looks unfinished.

Do not treat a draft inventory row, a proposed asset, or a user-discussed idea as generation approval unless the project documentation or user clearly authorizes it.

## 3. Search for existing assets and duplicates

Before generation, inspect the repository for relevant files and near-duplicates, including:

- production/runtime assets;
- work-in-progress bundles;
- reference images and approved exemplars;
- alternate filenames, extensions, formats, and locations;
- existing illustrations, sprites, CSS, or SVG elements that already fulfil the same purpose.

Search the whole relevant repository scope, not just the expected output folder. Reuse an existing suitable asset when possible. Do not generate an asset simply because it is missing from one folder.

## 4. Decide whether image generation is the right method

Confirm that a new raster illustration is actually needed. Consider whether the requirement should instead be met by reusing an existing asset or using CSS, SVG, code, or another appropriate implementation. Respect all documented scope constraints and exclusions.

If the asset's necessity, eligibility, approval, or intended use cannot be established, **stop before generation**. State the exact blocker and ask only for the decision or information needed to resolve it.

## 5. Define the image before writing the prompt

Use the current style bible and approved reference assets to establish a specific brief covering:

- subject and intended in-game meaning;
- silhouette, pose, framing, and visual hierarchy;
- palette, lighting, shading, and texture;
- background and transparency requirements;
- detail level, outline treatment, and overall rendering style;
- expected dimensions or aspect ratio, when specified by the project;
- prohibited features and known failure modes.

Check the brief against the project's approved exemplars. Do not assume that a generic description such as "cute," "storybook," or "watercolor" is sufficiently precise. Explicitly rule out known mismatches, including unwanted backgrounds, dark halos, strong glows, glossy 3D rendering, emoji-like vector styling, heavy outlines, and excessive detail where these conflict with the style guide.

## 6. Perform a pre-generation challenge

Before calling the image-generation tool, answer these questions internally from available evidence:

1. Have I inspected the current source-of-truth files?
2. Is this asset genuinely needed?
3. Have I checked for duplicates and reusable alternatives?
4. Is this item eligible and approved for generation?
5. Does the brief match the current style bible and approved exemplars?
6. Have I addressed known failure modes and specified the required background?
7. Is there any unresolved uncertainty that could make this generation wasteful?

If any critical answer is **no** or **unknown**, do not generate yet. Resolve the uncertainty first. This preflight is mandatory on every generation request, not optional when the request seems straightforward.

## 7. Inspect the actual generated result

After generation, inspect the returned image itself before accepting or presenting it as suitable. Evaluate:

- subject identity and readability at intended use size;
- silhouette, composition, cropping, and visual balance;
- palette, texture, shading, outlines, and consistency with approved exemplars;
- background, transparency, edge quality, halos, glows, and unwanted artifacts;
- accidental extra objects, facial features, details, or stylistic elements;
- similarity to existing assets and whether the image fulfils the intended use.

Reject or revise unsuitable results. Do not claim an image passed inspection unless it was actually inspected. If a generation tool reports a rate limit or other stop condition, obey it; do not repeatedly retry in a way that risks wasting the user's allowance.

## 8. Keep statuses distinct

Never conflate these states:

- **Proposed:** an idea or candidate has been identified.
- **Eligible:** repository evidence supports that the asset is needed and in scope.
- **Approved for generation:** explicit authorization exists to generate it.
- **Generated:** an output was returned by the generation tool.
- **Reviewed:** the actual output was inspected against the brief and style requirements.
- **User-approved:** the user explicitly accepted the specific result.
- **Production-ready:** the asset meets project requirements for integration.
- **Integrated:** it has been placed in the intended project location and any required references are updated.
- **Committed:** repository evidence confirms the changes were committed.
- **Verified/tested:** the relevant checks were actually performed and their results recorded.

One status does not imply another. In particular, generated does not mean approved, production-ready, integrated, committed, or tested.

## 9. Record work accurately

When reporting asset work, state what was checked, what was generated or changed, the exact relevant paths when verified, what was inspected, which checks were run and their results, and what remains unresolved. Distinguish direct repository/tool evidence from user reports and assumptions. Never invent filenames, approvals, commit IDs, or test results.

Update project documentation and inventory only when the corresponding work has actually occurred. Do not mark an asset approved or production-ready without the required evidence and approval.

## 10. Mandatory stop condition

**If it cannot be established that an asset is needed, eligible, sufficiently specified, and authorized for generation, do not generate it.**

Explain the specific blocker and resolve it before spending an image-generation attempt. Avoidable duplication, failure to inspect existing assets, failure to follow the inventory, or failure to check the style guide is a process error—not a reason to ask the user to tolerate another mistake.

## Final rule

**Verify first. Challenge the decision. Generate second. Inspect the result. Report only what the evidence supports.**

This rule is mandatory for every asset-generation attempt in the Kids Games project.
