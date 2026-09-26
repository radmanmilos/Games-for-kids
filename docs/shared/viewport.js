/* Петрин свет — shared viewport/resize helpers
   Consistent canvas resize, orientation change handling, and safe-area info. */
(function () {
  'use strict';

  // Get safe-area insets as an object {top, right, bottom, left} in px.
  function safeArea() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat')) || 0,
      right: parseInt(style.getPropertyValue('--sar')) || 0,
      bottom: parseInt(style.getPropertyValue('--sab')) || 0,
      left: parseInt(style.getPropertyValue('--sal')) || 0,
    };
  }

  // Resize a canvas element to fill its container with devicePixelRatio.
  // Returns the new {width, height, dpr}.
  function resizeCanvas(canvas) {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: w, height: h, dpr: dpr };
  }

  // Add a resize listener that also handles orientation change.
  // Returns a remove function.
  function onResize(fn) {
    let pending = false;
    function handler() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        fn();
      });
    }
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return function remove() {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }

  // Show/hide a rotate hint element based on orientation.
  function rotateHint(el) {
    if (!el) return function () {};
    function check() {
      const portrait = window.innerHeight > window.innerWidth;
      const small = window.innerWidth <= 520;
      el.style.display = (portrait && small) ? 'flex' : 'none';
    }
    check();
    return onResize(check);
  }

  window.safeArea = safeArea;
  window.resizeCanvas = resizeCanvas;
  window.onResize = onResize;
  window.rotateHint = rotateHint;
})();
