# Task brief: code-review fixes (Claude review of HEAD `52927bb`, v3.0.0)

**For:** the build AI (OpenCode / Codex / Copilot) working in `Games-for-kids`.
**From:** the user, via a Claude code review. Every finding below was verified by reading the code (or by a measurement, where stated). None of it was run in a browser, because the review sandbox had no Chrome. **You must run the smokes yourself.**

Line numbers are from `52927bb`. If a file has changed, relocate with `grep -n` (do not retry an identical edit).

---

## 0. Ground rules (from `AGENTS.md`, restated because they bind this task)

- Persona and posture: Ponytail Lazy Dev. **Smallest correct fix, YAGNI**, no refactors, no unrelated cleanup, no new shared helpers.
- **Mode check first.** This is an implementation task, so you should be in Build mode. If you are in Plan mode, say so and wait.
- **Before starting:** run `git status --short` and `gh run list`. If the tree is dirty in a way you did not create, or CI is red, **report it first and wait for the user**.
- **Never commit or push to `main`.** Only commit if the user says so for this task. If you do commit, add the trailer `Agent: <tool>/<model>`.
- Before touching these areas, read the lesson file:
  - `game/shared/*`, standalone boot, audio helpers → `project/lessons/game-runtime.md`
  - any smoke or harness work → `project/lessons/testing-harness.md`
  - `game/sw.js`, offline manifest → `project/lessons/ci-offline.md` and `project/reference/OFFLINE.md`
- **Check each smoke's assertions against current code before running it.** Fix a stale assertion to the observed truth. Never bend `game/` to satisfy a test.
- Max 2 attempts per diagnosis of the same symptom, then stop and ask.
- Restart-proofing: after every gate or smoke run, append the result to `tools/.cache/task<N>-validation.md`.
- Never edit `docs/` by hand. Never edit `README.md` or `CONTRIBUTING.md`.
- All child-facing text stays Serbian Cyrillic. This task adds **no** new child-facing text.

## 1. Deliverables and ordering

Do this as **two tasks**, each with its own `project/tasks/ACTIVE.md` entry (IN PROGRESS at start, DONE with a dated note: who = tool + model, what, why). Read `ACTIVE.md` and `INDEX.md` for the next free task number. Do not assume one.

| Task | Contents | Risk |
| --- | --- | --- |
| **A, small fixes** | Fixes 1, 2, 3, 4, 5b | Low. Each is 1-10 lines. |
| **B, SW install safety** | Fix 5a (+ a test) | Medium. Touches the offline path. **Do not start B until A is validated and the user says go.** |

Finish and validate A completely before proposing B.

---

## 2. Task A: the fixes

### Fix 1: Explorer: held button sticks after a touch is cancelled
**File:** `game/games/kitty-standalone.js` (~`:549-565` `bindButton`, ~`:2560-2575` `setPaused` and listeners)
**Problem:** `bindButton` listens for `touchstart`, `touchend`, `mousedown`, `mouseup`, `mouseleave` but **not `touchcancel`**. `setPaused` never clears `keys`. If a system gesture or palm rejection cancels the touch while the child holds ◀/▶/jump, `keys.left|right|jump` stays `true` and the kitty keeps running on its own until the child taps that button again. The sibling engine already fixes this: `game/games/adventure.js:105-122` (`touchcancel`) and `:1310-1316` (`resetHeldInput()` on pause). Port, don't redesign.

**Change:**
1. In `bindButton`, add right after the `touchend` line:
   ```js
   el.addEventListener('touchcancel', end, {passive: false});
   ```
2. In `setPaused(p)`, clear held input when pausing:
   ```js
   function setPaused(p) {
       if (p === paused) return;
       paused = p;
       if (p) { keys.left = false; keys.right = false; keys.jump = false; }
       if (!p) requestAnimationFrame(loop);
   }
   ```
   (`keys` is declared at ~`:547`, before `setPaused`. Confirm.)
