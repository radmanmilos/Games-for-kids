/* ---------------- МАЧЈА ШУМА (Cat Forest) ----------------
   Feed visiting emoji cats; each visit leaves a gift that grows into the
   forest. Calm, wordless, no fail states. Plan package:
   resources/General_reviews/Cat_Forest/ (01_TECH_DESIGN.md is the contract).
   CF-01: page shell only — the engine arrives in CF-04. */
(function () {
  'use strict';

  var started = false;

  function startCatForest() {
    if (started) return; // main.js boots each page once; a second call doubles every handler
    started = true;

    /* Dev/test hook: lets the harness read state deterministically. The game
       itself never reads it; CF-04 replaces this stub with the full API (TD §8). */
    window.__catForest = {
      state: function () { return { booted: true }; }
    };
  }

  window.startCatForest = startCatForest;
})();
