/* Петрин свет — shared pointer/touch helpers
   Standardized drag behavior: pointer capture, second-finger filter,
   cleanup on cancel/leave/orientation change/hidden. */
(function () {
  'use strict';

  // Wire up pointer events on a drag element with capture and auto-cleanup.
  // Returns a release function to remove all listeners.
  function pointerDrag(el, handlers) {
    if (!el) return function () {};
    const state = { pointerId: null, active: false };

    function onDown(e) {
      if (state.active) return; // ignore second finger
      state.active = true;
      state.pointerId = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      if (handlers.down) handlers.down(e);
    }

    function onMove(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      if (handlers.move) handlers.move(e);
    }

    function onUp(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      state.active = false;
      if (handlers.up) handlers.up(e);
    }

    function onCancel(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      state.active = false;
      if (handlers.cancel) handlers.cancel(e);
    }

    function onLost(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      state.active = false;
      if (handlers.cancel) handlers.cancel(e);
    }

    function reset() {
      state.active = false;
      state.pointerId = null;
    }

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('lostpointercapture', onLost);
    document.addEventListener('visibilitychange', reset);
    window.addEventListener('orientationchange', reset);

    return function release() {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('lostpointercapture', onLost);
      document.removeEventListener('visibilitychange', reset);
      window.removeEventListener('orientationchange', reset);
    };
  }

  // Reset transient input state — call on blur, visibility change, orientation change.
  function resetInput(state) {
    if (!state) return;
    for (const k in state) {
      if (typeof state[k] === 'boolean') state[k] = false;
      else if (typeof state[k] === 'number') state[k] = 0;
    }
  }

  window.pointerDrag = pointerDrag;
  window.resetInput = resetInput;
})();
