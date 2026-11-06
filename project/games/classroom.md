# 🏫 Учионица (Classroom)

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

Purpose:

A learning hub where the child sees a word, hears it, and repeats it.

Activities:

- 🔤 Азбука — all 30 Serbian Cyrillic letters. Tap a letter to hear its sound and a word that starts with it (with an emoji picture).
- 🔢 Бројеви — numbers 0–20. Tap a number to hear it and a sentence like "Пет слонова" (Five elephants), shown with that many animal pictures. (11–20 added 2026-10-06, recordings generated with `resources/tts_generate.js`.)
- 🔷 Облици — Круг, Квадрат, Троугао, Звезда, plus 3D shapes Лопта, Коцка, Квадар, Ваљак, Купа, Пирамида (drawn as inline SVG so the real 3D form is visible). Tap a shape to hear its name.
- 🎨 Боје — the 11-color palette. Tap a color to hear its name.

The hub carries **two button sets** — "За малишане" (the 4 learn-and-repeat activities above) and "За децу" (full-fledged quiz games, Phase 3): Азбука за децу (hear a letter sound → pick the letter), Бројеви за децу (count the animal emojis → pick the number), Боје за децу (hear a color → pick the swatch), Облици за децу (hear a shape → pick the shape). Each is a forgiving 8-question multiple-choice game: pop + bounce on correct, gentle shake and "Покушај још једном!" on wrong (no punishment), 🏅 + "Све си урадио!" panel with score on completion, and a replay button. Tap the prompt card to replay the sound.

Every activity has an autoplay button (▶) that walks through the tiles one by one, advancing only after the spoken word finishes plus a short pause, so the child has time to repeat. No celebration icon — the goal is to learn and repeat the words. All text is Serbian Cyrillic, and all speech is Serbian (pre-generated MP3 assets).

**Category tabs (Phase 2, GAME-CLASS-001, task 120):** the learn-and-repeat activities now carry a visual category tab bar — Азбука / Бројеви / Облици / Боје / Време / Годишња доба — so the child can jump between content areas without going back to the hub; the active tab always matches the open activity. The rail is centered, capped at `94vw` and wraps onto a second row on narrow screens (task 385), so all six categories stay visible and tappable without page-level horizontal scrolling on phones.

Educational goals:

- Alphabet
- Vocabulary
- Counting
- Number recognition
- Shape recognition
- Color recognition

---

## 2026-11-04 (OpenCode/Big Pickle)
- Painted art wiring + baseline smoke greening (tasks 341-352). See commit dfe4155.

## 2026-11-06 (OpenCode/Big Pickle)
- Task 385: the category tab rail now wraps inside `94vw` and its pills never break their labels, so all six tabs stay on screen at phone widths (previously the 492px rail was clipped in a 390px viewport). `classroom_smoke.js` guards the phone geometry.
