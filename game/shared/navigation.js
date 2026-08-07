(function () {
    const screens = document.querySelectorAll('.screen');
    let swRegistration = null;

    // register service worker when available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/game/sw.js').then(reg => {
            swRegistration = reg;
            console.log('SW registered', reg.scope);
        }).catch(e => {
            console.warn('SW register failed', e);
        });
    }

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
        if (id === 'game-driving') { location.href = 'pages/driving.html'; return; }
        if (id === 'game-ocean') { location.href = 'pages/ocean.html'; return; }
        if (id === 'game-dino') { location.href = 'pages/dino.html'; return; }
        if (id === 'game-space') { location.href = 'pages/space.html'; return; }
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

    // download-offline button behavior (improved): show progress and friendly states
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('download-offline');
        const status = document.getElementById('download-status');
        const checkBtn = document.getElementById('check-updates');
        if (!btn) return;
        const setStatus = (txt) => { if (status) status.textContent = txt; };
        setStatus('Спремно');
        const getWorker = () => navigator.serviceWorker && (navigator.serviceWorker.controller || (swRegistration && swRegistration.active));
        const sendToWorker = (message) => {
            const worker = getWorker();
            if (!worker) return false;
            worker.postMessage(message);
            return true;
        };

        // listen for messages from the service worker
        if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
            navigator.serviceWorker.addEventListener('message', (e) => {
                const data = e.data || {};
                if (data.type === 'cache-progress') {
                    const pct = Math.round((data.completed / Math.max(1, data.total)) * 100);
                    setStatus('Преузимање ' + pct + '%');
                }
                if (data.type === 'cache-complete') {
                    setStatus('Сачувано за ванмрежни рад');
                    btn.disabled = false; btn.removeAttribute('aria-busy');
                    btn.dataset.installed = '1';
                }
                if (data.type === 'cache-error') {
                    setStatus('Грешка: ' + (data.message || 'непознато'));
                    btn.disabled = false; btn.removeAttribute('aria-busy');
                }
                if (data.type === 'check-result') {
                    // check-result: { changed: number, changes: [paths] }
                    if (checkBtn) checkBtn.disabled = false;
                    if (data.changed && data.changed > 0) {
                        // show update available state
                        setStatus('Ажурирање доступно');
                        btn.dataset.updateAvailable = '1';
                        btn.setAttribute('aria-label', 'Ажурирај');
                        setStatus('Ажурирање је доступно');
                    } else {
                        // no changes
                        if (!status || status.textContent === 'Покрећем...') setStatus('Сачувано за офлајн рад');
                        if (btn.dataset.updateAvailable) delete btn.dataset.updateAvailable;
                    }
                }
                if (data.type === 'check-error') {
                    if (checkBtn) checkBtn.disabled = false;
                    setStatus('Провера није доступна');
                }
            });
        }

        btn.addEventListener('click', () => {
            // if the button is in update mode, re-run cacheAll to update changed files
            if (btn.dataset.updateAvailable) {
                btn.disabled = true; btn.setAttribute('aria-busy', 'true'); setStatus('Ажурирање...');
                try { if (!sendToWorker({ cmd: 'cacheAll' })) throw new Error('worker-not-ready'); } catch (e) { setStatus('Сервис још није спреман'); btn.disabled = false; btn.removeAttribute('aria-busy'); }
                return;
            }

            btn.disabled = true; btn.setAttribute('aria-busy', 'true'); setStatus('Покрећем...');
            try {
                if (!sendToWorker({ cmd: 'cacheAll' })) throw new Error('worker-not-ready');
            } catch (e) {
                setStatus('Сервис још није спреман');
                btn.disabled = false; btn.removeAttribute('aria-busy');
            }
        });

        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                checkBtn.disabled = true;
                setStatus('Проверавамо ажурирања...');
                if (!sendToWorker({ cmd: 'checkForUpdates' })) {
                    setStatus('Сервис још није спреман');
                    checkBtn.disabled = false;
                }
            });
        }

        // If a worker already controls the page, quietly check for a newer asset manifest.
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(reg => {
                swRegistration = reg;
                if (navigator.serviceWorker.controller) sendToWorker({ cmd: 'checkForUpdates' });
            }).catch(() => {});
        }
    });

    // Respect index.html#screen requests so standalone redirect can open a subsection
    if (location.hash) {
        const target = location.hash.slice(1);
        // small delay so DOM settles; navigation.goTo will make the requested screen active
        setTimeout(() => {
            try { if (typeof window.goTo === 'function') window.goTo(target); } catch(e) { /* ignore */ }
        }, 40);
    }
}());
