# 05 — Decisions, gates, risks

## §1 Decisions

**APPROVED** = said by the user. **DEFAULT** = plan author's choice, stands unless changed. **OPEN** = needs the user.

| ID | Decision | Status |
| --- | --- | --- |
| D-Q0 | Goal: a polished, near-professional look/feel with good character animation (user request 2026-11-25). All original locked rules stay (hero can't be hurt, no score/counters, no HUD text, offline, Serbian Cyrillic). | APPROVED |
| D-Q1 | **Art pipeline:** (A) code-built characters/world, polished with toon shading, outlines, face atlas, procedural rigs (default); (B) hand-authored CC0 GLB characters supplied by the user (track X1); (C) hybrid. A gets the project to a "polished indie/mobile" look; the final leap to "studio quality" realistically needs authored assets. | **OPEN** — default A, decide at QG1 |
| D-Q2 | Music: yes, generative synth music + ambient beds with a single sound toggle (replaces original D8 "no music"). | DEFAULT |
| D-Q3 | Quality tiers low/medium/high with **step-down-only** adaptation; shadows on medium (hero) and high (hero + actors). | DEFAULT |
| D-Q4 | Tone mapping `NeutralToneMapping` if present in the vendored r169, else none; **no** post-processing/bloom (X3 later only if measured). | DEFAULT |
| D-Q5 | Camera: look-ahead + short, skippable reveal nudges; no shake, no cinematic lock. | DEFAULT |
| D-Q6 | Own inline SVG icons replace all emoji controls. | DEFAULT |
| D-Q7 | Logic frozen except additive read-only fields with Node tests. | DEFAULT |
| D-Q8 | Asset budget: code-only default adds ≈ 0 bytes of assets; any asset-based track (X1) needs its own budget decision. | DEFAULT |
| D-Q9 | Work stays uncommitted; the user commits/pushes (AGENTS). | DEFAULT |
| D-Q10 | Existing global/DOM names (`little_adventure*`, `i3d-*`, `startlittle_adventure`) are kept. | DEFAULT |

## §2 Risks

| # | Risk | Mitigation |
| --- | --- | --- |
| RQ1 | Nobody can see renders in some environments | Q-00 probes WebGL; photo/filmstrip modes make stills reviewable; look gates; user gates; never self-approve visuals without images |
| RQ2 | Performance regressions on modest tablets (outlines, shadows, water, particles) | tiers + step-down, budgets per tier, measure on the tablet (Q-18), outlines only on characters |
| RQ3 | Free/weak models can't "do art direction" | AD gives numbers, palettes, pivot names, timings; cards are small; filmstrips make animation checkable |
| RQ4 | Scope creep / over-engineering | optional tracks X1–X3 need decisions; one card per session; file-size caps |
| RQ5 | Visual polish breaking logic or tests | logic frozen; 65 logic checks must stay green; evaluators are pure |
| RQ6 | Reduced-motion users (the owner's OS has it ON) | amplitude ×0.4, no spins/pans; assert product response not host setting |
| RQ7 | Beautiful but unreadable for a small child | Q-20 readability pass, contrast in shots, playtests, no text |
| RQ8 | Audio fatigue/startle | peak ≤ 0.25, pitch variance, soft envelopes, ducking under speech, mute toggle, user listening gate |
| RQ9 | Terrain heights vs 2D logic mismatch | corridor flat (|h| ≤ 0.12), heights only outside bounds, Node test, hero y = heightAt check |
| RQ10 | "Professional" is subjective | RV §5 rubric with targets and named scorers |
| RQ11 | Procedural characters may plateau below hand-made art | D-Q1 honesty; X1 path ready if the user wants to go further |

## §3 User gates (the AI stops and waits)

| Gate | After | User decides |
| --- | --- | --- |
| QG1 | Q-04 | approve the toon/outline direction on current models; answer **D-Q1** |
| QG2 | Q-08 | approve the world look (terrain, water, vegetation, zones) |
| QG3 | Q-11 | approve hero look + animation (filmstrips + tablet) |
| QG4 | Q-13 | approve all characters and props |
| QG5 | Q-17 | approve full presentation incl. audio and UI (listen on the tablet) |
| QG6 | Q-22 | approve release (report, golden shots, rubric) |
| QG7 | Q-24 | ship / tune / cut after playtests |

## §4 Text for the repo (used by the AI at Q-00/Q-23)

`project/DECISIONS.md` — add «Little Adventure quality pass (2026-11-25)»: goal = polished near-professional look; code-only art pipeline by default (D-Q1 open); tiers with step-down only; logic frozen except additive read-only fields; music + sound toggle; own SVG icons; no post-processing. Plan: `resources/General_reviews/Little_adventure/Quality_Plan/`.
`project/STATUS.md` — one pointer line: `Little Adventure quality pass plan: resources/General_reviews/Little_adventure/Quality_Plan/ — ledger PROGRESS.md.`
