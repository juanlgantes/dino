export class MovementGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.lives = 3;
    this.running = true;
    this.dino = { x: 50, y: 50, el: null };
    this.items = [];

    // Setup UI
    this.c.style.background =
      "linear-gradient(to bottom, #87CEEB 0%, #90EE90 70%)";
    document.getElementById("livesContainer").style.display = "inline";
    this.updateLivesUI();

    this.init();
  }

  init() {
    this.c.innerHTML = `
            <div id="dinoPlayer" class="dino-player">🦕</div>
            <div id="handTut" class="hand-tutorial">👆</div>
            <div id="goalFlag" style="position:absolute; right:20px; top:50%; font-size:4em; transform:translateY(-50%);">🏁</div>
        `;
    this.dino.el = document.getElementById("dinoPlayer");
    this.width = this.c.offsetWidth;
    this.height = this.c.offsetHeight;

    this.dino.x = 50;
    this.dino.y = this.height / 2;
    this.updatePos();

    this.spawnObjects();
    this.bindEvents();

    this.c.addEventListener("mousedown", () => this.removeTut(), {
      once: true,
    });
    this.c.addEventListener("touchstart", () => this.removeTut(), {
      once: true,
    });
  }

  spawnObjects() {
    for (let i = 0; i < 8; i++) this.spawnItem("⭐", "star");
    for (let i = 0; i < 6; i++) this.spawnItem("🪨", "rock");
    [50, 150, 250].forEach((y) => {
      const el = document.createElement("div");
      el.className = "game-item";
      el.textContent = "☁️";
      el.style.opacity = "0.7";
      el.style.top = y + "px";
      el.style.left = Math.random() * this.width + "px";
      this.c.appendChild(el);
    });
  }

  spawnItem(emoji, type) {
    const el = document.createElement("div");
    el.className = "game-item";
    el.textContent = emoji;
    const x = Math.random() * (this.width - 200) + 100;
    const y = Math.random() * (this.height - 60) + 30;
    el.style.left = x + "px";
    el.style.top = y + "px";
    this.c.appendChild(el);
    this.items.push({ el, x, y, type, active: true });
  }

  removeTut() {
    const t = document.getElementById("handTut");
    if (t) t.remove();
  }

  bindEvents() {
    this.dragHandler = (e) => {
      if (!this.dragging || !this.running) return;
      e.preventDefault();
      const input = e.touches ? e.touches[0] : e;
      const rect = this.c.getBoundingClientRect();

      let x = input.clientX - rect.left;
      let y = input.clientY - rect.top;
      x = Math.max(20, Math.min(this.width - 20, x));
      y = Math.max(20, Math.min(this.height - 20, y));

      this.dino.x = x;
      this.dino.y = y;
      this.updatePos();
      this.checkCollisions();
    };

    this.upHandler = () => {
      this.dragging = false;
      if (this.dino.el) this.dino.el.classList.remove("dragging");
    };

    const startDrag = (e) => {
      if (!this.running) return;
      e.preventDefault();
      this.dragging = true;
      this.dino.el.classList.add("dragging");
    };

    this.dino.el.addEventListener("mousedown", startDrag);
    this.dino.el.addEventListener("touchstart", startDrag);
    window.addEventListener("mousemove", this.dragHandler);
    window.addEventListener("touchmove", this.dragHandler, { passive: false });
    window.addEventListener("mouseup", this.upHandler);
    window.addEventListener("touchend", this.upHandler);
  }

  updatePos() {
    this.dino.el.style.left = this.dino.x + "px";
    this.dino.el.style.top = this.dino.y + "px";
    // Win Condition
    if (this.dino.x > this.width - 80) this.endGame(true);
  }

  updateLivesUI() {
    document.getElementById("gameLives").textContent = this.lives;
  }

  checkCollisions() {
    const HIT_RAD = 35;
    this.items.forEach((item) => {
      if (!item.active) return;
      const dx = Math.abs(this.dino.x - item.x);
      const dy = Math.abs(this.dino.y - item.y);

      if (dx < HIT_RAD && dy < HIT_RAD) {
        if (item.type === "star") this.collectStar(item);
        if (item.type === "rock") this.hitRock(item);
      }
    });
  }

  collectStar(item) {
    item.active = false;
    item.el.style.transition = "all 0.4s";
    item.el.style.transform = "translate(-50%, -100px) scale(2)";
    item.el.style.opacity = "0";
    window.app.audio.playPop();
    window.app.addScore(10, "movement"); // Pass source
  }

  hitRock(item) {
    if (this.cooldown) return;
    this.cooldown = true;
    this.lives--;
    this.updateLivesUI();
    window.app.audio.playError();
    this.dino.el.textContent = "😣";
    setTimeout(() => {
      this.dino.el.textContent = "🦕";
      this.cooldown = false;
    }, 800);
    if (this.lives <= 0) this.endGame(false);
  }

  endGame(won) {
    this.running = false;
    const msg = won ? "¡Llegaste!" : "Inténtalo de nuevo";
    const color = won ? "var(--success-color)" : "var(--error-color)";
    if (won) window.app.audio.playWin();

    this.c.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px; margin-top: 50px;">
                <div style="font-size: 6em;">${won ? "🏁" : "🩹"}</div>
                <h2 style="color: ${color};">${msg}</h2>
                <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                <div style="height:10px"></div>
                <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Volver al Menú</button>
            </div>
        `;
  }

  cleanup() {
    this.running = false;
    window.removeEventListener("mousemove", this.dragHandler);
    window.removeEventListener("touchmove", this.dragHandler);
    window.removeEventListener("mouseup", this.upHandler);
    window.removeEventListener("touchend", this.upHandler);
  }
}
