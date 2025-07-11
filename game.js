// Stellar Defender Main Game Logic
window.StellarGame = window.StellarGame || {};
(function() {
  const GAME_WIDTH = 480;
  const GAME_HEIGHT = 800;
  const STAR_COUNT = 64;

  let canvas, ctx, lastTime = 0;
  let running = false, paused = false, over = false;
  let score = 0, lives = 3, level = 1;
  let stars = [], player, enemies = [], bullets = [], enemyBullets = [];
  let levelCooldown = 0, enemyWaveTimer = 0;
  let touchShootLock = false;
  let highScore = 0;

  // Utility
  function rand(min, max) { return Math.random()*(max-min)+min; }

  function resizeCanvas() {
    // Fit canvas to viewport, maintaining aspect ratio
    let w = window.innerWidth, h = window.innerHeight;
    let scale = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    canvas.style.width = (GAME_WIDTH * scale) + "px";
    canvas.style.height = (GAME_HEIGHT * scale) + "px";
  }

  function resetGameVars() {
    score = 0;
    lives = 3;
    level = 1;
    stars = [];
    enemies = [];
    bullets = [];
    enemyBullets = [];
    levelCooldown = 0;
    enemyWaveTimer = 0;
    player = Entities.createPlayer(GAME_WIDTH/2, GAME_HEIGHT-70);
    for (let i=0; i<STAR_COUNT; ++i) {
      stars.push({
        x: rand(0, GAME_WIDTH),
        y: rand(0, GAME_HEIGHT),
        speed: rand(0.7,2.5),
        size: rand(0.7,1.8)
      });
    }
  }

  function spawnEnemyWave() {
    let rows = Math.min(2 + Math.floor(level/2), 6), cols = Math.min(4 + level, 10);
    let spacingX = GAME_WIDTH / (cols+1), spacingY = 60 + level*2;
    for (let r=0; r<rows; ++r) {
      for (let c=0; c<cols; ++c) {
        let ex = spacingX*(c+1);
        let ey = 60 + r*spacingY;
        let type = (level % 5 === 0 && r === 0 && c === Math.floor(cols/2)) ? 'boss' : 'normal';
        enemies.push(Entities.createEnemy(ex, ey, type, level));
      }
    }
  }

  function update(dt) {
    // Stars
    stars.forEach(s=>{
      s.y += s.speed*dt*0.7;
      if(s.y>GAME_HEIGHT) { s.y=0; s.x=rand(0,GAME_WIDTH);}
    });
    // Player
    player.update(dt);
    // Bullets
    for (let i=bullets.length-1; i>=0; --i) {
      let b = bullets[i]; b.update(dt);
      if(b.y < -30) bullets.splice(i,1);
    }
    // Enemies
    for (let i=enemies.length-1; i>=0; --i) {
      let e=enemies[i];
      e.update(dt);
      // Remove if offscreen or dead
      if(e.hp<=0 || e.y > GAME_HEIGHT+50) {
        if(e.hp<=0) {
          score += e.score;
          if(Math.random()<0.06) Entities.spawnPowerUp(e.x,e.y,e.type==='boss'?2:1);
        }
        enemies.splice(i,1);
      }
    }
    // Enemy Bullets
    for(let i=enemyBullets.length-1; i>=0; --i) {
      let eb = enemyBullets[i];
      eb.update(dt);
      if(eb.y > GAME_HEIGHT+30) enemyBullets.splice(i,1);
    }
    // PowerUps
    for(let i=Entities.powerups.length-1; i>=0; --i) {
      let p=Entities.powerups[i]; p.update(dt);
      if(p.y>GAME_HEIGHT+20) Entities.powerups.splice(i,1);
    }

    // Collisions
    // Player bullets vs enemies
    for(let i=bullets.length-1; i>=0; --i) {
      let b=bullets[i]; let hit = false;
      for(let j=enemies.length-1; j>=0; --j) {
        let e=enemies[j];
        if(Entities.collides(b,e)) {
          e.hp -= b.damage;
          bullets.splice(i,1); hit=true; break;
        }
      }
      if(hit) continue;
    }
    // Enemy bullets vs player
    if(!player.invuln) {
      for(let i=enemyBullets.length-1; i>=0; --i) {
        let eb = enemyBullets[i];
        if(Entities.collides(eb,player)) {
          loseLife();
          enemyBullets.splice(i,1);
          break;
        }
      }
    }
    // Enemies vs player (ramming)
    if(!player.invuln) {
      for(let i=enemies.length-1; i>=0; --i) {
        let e = enemies[i];
        if(Entities.collides(e,player)) {
          loseLife();
          enemies.splice(i,1);
          break;
        }
      }
    }
    // PowerUps
    for(let i=Entities.powerups.length-1; i>=0; --i) {
      let p=Entities.powerups[i];
      if(Entities.collides(p,player)) {
        if(p.kind===1) { player.powerUp(); }
        if(p.kind===2) { lives = Math.min(5,lives+1);}
        Entities.powerups.splice(i,1);
      }
    }
    // Next wave
    if(enemies.length===0 && levelCooldown<=0) {
      level++;
      levelCooldown = 1.3;
    }
    if(levelCooldown>0) {
      levelCooldown-=dt;
      if(levelCooldown<=0) spawnEnemyWave();
    }
    // Enemy waves
    enemyWaveTimer += dt;
    // Update HUD
    UI.setScore(score);
    UI.setLives(lives);
    UI.setLevel(level);
  }

  function loseLife() {
    lives--;
    UI.flashLives();
    player.invuln = 1.5;
    if(lives<=0) {
      gameOver();
    }
  }

  function render() {
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    // BG stars
    ctx.save();
    for(let s of stars) {
      ctx.globalAlpha = 0.40 + 0.17*Math.sin(s.y*0.03);
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.size,0,2*Math.PI);
      ctx.fillStyle='#fff';
      ctx.fill();
    }
    ctx.restore();
    // Entities
    for(let e of enemies) e.draw(ctx);
    for(let b of bullets) b.draw(ctx);
    for(let eb of enemyBullets) eb.draw(ctx);
    for(let p of Entities.powerups) p.draw(ctx);
    player.draw(ctx);
    // Level up text
    if(levelCooldown>0 && level>1) {
      ctx.save();
      ctx.font = "bold 36px Segoe UI, Arial";
      ctx.fillStyle = "#7df6ff";
      ctx.textAlign = "center";
      ctx.globalAlpha = Math.min(1, levelCooldown*1.2);
      ctx.fillText("Level "+level, GAME_WIDTH/2, GAME_HEIGHT/2-10);
      ctx.restore();
    }
  }

  function loop(ts) {
    if(!running) return;
    let dt = Math.min(1,(ts-lastTime)/1000);
    lastTime = ts;
    if(!paused && !over) update(dt);
    render();
    if(running) requestAnimationFrame(loop);
  }

  // Main controls
  function startGame() {
    over = false; paused = false;
    resetGameVars();
    UI.hideOverlay();
    running = true;
    lastTime = performance.now();
    spawnEnemyWave();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    over = true;
    running = false;
    highScore = Math.max(highScore, score);
    UI.showGameOver(score, highScore);
  }

  function togglePause(force) {
    if(over) return;
    paused = (force!==undefined) ? !!force : !paused;
    if(paused) UI.showPause();
    else UI.hideOverlay();
    if(!paused && running) {
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  // Input integration
  window.StellarGame.shoot = function() {
    if(over||paused) return;
    if(player.shootCooldown<=0) {
      bullets.push(Entities.createBullet(player.x, player.y-33, player.power));
      player.shootCooldown = player.power>1 ? 0.16 : 0.28;
    }
  };
  window.StellarGame.movePlayer = function(dx) {
    if(over||paused) return;
    player.targetDx = dx;
  };
  window.StellarGame.stopPlayer = function() {
    if(over||paused) return;
    player.targetDx = 0;
  };

  // Called by enemy entities to shoot
  window.StellarGame.spawnEnemyBullet = function(x,y,speed,damage) {
    enemyBullets.push(Entities.createEnemyBullet(x,y,speed,damage));
  };

  // Power up & enemy spawn
  window.StellarGame.spawnEnemy = function(e) { enemies.push(e); };

  // For powerups
  window.StellarGame.spawnPowerup = function(p) { Entities.powerups.push(p); };

  // UI triggers
  window.StellarGame.startGame = startGame;
  window.StellarGame.togglePause = togglePause;

  // Responsive
  window.addEventListener('resize', resizeCanvas);

  // Boot
  window.addEventListener('DOMContentLoaded', ()=>{
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    Entities.init();
    UI.init();
    Input.init(canvas);
    UI.showStart();
  });

})();