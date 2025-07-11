// Input.js - Handles keyboard, mouse, and touch input for the player

(function() {
  const Input = {
    _drag: false,
    _lastX: null,
    _moveThresh: 7,
    init(canvas) {
      // Keyboard
      window.addEventListener("keydown", e => {
        if (e.repeat) return;
        if (e.code === "ArrowLeft" || e.code === "KeyA") Entities._keyLeft = true;
        if (e.code === "ArrowRight" || e.code === "KeyD") Entities._keyRight = true;
        if (e.code === "Space") {
          window.StellarGame.shoot();
        }
      });
      window.addEventListener("keyup", e => {
        if (e.code === "ArrowLeft" || e.code === "KeyA") Entities._keyLeft = false;
        if (e.code === "ArrowRight" || e.code === "KeyD") Entities._keyRight = false;
      });
      // Mouse/touch
      canvas.addEventListener("pointerdown", e => {
        Input._drag = true;
        Input._lastX = e.clientX;
        // Tap to shoot
        if (e.pointerType === "touch" || e.pointerType === "mouse") {
          window.StellarGame.shoot();
        }
      });
      canvas.addEventListener("pointermove", e => {
        if (!Input._drag) return;
        let dx = e.clientX - (Input._lastX || e.clientX);
        if (Math.abs(dx) > Input._moveThresh) {
          window.StellarGame.movePlayer(dx > 0 ? 1 : -1);
          Input._lastX = e.clientX;
        }
      });
      window.addEventListener("pointerup", e => {
        Input._drag = false;
        Input._lastX = null;
        window.StellarGame.stopPlayer();
      });
      // Prevent scrolling on mobile
      canvas.addEventListener("touchstart", e => e.preventDefault());
      canvas.addEventListener("touchmove", e => e.preventDefault());
      canvas.addEventListener("touchend", e => e.preventDefault());
    }
  };

  window.Input = Input;
})();