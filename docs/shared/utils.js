(function () {
    window.shuffle = function (items) {
        return [...items].sort(() => Math.random() - 0.5);
    };

    window.vminToPx = function (value) {
        return value / 100 * Math.min(window.innerWidth, window.innerHeight);
    };
}());
