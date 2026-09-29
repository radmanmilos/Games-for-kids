# Learning Content Roadmap — Петрин свет

**Created:** 2026-09-29  
**Status:** PLANNED (P3 — after Tasks 1-17 stable)

---

## Current Learning Content

| Game | Category | Status |
|------|----------|--------|
| Животиње (Animals) | learning | DONE |
| Бројање (Counting) | learning | DONE |
| Памтилица (Memory) | learning | DONE |
| Слагалице (Puzzle) | learning | DONE |
| Учионица (Classroom) | learning | DONE |
| Писање (Tracing) | learning | DONE |
| Пијано (Piano) | learning | DONE |
| Облици (Shapes) | learning | DONE |
| Бојење (Coloring) | create | DONE |

---

## Proposed New Learning Content

### Phase 1 — Core Skills (P1)

1. **Бројеви 1-20 (Numbers)**
   - Recognize numbers 1-20
   - Count objects up to 20
   - Match number to quantity
   - Prerequisite: Бројање (counting 1-10)

2. **Боје (Colors)**
   - Recognize basic colors
   - Match color to name
   - Prerequisite: Бојење (coloring)

3. **Време (Time)**
   - Morning/afternoon/evening
   - Days of the week
   - Prerequisite: Учионица (classroom)

### Phase 2 — Language (P2)

4. **Абецеда (Alphabet)**
   - Letter recognition
   - Letter sounds
   - Prerequisite: Писање (tracing)

5. **Речи (Words)**
   - Simple word building
   - Rhyming
   - Prerequisite: Абецеда

6. **Сечења (Seasons)**
   - Four seasons
   - Weather words
   - Prerequisite: Животиње (animals)

### Phase 3 — STEM (P3)

7. **Математика (Math)**
   - Addition/subtraction
   - Simple equations
   - Prerequisite: Бројеви 1-20

8. **Наука (Science)**
   - Animals and habitats
   - Plants and growth
   - Prerequisite: Животиње

9. **Свет (World)**
   - Continents
   - Countries
   - Prerequisite: Сечења

---

## Design Principles

- All text in Serbian Cyrillic
- All speech in Serbian
- Toddler-friendly (no reading required)
- Forgiving (no punishment)
- Short sessions
- Immediate feedback
- Large touch targets
- Offline-capable

---

## Implementation Order

1. Бројеви 1-20 (extends existing counting)
2. Боје (extends existing coloring)
3. Абецеда (extends existing tracing)
4. Време (extends existing classroom)
5. Речи (extends existing alphabet)
6. Сечења (extends existing animals)
7. Математика (extends existing numbers)
8. Наука (extends existing animals)
9. Свет (extends existing seasons)

---

## Notes

- Each new game must follow the shared architecture (app-registry, navigation, main.js, audio-buses, etc.)
- Each new game must have a smoke test
- Each new game must be added to the app-registry
- Each new game must be added to the offline cache list
- Each new game must be added to the CI workflow
