export class ArkanoidGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.running = false;

    // Physics
    this.paddle = { x: 0, y: 0, w: 100, h: 20 };
    this.ball = { x: 0, y: 0, r: 10, dx: 0, dy: 0, speed: 5, active: false };
    this.bricks = [];

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#2c3e50";

    // Canvas Setup
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText =
      "background: linear-gradient(to bottom, #000000, #434343); width: 100%; height: 100%; display: block;";
    this.c.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    // Resize Handler
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // UI Overlay
    this.ui = document.createElement("div");
    this.ui.style.cssText =
      "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: flex; justify-content: center; align-items: center;";
    this.c.appendChild(this.ui);

    this.startBtn = document.createElement("button");
    this.startBtn.className = "mode-btn kid";
    this.startBtn.textContent = "▶️ Jugar";
    this.startBtn.style.pointerEvents = "auto";
    this.startBtn.onclick = () => this.startGame();
    this.ui.appendChild(this.startBtn);

    // Exit Button
    this.exitBtn = document.createElement("button");
    this.exitBtn.textContent = "🏠";
    this.exitBtn.className = "nav-btn";
    this.exitBtn.style.cssText =
      "position: absolute; top: 10px; right: 10px; pointer-events: auto;";
    this.exitBtn.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(this.exitBtn);

    // Input
    this.canvas.addEventListener("mousemove", (e) =>
      this.movePaddle(e.clientX),
    );
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        this.movePaddle(e.touches[0].clientX);
      },
      { passive: false },
    );

    this.canvas.addEventListener("mousedown", () => this.launchBall());
    this.canvas.addEventListener("touchstart", () => this.launchBall());
  }

  resize() {
    const rect = this.c.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.paddle.y = this.canvas.height - 50;
    this.paddle.w = this.canvas.width * 0.2; // 20% width
    if (this.paddle.w < 80) this.paddle.w = 80;
    if (this.paddle.w > 200) this.paddle.w = 200;
  }

  startGame() {
    this.startBtn.style.display = "none";
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.ball.speed = 5;
    this.running = true;

    document.getElementById("livesContainer").style.display = "inline";
    document.getElementById("gameLives").textContent = this.lives;
    window.app.addScore(0);

    this.startLevel();
  }

  startLevel() {
    this.running = true;
    this.setupLevel();
    this.resetBall();
    this.loop();
  }

  setupLevel() {
    this.bricks = [];
    const rows = 3 + this.level; // Increase rows
    const cols = 6;
    const padding = 10;
    const brickW = (this.canvas.width - padding * (cols + 1)) / cols;
    const brickH = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: padding + c * (brickW + padding),
          y: padding + r * (brickH + padding) + 50, // Offset from top
          w: brickW,
          h: brickH,
          active: true,
          type: Math.random() > 0.5 ? "ice" : "stone",
        });
      }
    }
  }

  resetBall() {
    this.ball.active = false;
    this.ball.x = this.paddle.x + this.paddle.w / 2;
    this.ball.y = this.paddle.y - this.ball.r - 5;
  }

  launchBall() {
    if (this.running && !this.ball.active) {
      this.ball.active = true;
      this.ball.dx = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1);
      this.ball.dy = -this.ball.speed;
    }
  }

  movePaddle(clientX) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    this.paddle.x = x - this.paddle.w / 2;

    // Clamp
    if (this.paddle.x < 0) this.paddle.x = 0;
    if (this.paddle.x + this.paddle.w > this.canvas.width)
      this.paddle.x = this.canvas.width - this.paddle.w;

    if (!this.ball.active) {
      this.ball.x = this.paddle.x + this.paddle.w / 2;
    }
  }

  loop() {
    if (!this.running) return;

    this.update();
    this.draw();

    requestAnimationFrame(() => this.loop());
  }

  update() {
    if (!this.ball.active) return;

    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Walls
    if (
      this.ball.x + this.ball.r > this.canvas.width ||
      this.ball.x - this.ball.r < 0
    ) {
      this.ball.dx *= -1;
      window.app.audio.playTone(200, "square", 0.05);
    }
    if (this.ball.y - this.ball.r < 0) {
      this.ball.dy *= -1;
      window.app.audio.playTone(200, "square", 0.05);
    }

    // Floor (Loss)
    if (this.ball.y - this.ball.r > this.canvas.height) {
      this.lives--;
      document.getElementById("gameLives").textContent = this.lives;
      window.app.audio.playError();
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }

    // Paddle Collision
    // Simple AABB
    if (
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.w &&
      this.ball.y + this.ball.r > this.paddle.y &&
      this.ball.y - this.ball.r < this.paddle.y + this.paddle.h
    ) {
      this.ball.dy = -Math.abs(this.ball.dy); // Force Up
      // Add some English based on hit position
      const hitPoint = this.ball.x - (this.paddle.x + this.paddle.w / 2);
      this.ball.dx = hitPoint * 0.15;
      window.app.audio.playTone(400, "square", 0.1);
    }

    // Brick Collision
    let activeBricks = 0;
    this.bricks.forEach((b) => {
      if (!b.active) return;
      activeBricks++;

      if (
        this.ball.x > b.x &&
        this.ball.x < b.x + b.w &&
        this.ball.y > b.y &&
        this.ball.y < b.y + b.h
      ) {
        b.active = false;
        this.ball.dy *= -1;
        this.score += 10;
        window.app.addScore(10, "arkanoid");
        window.app.audio.playPop();
      }
    });

    if (activeBricks === 0) {
      this.levelUp();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Paddle (Bone 🦴)
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "#ecf0f1";
    // Draw rounded rect
    this.roundRect(
      this.ctx,
      this.paddle.x,
      this.paddle.y,
      this.paddle.w,
      this.paddle.h,
      10,
      true,
    );
    // Center bone emoji
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      "🦴",
      this.paddle.x + this.paddle.w / 2,
      this.paddle.y + this.paddle.h / 2,
    );

    // Ball (Egg 🥚)
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.fillText("🥚", this.ball.x, this.ball.y);

    // Bricks
    this.bricks.forEach((b) => {
      if (b.active) {
        this.ctx.fillStyle = b.type === "ice" ? "#74b9ff" : "#a29bfe";
        this.roundRect(this.ctx, b.x, b.y, b.w, b.h, 5, true);
        this.ctx.font = "20px Arial";
        this.ctx.fillText(
          b.type === "ice" ? "🧊" : "🪨",
          b.x + b.w / 2,
          b.y + b.h / 2,
        );
      }
    });
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height,
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  levelUp() {
    this.running = false;
    this.level++;

    if (this.level > 5) {
      this.finalVictory();
      return;
    }

    this.ball.speed += 1;
    window.app.audio.playWin();

    this.ui.innerHTML = "";
    const msg = document.createElement("div");
    msg.style.cssText = "color: white; font-size: 2em; text-align: center;";
    msg.innerHTML = `<h1>¡Nivel ${this.level}!</h1><p>Más rápido...</p>`;
    this.ui.appendChild(msg);

    setTimeout(() => {
      this.ui.innerHTML = "";
      this.startLevel();
    }, 2000);
  }

  finalVictory() {
    this.running = false;
    window.app.audio.playWin();
    window.app.updateParentStats(this.score + 100, 1, "arkanoid");

    this.ui.innerHTML = "";
    this.ui.style.pointerEvents = "auto";
    this.ui.innerHTML = `
                    <div style="text-align: center; background: rgba(255,255,255,0.9); padding: 30px; border-radius: 20px;">
                        <div style="font-size: 6em;">🏆</div>
                        <h1 style="color: #2ecc71;">¡Victoria Final!</h1>
                        <p style="font-size: 1.5em;">¡Completaste los 5 Niveles!</p>
                        <p>Puntuación: ${this.score}</p>
                        <button class="mode-btn kid" style="background:#2ecc71; margin-top: 10px;" onclick="window.app.gameInstance.startGame()">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                    </div>
                `;
  }

  gameOver() {
    this.running = false;
    window.app.audio.playError();
    window.app.updateParentStats(this.score, 1, "arkanoid");

    this.ui.innerHTML = "";
    this.ui.style.pointerEvents = "auto"; // Re-enable clicks
    this.ui.innerHTML = `
                    <div style="text-align: center; background: rgba(255,255,255,0.9); padding: 30px; border-radius: 20px;">
                        <h1>¡Fin del Juego!</h1>
                        <p>Puntuación: ${this.score}</p>
                        <button class="mode-btn kid" style="background:#2ecc71;" onclick="window.app.gameInstance.startGame()">🔄 Reintentar</button>
                    </div>
                `;
  }

  cleanup() {
    this.running = false;
  }
}
