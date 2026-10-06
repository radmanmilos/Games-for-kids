# Learning Content Roadmap — Reassessment (R27b)

**Date:** 2026-10-05
**Task:** 193 → 194 (roadmap §41 "Future Candidate Review")
**Reviews:** `resources/General_reviews/Learning_Content_Roadmap.md` (the original nine-item proposal)
**Method:** every claim below is checked against the current code, with `file:line`. Nothing here is carried over from the original document's "PLANNED" status column.

§41 sets two rules that decide most of this review, and both are about **not** building things:

> "Do not start simply by adding more number buttons."
> "Before building a standalone colors game, ask whether current Coloring plus Classroom already covers the concept sufficiently. If the gap is pronunciation/recognition, make a focused activity rather than a duplicate coloring app."

The original roadmap was written before the R21–R27 pilots existed. Seven new learning games have shipped since, and they have already closed or overtaken several of its items.

---

## Verdict at a glance

| # | Original item | Verdict | Evidence |
|---|---|---|---|
| 1 | Бројеви 1–20 (Numbers) | **Partial — finish it** | data + game both hard-stop at 10 |
| 2 | Боје (Colors) | **Do not build** | already covered; §41 pre-empts it |
| 3 | Време (Time) | **Partial — worth doing** | zero vocabulary exists |
| 4 | Абецеда (Alphabet) | **Done (task 196)** | 30 letters; audit found 6/10 wrong, now derived |
| 5 | Речи (Words) | **Defer** | §41 warns against the proposed shape |
| 6 | Seasons | **Partial — worth doing** | zero vocabulary exists |
| 7 | Математика (Math) | **Partial — defer equations** | quantities done by R21 |
| 8 | Наука (Science) | **Partial — cheap to extend** | no habitats, growth is 1 of 3 sequences |
| 9 | Свет (World) | **Do not build** | §41 rejects it explicitly |

---

## 1. Бројеви 1–20 — finish it (highest value, lowest cost)

Two independent ceilings, both at 10:

- `game/data/serbian.js` — `numbers` has **11 entries, `count` 0–10**. Nothing for 11–20.
- `game/games/animal_counting.js:33` — `const maxLevels = 10;`
- `game/games/animal_counting.js:89` — choice list is `.slice(0, Math.max(4, Math.min(10, max)))`, a hard cap at 10 regardless.

§41's preferred sequence is `1–10 mastery → more/less/same → 11–20 recognition → 11–20 quantity`. The middle step is **already done**: R21 `compare` teaches more/less/same visually with no equations. So the next step is 11–20 *recognition*, not quantity.

**The cheap win:** `game/games/classroom.js:41` builds the numbers activity generically — `numbers: { title: …, items: NUMBERS }` where `NUMBERS = SERBIAN.numbers`. Adding 11–20 to `serbian.js` therefore lights up **11–20 recognition in the Classroom for zero game code**.

**Landmine — fix before adding data.** `tools/classroom_smoke.js:62` hardcodes `SW.tiles === 11`:

```js
check('tab switch to Бројевi updates activity', SW.activeTab === 'numbers' && … && SW.tiles === 11, switched);
```

Adding 11–20 makes that 21 and turns the assertion red. It must be de-hardcoded against `SERBIAN.numbers.length` — the same lesson R21 already applied to `hub_smoke`'s `LEARNING_EXPECTED`. **A count that pins today's value is a check that cannot survive the change it is supposed to allow.**

## 2. Боје — do not build a colors game

Already covered, twice over:

- `SERBIAN.colors` — **11 named colors** (Црвена, Наранџаста, Жута, Зелена, Плава, Љубичаста, Розе, Браон, Сива, Бела, Црна).
- `classroom.js:42` — a `colors` activity rendering the swatch **and speaking the name** (`classroom.js:116`). That is exactly the pronunciation/recognition §41 says would justify a focused activity.

R22 `sorting` also uses color as a real category (`sorting.js:16-23`, red/blue with Serbian accessible names), so colour is already discriminated, not just displayed.

§41 says to check sufficiency first; it is sufficient. **A standalone colors app would be a duplicate.** The only genuine gap is *recall* — the child names a colour they are shown — which is a small focused addition at most, not a ninth game.

## 3. Време — worth doing

Nothing exists. A case-insensitive search of `game/data/serbian.js` for `jutro|veče|noć|dan|jesen|zima|proleće|letnji` returns **zero** matches, and `Object.keys(SERBIAN)` has no time- or season-shaped key at all. `classroom.js:38-43` defines only four activities: `alphabet`, `numbers`, `shapes`, `colors`.

§41 says start with `jutro / dan / veče / noć`, explicitly **before clock faces**. Cheap: four Serbian strings plus one small scene game.

## 4. Абецеда — done (task 196)

- `SERBIAN.alphabet` — **all 30 Cyrillic letters**, each `{label, name, word, emoji}`, presented in Classroom and traced in `tracing.js`.
- R23 `phonics` originally covered **10** letters with a hand-written list — and the audit for task 196 found **6 of those 10 were wrong** (`А→Јабука` starts with Ј, `С→Змија` with З, and so on). `phonics_smoke.js` never asserted correct-start, so the defect survived from R23 unchallenged.
- **Fixed by deriving instead of duplicating:** `phonics.js` now maps over `SERBIAN.alphabet`, giving all 30 letters, correct items that start with their letter by construction, and pronunciations taken from the 30 letter MP3s `speech.js` already registers. `phonics_smoke.js` walks all 30 rounds and asserts letter alignment, correct-start, distractor non-collision and the recorded sound.

