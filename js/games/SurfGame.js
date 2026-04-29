export class SurfGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.score = 0;
    this.lives = 3;
    this.stars = 0; // Win Tracker
    this.goal = 10; // Win Goal
    this.running = true;
    this.items = [];
    this.width = this.c.offsetWidth;
    this.height = this.c.offsetHeight;

    // Player Position (percentage 0-100)
    this.pX = 50;

    this.init();
  }

  init() {
    this.c.style.background =
      "linear-gradient(180deg, #43cea2 0%, #185a9d 100%)";
    this.c.style.position = "relative";
    this.c.style.overflow = "hidden";
    this.c.innerHTML = ""; // Clear

    // Dino Character (Composite: Dino + Board)
    this.dinoEl = document.createElement("div");
    this.dinoEl.style.cssText = `
                    position: absolute; bottom: 15%; left: 50%;
                    transform: translateX(-50%); pointer-events: none;
                    z-index: 10; display: flex; flex-direction: column; align-items: center;
                `;

    // Dino Sprite
    const dinoSprite = document.createElement("div");
    dinoSprite.textContent = "🦕";
    dinoSprite.style.fontSize = "4em";
    dinoSprite.style.zIndex = "2";
    dinoSprite.style.marginBottom = "-15px"; // Overlap board

    // Surfboard Sprite (using a shape or emoji)
    const boardSprite = document.createElement("div");
    boardSprite.style.cssText = `
                    width: 80px; height: 20px; background: #FF9800;
                    border-radius: 20px; border: 3px solid #E65100;
                    box-shadow: 0 5px 10px rgba(0,0,0,0.3);
                `;

    this.dinoEl.appendChild(dinoSprite);
    this.dinoEl.appendChild(boardSprite);
    this.c.appendChild(this.dinoEl);

    // UI: Star Counter
    const ui = document.createElement("div");
    ui.style.cssText = `
                    position: absolute; top: 10px; left: 10px;
                    background: rgba(255,255,255,0.8); padding: 5px 15px;
                    border-radius: 20px; font-size: 1.5em; font-weight: bold;
                    color: #f1c40f; border: 2px solid #f39c12;
                `;
    ui.id = "surfStarCounter";
    ui.textContent = `⭐ ${this.stars}/${this.goal}`;
    this.c.appendChild(ui);

    // Lives
    document.getElementById("livesContainer").style.display = "inline";
    this.updateLives();

    this.bindControls();
    this.loop();
    this.spawnLoop();
  }

  bindControls() {
    this.inputHandler = (e) => {
      if (!this.running) return;
      const rect = this.c.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let x = clientX - rect.left;

      // Clamp
      x = Math.max(0, Math.min(this.width, x));

      // Convert to percentage for responsiveness
      this.pX = (x / this.width) * 100;
      this.dinoEl.style.left = this.pX + "%";

      // Flip sprite based on movement direction? (Optional polish)
    };

    window.addEventListener("mousemove", this.inputHandler);
    window.addEventListener("touchmove", this.inputHandler, { passive: false });
  }

  spawnLoop() {
    if (!this.running) return;

    // Random spawn interval 0.8s - 1.5s
    const type = Math.random() > 0.4 ? "bad" : "good"; // More bad guys!
    this.spawnItem(type);

    setTimeout(() => this.spawnLoop(), Math.random() * 800 + 700);
  }

  spawnItem(type) {
    const el = document.createElement("div");
    const isBad = type === "bad";
    const emoji = isBad ? (Math.random() > 0.5 ? "🦈" : "🪨") : "⭐"; // Changed Sun to Star

    el.textContent = emoji;
    el.className = "surf-item";
    // Add spin to star
    if (!isBad) el.style.animation = "spin 2s linear infinite";

    el.style.cssText = `
                    position: absolute; top: -50px; left: ${Math.random() * 90 + 5}%;
                    font-size: 3em; opacity: 1; transform: translateX(-50%);
                `;

    this.c.appendChild(el);

    this.items.push({
      el: el,
      y: -50,
      type: isBad ? "enemy" : "point",
      active: true,
    });
  }

  loop() {
    if (!this.running) return;

    // Move items
    this.items.forEach((item) => {
      if (!item.active) return;

      item.y += 5; // Speed
      item.el.style.top = item.y + "px";

      // Collision Check
      const dinoRect = this.dinoEl.getBoundingClientRect();
      const itemRect = item.el.getBoundingClientRect();

      // Simple AABB reduced
      const pad = 20;
      if (
        dinoRect.left + pad < itemRect.right - pad &&
        dinoRect.right - pad > itemRect.left + pad &&
        dinoRect.top + pad < itemRect.bottom - pad &&
        dinoRect.bottom - pad > itemRect.top + pad
      ) {
        this.handleCollision(item);
      }

      // Remove OOB
      if (item.y > this.height) {
        item.active = false;
        item.el.remove();
      }
    });

    // Cleanup array
    this.items = this.items.filter((i) => i.active);

    requestAnimationFrame(() => this.loop());
  }

  handleCollision(item) {
    item.active = false;
    item.el.remove();

    if (item.type === "point") {
      window.app.audio.playPop();
      window.app.addScore(10, "surf");
      this.stars++;
      this.updateStarsUI();

      if (this.stars >= this.goal) {
        this.winGame();
      }
    } else {
      window.app.audio.playError();
      this.lives--;
      this.updateLives();

      // Hurt anim
      this.dinoEl.style.opacity = "0.5";
      setTimeout(() => (this.dinoEl.style.opacity = "1"), 500);

      if (this.lives <= 0) this.endGame();
    }
  }

  updateStarsUI() {
    const el = document.getElementById("surfStarCounter");
    if (el) el.textContent = `⭐ ${this.stars}/${this.goal}`;
  }

  winGame() {
    this.running = false;
    window.app.audio.playWin();
    window.app.updateParentStats(20, 1, "surf"); // Bonus stats

    this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 20px; margin-top: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="font-size: 6em;">🏆</div>
                        <h2 style="color: #2ecc71;">¡Campeón de Olas!</h2>
                        <p style="font-size: 1.5em; margin: 10px 0;">Recogiste ${this.stars} estrellas</p>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goBackFromGame()">🏠 Volver al Menú</button>
                    </div>
                `;
  }

  updateLives() {
    document.getElementById("gameLives").textContent = this.lives;
  }

  endGame() {
    this.running = false;
    this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px; margin-top: 50px;">
                        <div style="font-size: 6em;">🌊</div>
                        <h2 style="color: var(--error-color);">¡Al agua!</h2>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goBackFromGame()">🏠 Volver al Menú</button>
                    </div>
                `;
  }

  cleanup() {
    this.running = false;
    window.removeEventListener("mousemove", this.inputHandler);
    window.removeEventListener("touchmove", this.inputHandler);
  }
}
