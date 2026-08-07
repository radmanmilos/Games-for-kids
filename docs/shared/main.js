/* Shared runtime boot */
document.body.addEventListener('pointerdown', () => { if (window.ctx) window.ctx(); }, {once: true});

const standalonePage = location.pathname.split('/').pop().toLowerCase().replace(/\.html$/, '');
const standaloneMap = {
    'animals': ['animals-back', 'startAnimals', 'hub-learning'],
    'shapes': ['shapes-back', 'startShapesRound', 'hub-learning'],
    'matching_game': ['candy-back', 'startCandy', 'hub-games'],
    'coloring': ['coloring-back', 'startColoring', 'hub-learning'],
    'classroom': ['classroom-back', 'startClassroom', 'hub-learning'],
    'tracing': ['tracing-back', 'startTracing', 'hub-learning'],
    'piano': ['piano-back', 'startPiano', 'hub-learning'],
    'driving': ['driving-back', 'startDriving', 'hub-games'],
    'ocean': ['ocean-back', 'startOcean', 'hub-games'],
    'dino': ['dino-back', 'startDino', 'hub-games'],
    'space': ['space-back', 'startSpace', 'hub-games']
};
const standaloneGame = standaloneMap[standalonePage];

if (standaloneGame) {
    const backBtn = document.getElementById(standaloneGame[0]);
    if (backBtn) backBtn.addEventListener('click', () => { if (window.popSound) window.popSound(); setTimeout(() => location.href = '../index.html#' + standaloneGame[2], 90); });

    // Try to call the page's startup function. If it's not yet defined (script load order
    // differences), retry a few times before giving up. This is safe and avoids race
    // conditions between shared/main.js and per-game scripts.
    (function tryStart(retries){
        const fnName = standaloneGame[1];
        if (typeof window[fnName] === 'function') {
            try { window[fnName](); } catch(e){ console.warn('Error running', fnName, e); }
            return;
        }
        if (retries <= 0) return;
        setTimeout(() => tryStart(retries - 1), 120);
    })(10);

    // additionally attempt again after DOMContentLoaded and load events in case
    // the per-page script defines the start function later in the page lifecycle.
    const bootListener = () => { (function(retries){ const fnName = standaloneGame[1]; if (typeof window[fnName] === 'function') { try { window[fnName](); } catch(e){ console.warn('Error running', fnName, e); } } })(10); };
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
        const mapEntry = standaloneMap[standalonePage];
        const target = (mapEntry && mapEntry[2]) ? mapEntry[2] : 'hub';
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
