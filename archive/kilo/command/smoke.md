---
description: Run smoke test for the current game
model: kilo-auto/free
---
Identify the current game from the active task or the file being edited. Run the matching smoke test: `node tools/<game>_smoke.js`. If no smoke test exists for that game, run `node tools/headless.js` instead. Report the pass/fail count and any failures.