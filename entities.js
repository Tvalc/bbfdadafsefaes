// Entities.js - Defines all game objects, logic, and collisions

(function() {
  const GAME_WIDTH = 480, GAME_HEIGHT = 800;
  const PLAYER_WIDTH = 36, PLAYER_HEIGHT = 38;
  const ENEMY_WIDTH = 32, ENEMY_HEIGHT = 32;
  const BULLET_WIDTH = 6, BULLET_HEIGHT = 20;

  const Entities = {
    powerups: [],
    init() {
      this.powerups = [];
    },
    createPlayer(x, y) {
      return {
        x: x,
        y: y,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        speed: 330,
        color: "#7ef6ff",
        targetDx: 0,
        shootCooldown: 0,
        power: 1,
        powerTimer: 0,
        invuln: 0,
        update(dt) {
          // Movement
          if (Math.abs(this.targetDx) > 0.1) {
            this.x += this.targetDx * this.speed * dt;
          }
          // Keyboard fallback
          if (Entities._keyLeft) this.x -= this.speed * dt;
          if (Entities._keyRight) this.x += this.speed * dt;
          // Clamp to arena
          this.x = Math.max(this.w/2, Math.min(GAME_WIDTH-this.w/2, this.x));
          // Shoot cooldown
          if (this.shootCooldown > 0) this.shootCooldown -= dt;
          // Powerup timer
          if (this.power > 1) {
            this.powerTimer -= dt;
            if (this.powerTimer <= 0) this.power = 1;
          }
          // Invulnerability
          if (this.invuln > 0) this.invuln -= dt;
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          if (this.invuln > 0) {
            ctx.globalAlpha = 0.43 + 0.43 * Math.sin(Date.now() * 0.02);
          }
          // Body
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(0, -this.h/2);
          ctx.lineTo(this.w/2, this.h/2);
          ctx.lineTo(0, this.h/2-10);
          ctx.lineTo(-this.w/2, this.h/2);
          ctx.closePath();
          ctx.fill();
          // Cockpit
          ctx.beginPath();
          ctx.arc(0, 4, 7, 0, 2 * Math.PI);
          ctx.fillStyle = "#1e5d7d";
          ctx.fill();
          ctx.restore();
        },
        powerUp() {
          this.power = 2;
          this.powerTimer = 7;
        }
      };
    },
    createEnemy(x, y, type, level) {
      if (type === 'boss') {
        // Boss enemy
        return {
          x, y,
          w: 72, h: 60,
          type: 'boss',
          hp: 16 + 4 * level,
          coldown: 0,
          dir: 1,
          score: 300 + 20 * level,
          update(dt) {
            this.y += 25 * dt;
            this.x += this.dir * (42 + 2 * level) * dt;
            if (this.x > GAME_WIDTH - this.w/2) { this.x = GAME_WIDTH - this.w/2; this.dir *= -1; }
            if (this.x < this.w/2) { this.x = this.w/2; this.dir *= -1; }
            // Shoot
            this.coldown -= dt;
            if (this.coldown <= 0) {
              window.StellarGame.spawnEnemyBullet(this.x, this.y+this.h/2, 270 + Math.random()*40-20, 1.5);
              this.coldown = 0.65 - 0.03 * level;
            }
          },
          draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            // Main body
            ctx.beginPath();
            ctx.moveTo(0, -this.h/2);
            ctx.lineTo(this.w/2, 0);
            ctx.lineTo(0, this.h/2);
            ctx.lineTo(-this.w/2, 0);
            ctx.closePath();
            ctx.fillStyle = "#e95252";
            ctx.shadowColor = "#ff6266";
            ctx.shadowBlur = 7;
            ctx.fill();
            ctx.shadowBlur = 0;
            // "Eyes"
            ctx.beginPath();
            ctx.arc(-18, 4, 7, 0, 2 * Math.PI);
            ctx.arc(18, 4, 7, 0, 2 * Math.PI);
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now()*0.018);
            ctx.fill();
            ctx.globalAlpha = 1;
            // HP bar
            ctx.fillStyle = "#111";
            ctx.fillRect(-26, -this.h/2 - 12, 52, 7);
            ctx.fillStyle = "#8aff86";
            ctx.fillRect(-25, -this.h/2 - 11, Math.max(0, 50 * Math.max(0, this.hp) / (16 + 4 * level)), 5);
            ctx.restore();
          }
        };
      }
      // Normal enemy
      let color = "#f6e97e";
      if (level % 2 == 0) color = "#a2e0fc";
      if (level % 3 == 0) color = "#f294ff";
      return {
        x, y,
        w: ENEMY_WIDTH, h: ENEMY_HEIGHT,
        type: 'normal',
        hp: 2 + Math.floor(level/3),
        score: 50 + 6 * level,
        coldown: Math.random()*1.4+0.6,
        dir: Math.random()>0.5?1:-1,
        update(dt) {
          this.y += 28 + level * (dt*4);
          this.x += this.dir * (17 + Math.min(level,10)*2) * dt;
          if (this.x > GAME_WIDTH-this.w/2) { this.x = GAME_WIDTH-this.w/2; this.dir *= -1; }
          if (this.x < this.w/2) { this.x = this.w/2; this.dir *= -1; }
          // Shoot
          this.coldown -= dt;
          if (this.coldown<=0 && Math.random()<0.33) {
            window.StellarGame.spawnEnemyBullet(this.x, this.y+this.h/2, 390, 1);
            this.coldown = Math.random()*1.7+0.6;
          }
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          ctx.moveTo(0, -this.h/2);
          ctx.lineTo(this.w/2, 0);
          ctx.lineTo(this.w/3, this.h/2);
          ctx.lineTo(-this.w/3, this.h/2);
          ctx.lineTo(-this.w/2, 0);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      };
    },
    createBullet(x, y, power) {
      // Player bullet(s)
      let bullets = [];
      if (power > 1) {
        // Spread shot
        bullets.push(Entities._makeBullet(x-10, y, -0.13));
        bullets.push(Entities._makeBullet(x, y, 0));
        bullets.push(Entities._makeBullet(x+10, y, 0.13));
      } else {
        bullets.push(Entities._makeBullet(x, y, 0));
      }
      return (power > 1) ? bullets : bullets[0];
    },
    _makeBullet(x, y, dx) {
      return {
        x, y,
        w: BULLET_WIDTH, h: BULLET_HEIGHT,
        color: "#23f5e1",
        dy: -510,
        dx: dx || 0,
        damage: 1,
        update(dt) {
          this.y += this.dy * dt;
          this.x += this.dx * 280 * dt;
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          ctx.moveTo(0, -this.h/2);
          ctx.lineTo(this.w/2, this.h/2);
          ctx.lineTo(-this.w/2, this.h/2);
          ctx.closePath();
          ctx.fillStyle = this.color;
          ctx.shadowColor = "#7ef6ff";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      };
    },
    createEnemyBullet(x, y, angle, damage) {
      // angle in degrees
      let rad = (angle || 90) * Math.PI / 180;
      return {
        x, y,
        w: 8, h: 16,
        color: "#ff5c5c",
        dy: Math.sin(rad) * 270,
        dx: Math.cos(rad) * 60,
        damage: damage || 1,
        update(dt) {
          this.y += this.dy * dt;
          this.x += this.dx * dt;
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(Math.atan2(this.dy, this.dx) + Math.PI/2);
          ctx.beginPath();
          ctx.moveTo(0, -this.h/2);
          ctx.lineTo(this.w/2, this.h/2);
          ctx.lineTo(-this.w/2, this.h/2);
          ctx.closePath();
          ctx.fillStyle = this.color;
          ctx.shadowColor = "#f55";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      };
    },
    spawnPowerUp(x, y, kind) {
      // kind 1 = firepower, 2 = life
      window.StellarGame.spawnPowerup(this.createPowerUp(x, y, kind));
    },
    createPowerUp(x, y, kind) {
      // kind 1: gun, 2: heart
      let color = kind === 2 ? "#f87baf" : "#5ffbaf";
      return {
        x, y,
        w: 24, h: 24,
        kind,
        update(dt) {
          this.y += 70 * dt;
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          if (this.kind === 1) {
            // Gun
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI*2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.fillStyle = "#222";
            ctx.fillRect(-3, -8, 6, 11);
            ctx.fillStyle = "#fff";
            ctx.fillRect(-1.5, -6, 3, 8);
          } else {
            // Heart
            ctx.beginPath();
            ctx.moveTo(0, 7);
            ctx.bezierCurveTo(10, -7, 14, 11, 0, 15);
            ctx.bezierCurveTo(-14, 11, -10, -7, 0, 7);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.3;
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }
      };
    },
    // Simple AABB collision
    collides(a, b) {
      if (!a || !b) return false;
      return Math.abs(a.x - b.x) < (a.w + b.w)/2 &&
             Math.abs(a.y - b.y) < (a.h + b.h)/2;
    },
    // For keyboard fallback in player movement
    _keyLeft: false,
    _keyRight: false
  };

  window.Entities = Entities;
})();