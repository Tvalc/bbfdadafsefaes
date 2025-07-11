// Main game logic - conflict-free version
const canvas = document.getElementById("game") || document.createElement("canvas");
window.canvas = canvas;
canvas.width = 800;
canvas.height = 600;
canvas.id = 'gameCanvas';
if (!document.getElementById('gameCanvas')) {
    document.getElementById('game-container')?.appendChild(canvas);
}

const ctx = canvas.getContext("2d");
window.ctx = ctx;

// Game state
const game = { running: false, objects: [] };
window.game = game;

// Main game loop
function gameLoop() {
    if (!ctx || !canvas) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game objects
    game.objects.forEach(obj => {
        if (obj.update) obj.update();
        if (obj.draw) obj.draw(ctx);
    });
    
    // Continue loop
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
game.running = true;
console.log('🎮 Game started!');
gameLoop();