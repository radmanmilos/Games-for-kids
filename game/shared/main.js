/* Shared runtime boot */
document.body.addEventListener('pointerdown', () => { if (window.ctx) window.ctx(); }, {once: true});

/* R19: local progress. Deliberately tiny and local — one namespaced object that
   records which games were opened and how many activities a child completed.
   It is NOT a reward system: no XP, streaks, badges, locked content, profiles
   or sync. Core play must behave exactly the same if storage is missing or
   cleared, so every access is wrapped and falls back to an in-memory copy.
   Only the parent area reads it (and can reset it); no child screen shows it. */
window.PetrinProgress = (function () {
    const KEY = 'petrinProgress';
    let mem = null;
    const blank = () => ({ v: 1, firstSeen: null, lastSeen: null, visits: 0, played: {}, completed: {} });
    function read() {
        if (mem) return mem;
        try {
            const raw = localStorage.getItem(KEY);
            mem = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
        } catch (e) { mem = blank(); }
        if (!mem.played) mem.played = {};
        if (!mem.completed) mem.completed = {};
        return mem;
    }
    function write() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* keep memory copy */ } }
    let current = null;
    return {
        setCurrent(id) { current = id || null; },
        visit() { const d = read(); const day = new Date().toISOString().slice(0, 10); if (!d.firstSeen) d.firstSeen = day; d.lastSeen = day; d.visits = (d.visits || 0) + 1; write(); },
        play(id) { if (!id) return; const d = read(); d.played[id] = (d.played[id] || 0) + 1; write(); },
        complete(id) { id = id || current; if (!id) return; const d = read(); d.completed[id] = (d.completed[id] || 0) + 1; write(); },
        snapshot() { const d = read(); return JSON.parse(JSON.stringify(d)); },
        reset() { mem = blank(); try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
    };
}());

/* Attribute a completed activity when a game celebrates. celebration.js loads
   before this file on the pages that have it, so window.celebrate exists here;
   the wrap is idempotent and transparent (it returns the original's result). */
(function () {
    if (typeof window.celebrate !== 'function' || window.celebrate.__petrinProgress) return;
    const original = window.celebrate;
    const wrapped = function () {
        try { window.PetrinProgress.complete(); } catch (e) { /* never block the game */ }
        return original.apply(this, arguments);
    };
    wrapped.__petrinProgress = true;
    window.celebrate = wrapped;
}());

const standalonePage = location.pathname.split('/').pop().toLowerCase().replace(/\.html$/, '');

/* R7: the per-page boot table comes from data/app-registry.js instead of a
   hand-written map here. That map was a second app list that had already gone
   stale - it still listed the 2D `racing` page deleted in task 131 (CLEAN-001),
   and it was missing animal_counting/animal_memory/animal_puzzle entirely,
   which is why those pages had to wire their own back button.
   Registry entries with `back: null` / `start: null` are pages that handle
   themselves, and are correctly skipped here. */
function entryForPage(page) {
  const list = (window.APP_REGISTRY || []);
  for (const app of list) {
    if (app.path.toLowerCase().endsWith('/' + page + '.html')) return app;
  }
  return null;
}

const standaloneGame = entryForPage(standalonePage);

/* R19: record the visit and which game was opened. The parent surface is not a
   child activity, so it is never counted as "played". */
if (standaloneGame && standaloneGame.category !== 'parent') {
    window.PetrinProgress.setCurrent(standaloneGame.id);
    window.PetrinProgress.play(standaloneGame.id);
}
window.PetrinProgress.visit();

/* Where a page's back button returns to: its own sub-hub when the registry
   declares one, the landing screen for the parent area. */
const backTarget = standaloneGame && standaloneGame.hubGroup ? 'hub-' + standaloneGame.hubGroup : 'hub';

if (standaloneGame && standaloneGame.back) {
    const backBtn = document.getElementById(standaloneGame.back);
    if (backBtn) backBtn.addEventListener('click', () => { if (window.popSound) window.popSound(); setTimeout(() => location.href = '../index.html#' + backTarget, 90); });
}

if (standaloneGame) {
    // Try to call the page's startup function. If it's not yet defined (script load order
    // differences), retry a few times before giving up. This is safe and avoids race
    // conditions between shared/main.js and per-game scripts.
    // `started` makes the whole boot idempotent: start functions bind click/pointer
    // listeners, so booting twice would double every interaction in the game.
    let started = false;
    const tryStart = (retries) => {
        if (started) return;
        const fnName = standaloneGame.start;
        if (!fnName) return;
        if (typeof window[fnName] === 'function') {
            started = true;
            try { window[fnName](); } catch(e){ console.warn('Error running', fnName, e); }
            return;
        }
        if (retries <= 0) return;
        setTimeout(() => tryStart(retries - 1), 120);
    };
    tryStart(10);

    // additionally attempt again after DOMContentLoaded and load events in case
    // the per-page script defines the start function later in the page lifecycle.
    const bootListener = () => tryStart(10);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootListener, {once:true});
        window.addEventListener('load', bootListener, {once:true});
    } else {
        // already loaded, call once
        bootListener();
    }
}

// Helper for pages to return to their parent hub subsection in a consistent way.
window.returnToParent = function(){
    try{
        const target = backTarget;
        if (window.top !== window && window.top && typeof window.top.goTo === 'function') {
            window.top.goTo(target);
        } else if (typeof window.goTo === 'function') {
            window.goTo(target);
        } else {
            location.href = '../index.html#' + target;
        }
    }catch(e){
        try{ location.href = '../index.html#hub'; }catch(_){ /* ignore */ }
    }
};
