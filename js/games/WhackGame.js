export class WhackGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.score = 0;
    this.lives = 3;
    this.running = false;
    this.holes = [];
    this.activeMole = null; // { index, type, timeout }

    this.types = [
      { id: "bad", icon: "🦖", score: 10 }, // Target
      { id: "good", icon: "🦕", score: -5 }, // Avoid
      { id: "spike", icon: "🌵", score: -5 }, // Avoid
    ];

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#81ecec";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    const h = document.createElement("h2");
    h.textContent = "🔨 Topo Dino";
    h.style.color = "#2d3436";
    h.style.fontSize = "3em";
    h.style.marginBottom = "20px";
    this.c.appendChild(h);

    const btn = document.createElement("button");
    btn.className = "mode-btn kid";
    btn.style.background = "#00cec9";
    btn.textContent = "▶️ Jugar";
    btn.onclick = () => this.startGame();
    this.c.appendChild(btn);

    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "20px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);
  }

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.running = true;
    this.renderBoard();
    this.gameLoop();
    window.app.addScore(0); // Reset UI display
    document.getElementById("livesContainer").style.display = "inline";
    document.getElementById("gameLives").textContent = this.lives;
  }

  renderBoard() {
    this.c.innerHTML = "";

    // Grid 3x3
    const grid = document.createElement("div");
    grid.style.cssText = `
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;
                    width: 90vmin; max-width: 500px; aspect-ratio: 1/1;
                    margin-top: 20px;
                `;

    this.holes = [];
    for (let i = 0; i < 9; i++) {
      const hole = document.createElement("div");
      hole.style.cssText = `
                        background: #b2bec3; border-radius: 50%;
                        position: relative; overflow: hidden;
                        border: 5px solid #636e72;
                        box-shadow: inset 0 10px 20px rgba(0,0,0,0.3);
                        cursor: pointer; -webkit-tap-highlight-color: transparent;
                    `;

      const content = document.createElement("div");
      content.style.cssText = `
                        position: absolute; top: 100%; left: 0; width: 100%; height: 100%;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 4em; transition: top 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    `;

      hole.onclick = () => this.whack(i);
      hole.appendChild(content);
      grid.appendChild(hole);
      this.holes.push({
        el: hole,
        content: content,
        type: null,
        active: false,
      });
    }
    this.c.appendChild(grid);
  }

  gameLoop() {
    if (!this.running) return;

    // Random Interval
    const delay = Math.random() * 1000 + 500; // 0.5 - 1.5s

    this.loopTimeout = setTimeout(() => {
      if (!this.running) return;
      this.popUp();
      this.gameLoop();
    }, delay);
  }

  popUp() {
    // Find inactive holes
    const inactive = this.holes.filter((h) => !h.active);
    if (inactive.length === 0) return;

    const hole = inactive[Math.floor(Math.random() * inactive.length)];

    // Pick Type (70% Bad, 30% Good/Spike)
    const rand = Math.random();
    let type;
    if (rand < 0.7)
      type = this.types[0]; // Bad (Target)
    else if (rand < 0.85)
      type = this.types[1]; // Good
    else type = this.types[2]; // Spike

    hole.type = type;
    hole.active = true;
    hole.content.textContent = type.icon;
    hole.content.style.top = "0%"; // Pop Up

    // Hide after random time
    const duration = Math.random() * 800 + 600; // 0.6 - 1.4s stay
    hole.timeout = setTimeout(() => {
      this.hide(hole);
    }, duration);
  }

  hide(hole) {
    hole.active = false;
    hole.content.style.top = "100%"; // Hide
    hole.timeout = null;
  }

  whack(index) {
    const hole = this.holes[index];
    if (!hole.active) return;

    clearTimeout(hole.timeout);
    this.hide(hole);

    if (hole.type.id === "bad") {
      // Hit Target
      window.app.audio.playPop();
      window.app.addScore(10, "whack");
      this.showFloat(hole.el, "+10", "#00b894");
    } else {
      // Hit Friend or Spike
      window.app.audio.playError();
      this.lives--;
      document.getElementById("gameLives").textContent = this.lives;
      this.showFloat(hole.el, "💔", "#d63031");

      if (this.lives <= 0) {
        this.endGame();
      }
    }
  }

  showFloat(el, text, color) {
    const f = document.createElement("div");
    f.textContent = text;
    f.style.cssText = `
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    color: ${color}; font-size: 3em; font-weight: bold; pointer-events: none;
                    text-shadow: 2px 2px 0 white; animation: fadeUp 0.5s forwards;
                `;
    el.appendChild(f);
    setTimeout(() => f.remove(), 500);
  }

  endGame() {
    this.running = false;
    clearTimeout(this.loopTimeout);
    this.holes.forEach((h) => clearTimeout(h.timeout));

    window.app.audio.playWin();
    window.app.updateParentStats(this.score, 1, "whack");

    this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px;">
                        <div style="font-size: 6em;">🔨</div>
                        <h2 style="color: #2d3436;">¡Juego Terminado!</h2>
                        <button class="mode-btn kid" style="margin-top:20px; background:#00cec9;" onclick="window.app.gameInstance.startGame()">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                    </div>
                `;
  }

  cleanup() {
    this.running = false;
    clearTimeout(this.loopTimeout);
    if (this.holes) this.holes.forEach((h) => clearTimeout(h.timeout));
  }
}