**Status: complete.** No standalone alphabet game is warranted.

## 5. Речи — defer

§41: *"Use familiar objects and existing Serbian speech assets first. Avoid a text-building app that assumes strong literacy."* The original roadmap's proposal was "Simple word building / Rhyming", which is precisely the literacy-assuming shape §41 rules out. No existing asset supports it. **Defer.**

## 6. Seasons — worth doing

Same position as Time: **zero** vocabulary. Note §41 names it `Годишња доба` and asks for visual scenes plus weather concepts.

**Doc bug worth fixing:** the original roadmap lists this as **"Сечења"** — which in Serbian means *cutting*, a mistranslation of "Seasons". A future session searching for `Сечења` would find the wrong concept. The correct label is `Годишња доба`.

## 7. Математика — defer equations

§41: *"Start with visual quantities before symbolic equations."* The original roadmap proposed "Addition/subtraction, Simple equations". R21 `compare` already delivers visual quantities with **no written equations anywhere** (verified by its own smoke). Jumping to equations now would invert §41's order. 11–20 quantity is the natural follow-on to item 1.

## 8. Наука — cheap to extend

§41: *"Animals/habitats and plant growth fit the product better than dense factual content."*

- Animals: covered (`animals.js`).
- Habitats: **not present**.
- Plant growth: R24 `sequencing.js:7-17` has a `plant1` sequence (Семе → Биљка → Цвет) — one of only **two** sequences in the game.

Growth is already modelled correctly as a sequence; extending it is data, not architecture.

## 9. Свет — do not build

§41: *"Only after the product has strong localization, visual assets, and developmental rationale. Avoid a quiz-heavy geography app for very young children."* Continents/countries as a quiz is the rejected shape. `space`/`ocean`/`dino` already give non-quiz world content. **Explicitly declined.**

---

## Recommended order

**Tier A — do next (small, evidence-backed, closes an existing gap)**

1. ~~**Extend `phonics` to the full alphabet** (item 4). Data only; no new app.~~ **DONE 2026-10-05 (task 196)** — `LETTERS` is now derived from `SERBIAN.alphabet`, so all **30** letters are covered and every correct item is the alphabet's own example word. The audit that preceded it found that **6 of the original 10 entries taught a false association** (`А→Јабука`, `С→Змија`, `Т→Ауто`, `К→Мачка`, `Р→Зец`, `И→Сова`), because the list was hand-written and no check asserted correct-start. Pronunciation now uses the letter recordings `speech.js` already registers for all 30 letters.
2. **Numbers 11–20 recognition** (item 1): add to `SERBIAN.numbers`, de-hardcode `classroom_smoke.js:62` *first*, then let Classroom show them. Leave `animal_counting`'s 10-cap alone until 11–20 recognition is established.
   - **Update (task 197):** the de-hardcoding is **done** — `classroom_smoke.js` now derives the tile count from `SERBIAN.numbers.length` and additionally asserts every number renders **in order**.
   - **~~DEFERRED on audio~~ DONE 2026-10-06 (tasks 197+198).** The assumption that the recordings "cannot be generated here" was **wrong**: `resources/tts_generate.js` (a Google Translate TTS fetcher, `client=tw-ob`, `tl=sr`) has been in the repo since the first commit `d02c6e2` but names no TTS engine, so the history search for `espeak`/`festival`/`piper`/`gtts`/`flite`/`coqui` missed it. 32 MP3s were generated with the same engine/voice as the approved 0–10 set (11–20 names + sentences, Time, Seasons+weather), `SERBIAN.numbers` grew to 0–20, and `speech.js` `numberFiles`/`sentenceFiles` grew to 21 each — the `registerEach` length guard passed unweakened. Classroom now shows 11–20; `animal_counting`'s 10-cap is untouched until 11–20 recognition is established.

**Tier B — reasonable next (needs new content)**

3. **Time** `jutro / dan / veče / noć` (item 3) — four strings, no clock faces. **Audio generated 2026-10-06** (`jutro/dan/vece/noc` clips on disk, same engine/voice as 0–10); no vocabulary in `serbian.js` yet — wiring the activity is open work.
4. **Seasons** `Годишња доба` + weather (item 6) — visual scenes. **Audio generated 2026-10-06** (`prolece/leto/jesen/zima` + `kisa/sneg/sunce/vetar` clips on disk); no vocabulary or scene assets yet — wiring the activity is open work.
5. **Plant growth** via more `sequencing` steps (item 8) — **NOT blocked.** Verified at `sequencing.js:37` that a step's label is only an `aria-label`; the game speaks just a fixed prompt plus the recorded `praise`/`retry` lines, so extra sequences are pure data with no audio work. (Habitats with new nouns would be blocked.)

**Tier C — do not build**

- A standalone colors app (item 2 — already covered).
- Math equations (item 7 — §41 forbids the ordering).
- Continents/countries (item 9 — §41 rejects the shape).
- A text/word-building app (item 5 — §41 warns it assumes literacy).

---

## Standing constraint for whoever picks this up

Every item above is a **toddler** activity: Serbian Cyrillic on screen, Serbian speech, no reading required, no score, no timer, forgiving feedback, large targets, offline. The nine-item roadmap's "Design Principles" section still holds and is unchanged by this review.

And the §41 guard-rail in one line: **when a candidate looks like a duplicate of something that already exists, verify against the code before building it.** Items 2 and 9 would both have been duplicates; §41 asks for exactly that check, and it is cheap.