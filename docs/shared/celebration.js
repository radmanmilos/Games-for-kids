(function () {
    const style = document.createElement('style');
    style.textContent = '.celebration-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:24vmin;pointer-events:none;opacity:0;transform:scale(.4);z-index:9999;}' +
        '.celebration-overlay.show{animation:celebration-pop .6s ease forwards;}' +
        '@keyframes celebration-pop{0%{opacity:0;transform:scale(.4)}30%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}';
    document.head.appendChild(style);
    let el = null;
    window.celebrate = function (emoji) {
        if (!el) {
            el = document.createElement('div');
            el.className = 'celebration-overlay';
            document.body.appendChild(el);
        }
        el.textContent = emoji || '🎉';
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove('show'), 1400);
        if (window.successChime) window.successChime();
        if (window.speech && window.speech.speak) window.speech.speak('Браво!');
    };
}());