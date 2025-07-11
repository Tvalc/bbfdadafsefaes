// UI.js - Handles overlays, HUD, and UI interactivity

(function() {
  const UI = {
    scoreEl: null,
    livesEl: null,
    levelEl: null,
    overlay: null,
    startScreen: null,
    gameOverScreen: null,
    pauseScreen: null,
    finalScoreEl: null,
    flashTimeout: null,
    init() {
      this.scoreEl = document.getElementById("score-label");
      this.livesEl = document.getElementById("lives-label");
      this.levelEl = document.getElementById("level-label");
      this.overlay = document.getElementById("ui-overlay");
      this.startScreen = document.getElementById("start-screen");
      this.gameOverScreen = document.getElementById("game-over-screen");
      this.pauseScreen = document.getElementById("pause-screen");
      this.finalScoreEl = document.getElementById("final-score");

      document.getElementById("start-btn").onclick = () => window.StellarGame.startGame();
      document.getElementById("restart-btn").onclick = () => window.StellarGame.startGame();
      document.getElementById("resume-btn").onclick = () => window.StellarGame.togglePause(false);
      document.getElementById("pause-btn").onclick = () => window.StellarGame.togglePause();

      // Allow keyboard controls for start/pause/restart
      document.addEventListener("keydown", e => {
        if (this.overlay && !this.overlay.classList.contains("hidden")) {
          if (e.code === "Space" || e.code === "Enter") {
            if (!this.startScreen.classList.contains("hidden")) window.StellarGame.startGame();
            if (!this.gameOverScreen.classList.contains("hidden")) window.StellarGame.startGame();
            if (!this.pauseScreen.classList.contains("hidden")) window.StellarGame.togglePause(false);
          }
        } else if (e.code === "Escape") {
          window.StellarGame.togglePause();
        }
      });
    },
    showStart() {
      this.overlay.classList.remove("hidden");
      this.startScreen.classList.remove("hidden");
      this.gameOverScreen.classList.add("hidden");
      this.pauseScreen.classList.add("hidden");
    },
    showGameOver(score, high) {
      this.overlay.classList.remove("hidden");
      this.startScreen.classList.add("hidden");
      this.gameOverScreen.classList.remove("hidden");
      this.pauseScreen.classList.add("hidden");
      this.finalScoreEl.innerHTML = `Score: <b>${score}</b><br>High Score: <b>${high}</b>`;
    },
    showPause() {
      this.overlay.classList.remove("hidden");
      this.startScreen.classList.add("hidden");
      this.gameOverScreen.classList.add("hidden");
      this.pauseScreen.classList.remove("hidden");
    },
    hideOverlay() {
      this.overlay.classList.add("hidden");
    },
    setScore(score) {
      if (this.scoreEl) this.scoreEl.textContent = "Score: " + score;
    },
    setLives(lives) {
      if (this.livesEl) this.livesEl.textContent = "Lives: " + lives;
    },
    setLevel(level) {
      if (this.levelEl) this.levelEl.textContent = "Level: " + level;
    },
    flashLives() {
      if (!this.livesEl) return;
      this.livesEl.style.background = "#ff4e4e";
      this.livesEl.style.color = "#fff";
      if (this.flashTimeout) clearTimeout(this.flashTimeout);
      this.flashTimeout = setTimeout(() => {
        this.livesEl.style.background = "rgba(20,25,40,0.74)";
        this.livesEl.style.color = "#fff";
      }, 500);
    }
  };

  window.UI = UI;
})();