(function () {
    const screens = document.querySelectorAll('.screen');

    window.goTo = function (id) {
        if (id === 'game-animals') { location.href = 'pages/animals.html'; return; }
        if (id === 'game-shapes') { location.href = 'pages/shapes.html'; return; }
        if (id === 'game-candy') { location.href = 'pages/matching_game.html'; return; }
        if (id === 'game-puzzle') { location.href = 'pages/animal_puzzle.html'; return; }
        if (id === 'game-counting') { location.href = 'pages/animal_counting.html'; return; }
        if (id === 'game-memory') { location.href = 'pages/animal_memory.html'; return; }
        if (id === 'game-coloring') { location.href = 'pages/coloring.html'; return; }
        if (id === 'game-classroom') { location.href = 'pages/classroom.html'; return; }
        if (id === 'game-tracing') { location.href = 'pages/tracing.html'; return; }
        if (id === 'game-piano') { location.href = 'pages/piano.html'; return; }
        if (id !== 'game-kitty' && typeof window.stopKitty === 'function') window.stopKitty();
        screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
        if (id === 'game-animals' && typeof window.startAnimals === 'function') window.startAnimals();
        if (id === 'game-shapes' && typeof window.startShapesRound === 'function') window.startShapesRound();
        if (id === 'game-candy' && typeof window.startCandy === 'function') window.startCandy();
        if (id === 'game-puzzle' && typeof window.startAnimalPuzzle === 'function') window.startAnimalPuzzle();
        if (id === 'game-counting' && typeof window.startAnimalCounting === 'function') window.startAnimalCounting();
        if (id === 'game-kitty' && typeof window.startKitty === 'function') window.startKitty();
        if (id === 'game-coloring' && typeof window.startColoring === 'function') window.startColoring();
    };

    document.querySelectorAll('[data-go]').forEach(element => {
        element.addEventListener('click', () => {
            if (typeof window.popSound === 'function') window.popSound();
            setTimeout(() => window.goTo(element.dataset.go), 90);
        });
    });
}());
