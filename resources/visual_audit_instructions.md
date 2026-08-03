# Visual Audit — instructions for the audit model

Run this task with the **MiMo V2.5 Free** model (the only free model that can view
screenshots). Before starting, the human must have switched the model in the model
picker — the audit cannot see anything without image input.

Your job is a **read-only review**. You do NOT change any code, and you do NOT write
any fixes. You produce findings; the human approves them one by one; changes happen
afterwards (by whatever model the human chooses).

## 1. Why this exists

"Petrin svet" (Петрин свет) is an offline, toddler-first game collection for tablets.
Every screen was built programmatically (CSS + inline SVG + emojis) and reviewed only
headlessly/functionally. Nobody has actually LOOKED at it. You are that pair of eyes:
find everything that looks wrong, inconsistent, or off for a 3–6 year old.

Project ground rules (for context when judging findings):
- All text shown to children is Serbian, written in **Serbian Cyrillic**.
- Offline-first, no external assets at runtime; emojis and SVG are used for art.
- Target device: a tablet in landscape, first finger; also usable in portrait.

## 2. Capture the screenshots

A ready-made harness is already in the repo:

    node resources/visual_audit_capture.js

Run it with no arguments to capture every shot in its built-in list (hub, all games,
all classroom activities, plus a couple of portrait views) into the temp output folder
(default: `%TEMP%\petrin_visual_audit`). To capture one: `--shot <name>`. To change
output: `--out <dir>`. Individual shots print `OK <name> -> <path>`.

Then **Read every PNG** (the Read tool accepts images) and inspect it carefully.
If you want extra states not in the list (e.g. a game's win/celebrate overlay, a
different coloring scene, autoplay running), extend the `SHOTS` array at the top of
`resources/visual_audit_capture.js`:
- `name` unique id, `page` html file under `game/`, `width`/`height`, and `actions`
  — an array of either `"await <ms>"` waits or JS expressions (e.g.
  `"document.querySelectorAll('#activityGrid .class-tile')[0].click()"`).
  Waits are essential so animations/screens settle before the screenshot.
- Recommended sizes: 1280x800 (landscape tablet) and 800x1280 (portrait). Add both
  for the hub and classroom.

## 3. What to look for — checklist

Go game by game. For each screen ask: "would a small child find this clear and
pretty, and is it consistent with the rest of the app?"

- **Serbian Cyrillic text**: any mojibake (`Ð`, `?`, boxes ⬜), missing accents, wrong
  letterforms, or Latin text where Cyrillic is required. Flag the exact string.
- **Overlaps / clipping**: elements covering each other, text cut off, content
  overflowing its card, buttons too close, the page scrollable when it shouldn't be.
- **Alignment & spacing**: off-center elements, uneven gaps, text touching borders.
- **Emoji rendering**: any emoji that renders as text-style (shows as a plain glyph),
  as a fallback (empty box), or monochrome. Note that results can differ per OS.
- **Size & touch targets**: anything a toddler finger would miss (< ~9vmin /
  ~64px), text that is too small to read at arm's length.
- **Color & contrast**: readability of text on its background, colors that clash with
  the soft pastel theme (cream background, plum #4A3F6B text, sky/yellow/green/pink
  accents), low-contrast borders.
- **Consistency across games**: same back-button style/position, same fonts, same
  button language, same celebration style. Flag deviations.
- **Visual bugs**: obvious glitches, frozen mid-animation screens, empty areas that
  should have content, placeholder-looking art, misaligned SVG shapes (e.g. the 3D
  shapes in Учионица — do Лопта/Коцка/Квадар/Ваљак/Купа/Пирамида look like the real
  ​3D forms?).
- **Delight/quality** (cosmetic): things that just look unfinished or cheap — that is
  a valid finding at the "cosmetic" severity.

## 4. The deliverable — your report

Write the report as a numbered findings list (it becomes the approval list). For each
finding include, at minimum:

    1. Game + screen/state (e.g. "Учионица — Облици activity, 3D shapes grid").
    2. Screenshot file name it was seen in.
    3. Exact description of the issue (what is wrong / where).
    4. Severity: BLOCKER (breaks the experience), MAJOR (clearly wrong or confusing),
       MINOR (imperfect, should fix), COSMETIC (nice-to-have).
    5. Concrete proposed fix (exact element/CSS/text change if you can name it).
    6. Optional: a suggested before/after description.

Also add a short "what looks GREAT" section — the human likes knowing what to keep.

Do not fix anything yourself. Do not combine findings loosely — one finding per
issue. If a fix is risky or changes content (e.g. replacing an alphabet word/emoji),
say so explicitly so the human can decide.

## 5. After the report

Stop and hand the findings to the human. Do not implement, do not ask for more work,
do not edit files. The human will approve findings one by one; implementation happens
in later sessions (likely on a coding model).

Remember: read-only. Screenshots only. Nothing gets changed.
