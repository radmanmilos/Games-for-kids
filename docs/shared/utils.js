(function () {
    window.shuffle = function (items) {
        const a = [...items];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    window.vminToPx = function (value) {
        return value / 100 * Math.min(window.innerWidth, window.innerHeight);
    };
}());