3. `grep -n "pressed" game/games/kitty-standalone.js game/games/adventure.js`. If the Explorer toggles a visual `pressed` class on its buttons, remove it on pause too, mirroring `resetHeldInput`. If it has no such class, **do nothing more**.

**Regression risk:** minimal. `blur` already calls `setPaused(true)`, so a window blur now also releases held keys. That is intended.
**Test:** in `tools/kitty_smoke.js`, add one case: dispatch `touchstart` on `#btn-right`, assert the player moves, dispatch `touchcancel`, advance frames, assert the player **stops**. (Read how the smoke already presses buttons and reuse that. `keys` is a top-level `const`, so `Runtime.evaluate` can read `keys.right` directly if that is simpler.) Also run `touch_interruption_*`.
**Docs:** one line in `project/games/little-explorer.md`.

### Fix 2: Biased shuffle skews answer positions in the learning games
**File:** `game/shared/utils.js:3`
**Problem:** `window.shuffle` uses `sort(() => Math.random() - 0.5)`, which is not uniform. Measured on V8 over 200,000 trials: `game/games/kids_games.js:77` builds `shuffle([correct].concat(distractors))` with `OPTIONS = 4`, and the correct answer lands in slot 1 **36.1%** of the time (uniform = 25%) and in slots 2 and 3 only 17.1% and 15.6%. A child who always taps the first card wins disproportionately. The same shuffle feeds `shapes.js:26-28`, `coloring.js:242` and the session pick at `kids_games.js:52`.

**Change (replace the function body, keep the non-mutating copy semantics):**
```js
window.shuffle = function (items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
```
**Do NOT** touch the six other local shuffle copies (`phonics.js:52`, `sequencing.js:59`, `animal_memory.js:32`, `sorting.js:57`, `adventure.js:22`, `kitty-standalone.js:861`). Those are out of scope (YAGNI). Just mention them in the task note.

