export class SoccerGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.goals = 0;
    this.shots = 0;
    this.maxShots = 5;
    this.running = true;

    this.ball = { x: 50, y: 80, active: false, vx: 0, vy: 0 };
    this.keeper = { x: 50, dir: 1, speed: 1.5 }; // Speed increases?
    this.aim = { angle: 0, dir: 1 }; // -45 to 45 deg

    this.init();
  }

  init() {
    this.c.style.background = "#4CAF50";
    this.c.style.position = "relative";
    this.c.style.overflow = "hidden";
    this.c.innerHTML = "";

    // Field Markings (Center Circle/Penalty Box visual css)
    this.c.innerHTML += `
                    <div style="position:absolute; top:0; left:20%; width:60%; height:150px; border: 5px solid white; border-top:0;"></div>
                    <div style="position:absolute; top:50%; left:50%; width:100px; height:100px; border: 5px solid white; border-radius:50%; transform:translate(-50%,-50%);"></div>
                    <div style="position:absolute; top:0; left:35%; width:30%; height:10px; background:white;"></div> <!-- Goal Line -->
                `;

    // Keeper 🦖
    this.keeperEl = document.createElement("div");
    this.keeperEl.textContent = "🦖";
    this.keeperEl.style.cssText = `
                    position: absolute; top: 10%; left: 50%; font-size: 5em;
                    transform: translate(-50%, -50%); transition: left 0.1s linear;
                    z-index: 5;
                `;
    this.c.appendChild(this.keeperEl);

    // Ball ⚽
    this.ballEl = document.createElement("div");
    this.ballEl.textContent = "⚽";
    this.ballEl.style.cssText = `
                    position: absolute; top: 80%; left: 50%; font-size: 3em;
                    transform: translate(-50%, -50%); z-index: 10;
                `;
    this.c.appendChild(this.ballEl);

    // Player 🦕
    const playerEl = document.createElement("div");
    playerEl.textContent = "🦕";
    playerEl.style.cssText = `
                    position: absolute; top: 90%; left: 50%; font-size: 4em;
                    transform: translate(-50%, -50%); z-index: 9;
                `;
    this.c.appendChild(playerEl);

    // Aim Arrow ⬆️
    this.arrowEl = document.createElement("div");
    this.arrowEl.textContent = "⬆️";
    this.arrowEl.style.cssText = `
                    position: absolute; top: 75%; left: 50%; font-size: 3em;
                    transform: translate(-50%, -50%); z-index: 8; transform-origin: bottom center;
                    color: yellow; text-shadow: 0 0 5px black;
                `;
    this.c.appendChild(this.arrowEl);

    // Shoot Button
    const btn = document.createElement("button");
    btn.textContent = "👟 CHUTAR";
    btn.className = "mode-btn kid";
    btn.style.cssText = `
                    position: absolute; bottom: 20px; right: 20px;
                    background: #ff5722; width: auto; font-size: 1.2em;
                    z-index: 20;
                `;
    btn.onclick = () => this.shoot();
    this.c.appendChild(btn);

    // Score UI
    this.scoreEl = document.createElement("div");
    this.scoreEl.style.cssText = `
                    position: absolute; top: 10px; left: 10px;
                    background: rgba(0,0,0,0.5); color: white; padding: 10px 20px;
                    border-radius: 20px; font-size: 1.5em; z-index:20;
                `;
    this.updateScoreUI();
    this.c.appendChild(this.scoreEl);

    this.loop();
  }

  loop() {
    if (!this.running) return;

    // 1. Move Keeper
    if (this.keeper.x > 80 || this.keeper.x < 20) this.keeper.dir *= -1;
    this.keeper.x += this.keeper.speed * this.keeper.dir;
    this.keeperEl.style.left = this.keeper.x + "%";

    // 2. Oscillate Aim
    // If ball is not active (waiting to shoot)
    if (!this.ball.active) {
      if (this.aim.angle > 45 || this.aim.angle < -45) this.aim.dir *= -1;
      this.aim.angle += 1.5 * this.aim.dir;
      this.arrowEl.style.transform = `translate(-50%, -50%) rotate(${this.aim.angle}deg)`;
    }

    // 3. Move Ball
    if (this.ball.active) {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;

      this.ballEl.style.left = this.ball.x + "%";
      this.ballEl.style.top = this.ball.y + "%";

      // Collision Check Logic
      this.checkBallStatus();
    }

    requestAnimationFrame(() => this.loop());
  }

  shoot() {
    if (this.ball.active || !this.running) return;

    window.app.audio.playPop(); // Kick sound placeholder
    this.ball.active = true;

    // Convert Angle to Vector
    // -45 (Left) to 45 (Right)
    // 0 deg is straight Up (Y decreases)
    const rad = (this.aim.angle - 90) * (Math.PI / 180); // Correct math?
    // Actually 0 deg rotation visually points UP.
    // Rotate CSS: 0 is UP. Math Sin/Cos: 0 is Right.
    // Let's use simplified vectors based on visual angle.
    const radVisual = (this.aim.angle - 90) * (Math.PI / 180);

    const speed = 1.5;
    this.ball.vx = Math.cos(radVisual) * speed;
    this.ball.vy = Math.sin(radVisual) * speed;

    // Hide Arrow
    this.arrowEl.style.opacity = "0";
  }

  checkBallStatus() {
    // Goal Line is approx y = 10%
    if (this.ball.y < 12) {
      // Check Keeper Collision (Simple X overlap range)
      // Keeper width approx 10% of screen
      const kLeft = this.keeper.x - 8;
      const kRight = this.keeper.x + 8;

      if (this.ball.x > kLeft && this.ball.x < kRight) {
        this.finishShot("blocked");
      } else if (this.ball.x > 30 && this.ball.x < 70) {
        // Goal Post Width (approx center 40%)
        this.finishShot("goal");
      } else {
        this.finishShot("miss");
      }
    }
  }

  finishShot(result) {
    this.ball.active = false;
    this.shots++;

    // Visual Feedback
    const fb = document.createElement("div");
    fb.style.cssText = `
                    position:absolute; top:40%; left:50%; transform:translateX(-50%);
                    font-size: 5em; font-weight:bold; z-index:100;
                    text-shadow: 0 5px 10px rgba(0,0,0,0.5);
                `;

    if (result === "goal") {
      window.app.audio.playWin(); // Cheer?
      this.goals++;
      fb.textContent = "¡GOL! ⚽";
      fb.style.color = "#ffeb3b";
    } else if (result === "blocked") {
      window.app.audio.playError();
      fb.textContent = "¡PARADA! 🧤";
      fb.style.color = "orange";
      this.keeperEl.textContent = "🙌"; // Hands up
    } else {
      window.app.audio.playError();
      fb.textContent = "FUERA 💨";
      fb.style.color = "#e74c3c";
    }

    this.c.appendChild(fb);
    this.updateScoreUI();

    // Reset Round or End Game
    setTimeout(() => {
      fb.remove();
      this.keeperEl.textContent = "🦖";
      if (this.shots >= this.maxShots) {
        this.endGame();
      } else {
        // Reset Ball
        this.ball.active = false;
        this.ball.x = 50;
        this.ball.y = 80;
        this.ballEl.style.left = "50%";
        this.ballEl.style.top = "80%";
        this.arrowEl.style.opacity = "1";
      }
    }, 1500);
  }

  updateScoreUI() {
    this.scoreEl.textContent = `Goles: ${this.goals} / ${this.shots} (Max 5)`;
  }

  endGame() {
    this.running = false;
    const won = this.goals >= 3;
    const msg = won ? "¡Victoria!" : "Buen intento";
    const color = won ? "var(--success-color)" : "orange";

    if (won) window.app.updateParentStats(30, 1, "soccer");

    this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 20px; margin-top: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="font-size: 6em;">${won ? "🏆" : "👟"}</div>
                        <h2 style="color: ${color};">${msg}</h2>
                        <p style="font-size: 1.5em; margin: 10px 0;">Marcaste ${this.goals} de 5 goles</p>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Volver al Menú</button>
                    </div>
                `;
  }

  cleanup() {
    this.running = false;
  }
}
