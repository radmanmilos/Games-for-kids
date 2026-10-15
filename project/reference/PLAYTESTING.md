# Portfolio-Level Playtesting Protocol

R20 (Fresh Elevation Roadmap §29). The automated gates prove the app *works*;
this protocol is how we judge whether the **portfolio** — hub, shells, games,
parent area — feels like one calm product a young child can use unaided.

Run it on a real device where possible (tablet, portrait and landscape). Use
**Playwright MCP** for a session-only desktop pass; never add MCP to `game/`.

## When to run

- Before a release, after `node tools/check_release.js` is green (automated
  gates first — a manual pass never substitutes for them).
- After any change to the shared shell, hub, navigation or parent area.
- After every new game pilot (R21–R27) lands.

## Sessions

### Session A — first-time toddler flow

Start from the hub as a child would, with no code open.

- Can the child choose something without adult explanation?
- Can the child start within a few seconds?
- Can the child recover from mistakes?
- Can the child find the way back?

### Session B — five-game random walk

Open **five games from different categories** (`learning` and `games`), walking
through the hub exactly as a child would. Do not read the code first.

- Do they feel like the same product (backgrounds, back button, feedback,
  language and audio volume)?
- Does any screen use different conventions for the same action?

### Session C — offline session

Cache once via the parent area (`📥 Преузми за офлајн рад`), then run without
network.

- Does every game still open, play and return?
- Does the parent area still report the right offline/version state?

### Session D — parent handoff

Open the parent area (`🔒 За родитеље`) and check a parent can understand:

- offline status (`Офлајн копија: спремна / није преузета`);
- version (`Верзија: …`);
- updates (`🔄 Провери ажурирања` → `Постоји нова верзија` / `Нема ажурирања`);
- reset (`🗑 Обриши локални напредак`);
- the local progress view (`📊 Напредак`: `Шта је коришћено` / `Шта је вежбано`).

## Record

Classify every observation with one of:

```text
BLOCKER   - a child or parent cannot complete the task at all
MAJOR     - they can, but only with help or by guessing
MINOR     - they succeed but it is rough or confusing
COSMETIC  - it does not affect comprehension or usability
```

Log template (newest first):

```text
[DATE] [SESSION A-D] [CLASS] file:line? — what happened — suggested fix
```

Do **not** overreact to cosmetic differences between games if they do not affect
child comprehension or usability. BLOCKER/MAJOR issues block a release; MINOR
issues are queued; COSMETIC issues are collected, not chased.

## Automated coverage this protocol sits on top of

- `node tools/check_release.js` — read-only release gate (fast gate + full battery).
- `node tools/run_all.js --list` — the smoke battery; every page in
  `game/data/app-registry.js` has a smoke or an explicit `null`.
- `node tools/play_matrix.mjs` — Chromium/WebKit across phone/tablet/desktop viewports.
- `node tools/axe_check.js` — accessibility (contrast, names, roles).
- `tools/offline_smoke.mjs` — the real offline play-through (Session C's automated twin).