**Regression risk:** a smoke that assumed the old (unspecified) order. Run `classroom_smoke`, `shapes_smoke`, `coloring_smoke`. If one fails on order, fix the stale assertion.
**Test (ad hoc, don't commit unless the user asks):**
```bash
node -e "
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const N=200000,pos=[0,0,0,0];
for(let t=0;t<N;t++)pos[sh([0,1,2,3]).indexOf(0)]++;
console.log(pos.map(p=>(100*p/N).toFixed(1)+'%').join(' '));"
```
Expect about 25% in each slot.

### Fix 3: Unguarded `localStorage` for the music preference
**Files:** `game/games/fastcat.js:192` and `:200`; `game/games/kitty-standalone.js:255` and `:259`
**Problem:** `shared/main.js` states "every access is wrapped", but these four call sites are not. If `localStorage` throws (storage disabled, locked-down WebView), `kitty-standalone.js` aborts at line 255 so **the whole Explorer fails to boot**, and Fast Cat's IIFE dies at load. Everything else in the repo (`main.js`, `cat_forest.js`) already guards storage.

**Change (inline, no new shared helper, with 2 files and 2 sites each this is below the abstraction threshold):**
```js
// read (was: let musicOn = localStorage.getItem('pkMusic') !== 'off';)
let musicOn = true;
try { musicOn = localStorage.getItem('pkMusic') !== 'off'; } catch (e) { /* storage unavailable: music on */ }

// write, inside setMusicOn
try { localStorage.setItem('pkMusic', on ? 'on' : 'off'); } catch (e) { /* keep in-memory value */ }
```
Keep `let` and the existing variable names and positions.

**Regression risk:** none when storage works. **Test:** check whether `tools/headless.js` can inject a script before page load. If yes, add one smoke case where `localStorage` getters throw and the game still boots. If it has no such hook, **do not extend the harness**. Instead verify manually with Playwright MCP by overriding `localStorage` in devtools before load, and say in the task note that this was a manual check.

### Fix 4: Parent gate does not re-roll after a wrong answer
**File:** `game/pages/parent.html` (~`:208-243`, `newGateQuestion`, wrong-answer branch)
**Problem:** after a wrong tap the same 4 options stay on screen, so a child tapping every button gets through in at most 4 taps. The design comment above the gate (~`:74-81`) says "a wrong answer just re-asks", but the code never re-asks. (The destructive reset still has its own `confirm()`.) The fix must keep the stated rule: **no lockout, no timeout, no attempt limit, no penalty**.

**Change:** in the wrong-answer `else` branch, after the existing shake and note, re-roll after the shake finishes. `newGateQuestion()` clears the note, so re-set it afterwards:
```js
setTimeout(function () {
  if (!actionsEl.hidden) return;            // already solved: do nothing
  newGateQuestion();
  gateNote.textContent = 'Покушај поново';  // newGateQuestion() clears it
}, 400);
```
`'Покушај поново'` is an existing string; add no new text.

**Regression risk:** `parent_smoke` may assume the options stay the same after a wrong tap. **Read its gate assertions first** and adjust only an assertion that encodes the old behaviour. The `__parentGate.answer()` test hook reads the question at call time, so it should keep working.
**Test:** extend `parent_smoke` with one case: tap a wrong option, wait ~500 ms, assert the options and question text changed (retry a few times, since a re-roll can randomly repeat the same question: assert "changed at least once in N tries"), then assert a correct answer still unlocks.
**Docs:** `parent.html` has no `project/games/` page. Add a note in the task entry only.

### Fix 5b: Service worker caches failed responses
**File:** `game/sw.js` (~`:78-80`, fetch handler)
**Problem:** the handler stores every network response with `cache.put(req, net.clone())` and never checks `net.ok`. A transient 404 or 500 gets cached and then served cache-first until the next version bump.

**Change (one line of logic):**
```js
const net = await fetch(req);
if (net.ok) { try { await cache.put(req, net.clone()); } catch (_) {} }
return net;
```
**Regression risk:** none for 200s. 206 and opaque responses were already failing silently inside the existing try/catch.
**Note:** `sw.js` is in `sw-cache-list.json` and `offline-manifest.json`, so its hash changes. See the section "Generated artifacts" below.

---

## 3. Task B: SW install safety (only after A is done and the user approves)

### Fix 5a: Failed install must not destroy the previous offline copy
**File:** `game/sw.js`, `install` handler (~`:19-37`) and `activate` handler (~`:40-58`)
**Problem:** `install` wraps `cache.addAll(...)` in `try/catch`, only logs, and always calls `skipWaiting()`. `addAll` is all-or-nothing, so one failed request leaves the new cache empty. `activate` then deletes every other `petrin-*` cache. Net effect: on a flaky connection during an upgrade, a tablet can end up with **no offline copy at all**.

**Proposed change:** let install fail so the old worker and cache stay in charge, and clean up the half-made cache:
```js
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const res = await fetch(CACHE_LIST_URL);
      if (!res.ok) throw new Error('cache list HTTP ' + res.status);
      const list = await res.json();
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(resolveAssets(list));
      console.log('SW: initial cache complete', list.length);
    } catch (e) {
      console.warn('SW: initial cache failed', e);
      await caches.delete(CACHE_NAME);
      throw e;   // install fails: previous worker + cache keep serving
    }
    self.skipWaiting();
  })());
});
```
**Behaviour to understand before shipping:** on a **first** install that fails, there is now no worker until the next page load (`navigation.js` re-registers on every page, so it retries). That trade-off is intended, but state it in the task note.
**Risk:** a permanently bad entry in `sw-cache-list.json` would block every upgrade. `validate_offline.js` (in `check_fast`) already proves every listed file exists, which mitigates this.
**Test:** `tools/sw_update_smoke.js` currently covers the diff path and cache naming, but **not a failed install**. Add: serve version A (ok), then version B where one listed asset returns 404, trigger the upgrade, and assert (a) the `petrin-v<A>` cache still exists and (b) no empty `petrin-v<B>` remains. If this needs more than a small extension of the existing server helper, **stop and propose the test scope to the user** instead of building a new harness.

---

## 4. Generated artifacts: required after any change under `game/`

In this order (per `STATUS.md` "Rules of the road"):
1. `node tools/build_offline.js` (regenerates `offline-manifest.json` and `sw-cache-list.json`; `sw.js` and the edited games change hashes)
2. `tools/sync-docs.sh` (rebuilds `docs/`; never edit `docs/` by hand)
3. Confirm `diff -rq game docs` prints nothing.

**Screenshots:** none of these fixes changes what a child sees on a registered screenshot page. The gate re-roll is on `parent.html`, which is `screenshot: false` in `app-registry.js`. Confirm that in the registry and state it in the task note. Only run `node tools/screenshot.js --review=Screenshot_Review --pages=<page> --task=<id>` if you find a visible change.

## 5. Validation ladder (record each result in `tools/.cache/task<N>-validation.md`)

1. `node tools/check_fast.js` must be 8/8.
2. Targeted smokes (read assertions first, then run):
   `node tools/run_all.js --game kitty_smoke`, then fastcat, classroom, shapes, coloring, parent, sw_update (A and B), `touch_interruption_a` to `d`, and `offline_smoke.mjs --concurrency 1` (for the `sw.js` changes).
3. `node tools/check_release.js` before declaring done.
4. A smoke that exits non-zero with **0 checks** is a Chrome boot crash, not a failure. `run_all.js` retries it. Say plainly in your report which of these you actually ran. **Never claim a pass you did not run.**

## 6. Docs discipline (end of each task)

- `project/tasks/ACTIVE.md`: one write at start (IN PROGRESS), one at end (DONE + dated note).
- `node tools/archive_tasks.js`, then **overwrite** `project/STATUS.md`, then `node tools/check_docs.js`.
- Append these footguns to the matching lesson files (short, one bullet each):
  - `project/lessons/game-runtime.md`: *every `localStorage` access must be guarded, including preference reads at script top level; an unguarded read at load kills the whole page.* And: *never shuffle with `sort(() => Math.random() - 0.5)`; it is biased and skews answer positions.*
  - `project/lessons/game-runtime.md` (or `testing-harness.md`): *touch-interruption smokes assert crash-resistance, not that held input is released; a touch/mouse-event game needs `touchcancel` handling and a key reset on pause.*
  - `project/lessons/ci-offline.md` (Task B only): *a swallowed `install` failure plus a deleting `activate` can destroy the last good offline copy.*
- Update `project/games/little-explorer.md` (Fix 1). Update `project/games/classroom.md` only if you changed behaviour it documents.
- **Version:** per `AGENTS.md`, C = minor per shipped segment (3.0.0 → 3.0.1). **Ask the user** whether this counts as a shipped segment before editing `game/manifest.json`. A bump renames the SW cache, which triggers a full re-download on installed tablets.

## 7. Explicitly out of scope: do NOT do these without asking the user

- Merging `kitty-standalone.js` into the `adventure*.js` engine. The two share 32 function names and have drifted: 26 differ, only 6 are byte-identical, and the music engine exists in 3 copies. It is a design decision, not a bug fix. **Propose** this wording for `project/DECISIONS.md` and wait for approval before writing it: *"Explorer (`kitty-standalone.js`) and the adventure engine are separate forks. When fixing input, audio or lifecycle code in one, diff the other and port the fix."*
- Consolidating the six local shuffle copies.
- Deleting the unused shared helpers `pointerDrag` (`shared/input.js`) and `safeArea` (`shared/viewport.js`). Both have zero callers.
- Adding a CSP meta tag, or pinning GitHub Actions to SHAs.
- Changing the 44 px `.peek-btn` in `animal_puzzle.html` (below the 48 px `--touch-min` token).
- The version-propagation question (`navigation.js:15` reads `manifest.json` through the cache-first worker). It needs a real-tablet test first, so it is **not** a code task yet.

## 8. Report format when done

For each fix: `file:line` changed, the exact commands you ran with their results, which smokes were **not** run and why, and any assertion you had to update (with the reason). End with a concise status and the next step. Wait for the user before committing anything.
