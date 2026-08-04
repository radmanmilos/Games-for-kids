/* Shared runtime boot */
document.body.addEventListener('pointerdown', () => { if (window.ctx) window.ctx(); }, {once: true});

const standalonePage = location.pathname.split('/').pop().toLowerCase().replace(/\.html$/, '');
const standaloneMap = {
    'animals': ['animals-back', 'startAnimals'],
    'shapes': ['shapes-back', 'startShapesRound'],
    'matching_game': ['candy-back', 'startCandy'],
    'coloring': ['coloring-back', 'startColoring'],
    'classroom': ['classroom-back', 'startClassroom'],
    'tracing': ['tracing-back', 'startTracing'],
    'piano': ['piano-back', 'startPiano'],
    'driving': ['driving-back', 'startDriving'],
    'ocean': ['ocean-back', 'startOcean']
};
const standaloneGame = standaloneMap[standalonePage];

if (standaloneGame) {
    const backBtn = document.getElementById(standaloneGame[0]);
    if (backBtn) backBtn.addEventListener('click', () => { if (window.popSound) window.popSound(); setTimeout(() => location.href = '../index.html', 90); });
    if (typeof window[standaloneGame[1]] === 'function') window[standaloneGame[1]]();
}
