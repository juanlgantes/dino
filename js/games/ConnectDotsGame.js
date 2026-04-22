export class ConnectDotsGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.level = 0;
    this.currentDot = 1;
    this.maxDots = 10;
    this.dots = [];
    this.lines = [];

    // Normalized Coordinates (0.0 to 1.0)
    this.levels = [
      {
        name: "PEZ 🐟",
        points: [
          { x: 0.2, y: 0.5 },
          { x: 0.4, y: 0.3 },
          { x: 0.6, y: 0.3 },
          { x: 0.8, y: 0.5 },
          { x: 0.9, y: 0.3 },
          { x: 0.9, y: 0.7 },
          { x: 0.8, y: 0.5 },
          { x: 0.6, y: 0.7 },
          { x: 0.4, y: 0.7 },
          { x: 0.2, y: 0.5 },
        ],
      },
      {
        name: "MARIPOSA 🦋",
        points: [
          { x: 0.5, y: 0.5 },
          { x: 0.3, y: 0.2 },
          { x: 0.2, y: 0.5 },
          { x: 0.3, y: 0.8 },
          { x: 0.5, y: 0.6 },
          { x: 0.7, y: 0.8 },
          { x: 0.8, y: 0.5 },
          { x: 0.7, y: 0.2 },
          { x: 0.5, y: 0.4 },
          { x: 0.5, y: 0.2 },
        ],
      },
      {
        name: "ESTRELLA ⭐",
        points: [
          { x: 0.5, y: 0.1 },
          { x: 0.6, y: 0.4 },
          { x: 0.9, y: 0.4 },
          { x: 0.65, y: 0.6 },
          { x: 0.75, y: 0.9 },
          { x: 0.5, y: 0.7 },
          { x: 0.25, y: 0.9 },
          { x: 0.35, y: 0.6 },
          { x: 0.1, y: 0.4 },
          { x: 0.4, y: 0.4 },
          { x: 0.5, y: 0.1 },
        ],
      },
      {
        name: "CORAZÓN ❤️",
        points: [
          { x: 0.5, y: 0.3 },
          { x: 0.7, y: 0.1 },
          { x: 0.9, y: 0.3 },
          { x: 0.9, y: 0.5 },
          { x: 0.5, y: 0.9 },
          { x: 0.1, y: 0.5 },
          { x: 0.1, y: 0.3 },
          { x: 0.3, y: 0.1 },
          { x: 0.5, y: 0.3 },
        ],
      },
      {
        name: "CASA 🏠",
        points: [
          { x: 0.2, y: 0.4 },
          { x: 0.5, y: 0.1 },
          { x: 0.8, y: 0.4 },
          { x: 0.8, y: 0.9 },
          { x: 0.2, y: 0.9 },
          { x: 0.2, y: 0.4 },
        ],
      },
      {
        name: "BARCO ⛵",
        points: [
          { x: 0.2, y: 0.7 },
          { x: 0.8, y: 0.7 },
          { x: 0.7, y: 0.9 },
          { x: 0.3, y: 0.9 },
          { x: 0.2, y: 0.7 },
          { x: 0.5, y: 0.6 },
          { x: 0.5, y: 0.1 },
          { x: 0.2, y: 0.6 },
          { x: 0.8, y: 0.6 },
          { x: 0.5, y: 0.1 },
        ],
      },
      {
        name: "LUNA 🌙",
        points: [
          { x: 0.5, y: 0.1 },
          { x: 0.7, y: 0.2 },
          { x: 0.8, y: 0.5 },
          { x: 0.7, y: 0.8 },
          { x: 0.5, y: 0.9 },
          { x: 0.6, y: 0.7 },
          { x: 0.65, y: 0.5 },
          { x: 0.6, y: 0.3 },
          { x: 0.5, y: 0.1 },
        ],
      },
      {
        name: "SOL ☀️",
        points: [
          { x: 0.5, y: 0.2 },
          { x: 0.65, y: 0.25 },
          { x: 0.8, y: 0.5 },
          { x: 0.65, y: 0.75 },
          { x: 0.5, y: 0.8 },
          { x: 0.35, y: 0.75 },
          { x: 0.2, y: 0.5 },
          { x: 0.35, y: 0.25 },
          { x: 0.5, y: 0.2 },
        ],
      },
      {
        name: "ÁRBOL 🌲",
        points: [
          { x: 0.5, y: 0.1 },
          { x: 0.7, y: 0.4 },
          { x: 0.6, y: 0.4 },
          { x: 0.8, y: 0.7 },
          { x: 0.6, y: 0.7 },
          { x: 0.6, y: 0.9 },
          { x: 0.4, y: 0.9 },
          { x: 0.4, y: 0.7 },
          { x: 0.2, y: 0.7 },
          { x: 0.4, y: 0.4 },
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.1 },
        ],
      },
      {
        name: "COCHE 🚗",
        points: [
          { x: 0.2, y: 0.7 },
          { x: 0.1, y: 0.5 },
          { x: 0.2, y: 0.5 },
          { x: 0.3, y: 0.3 },
          { x: 0.6, y: 0.3 },
          { x: 0.7, y: 0.5 },
          { x: 0.9, y: 0.5 },
          { x: 0.9, y: 0.7 },
          { x: 0.2, y: 0.7 },
          { x: 0.3, y: 0.8 },
          { x: 0.4, y: 0.7 },
          { x: 0.7, y: 0.7 },
          { x: 0.8, y: 0.8 },
          { x: 0.9, y: 0.7 },
        ],
      },
      {
        name: "RATÓN 🐭",
        points: [
          { x: 0.2, y: 0.6 },
          { x: 0.25, y: 0.5 },
          { x: 0.35, y: 0.4 },
          { x: 0.3, y: 0.25 },
          { x: 0.4, y: 0.3 },
          { x: 0.5, y: 0.25 },
          { x: 0.55, y: 0.4 },
          { x: 0.65, y: 0.45 },
          { x: 0.8, y: 0.45 },
          { x: 0.9, y: 0.55 },
          { x: 0.95, y: 0.45 },
          { x: 0.95, y: 0.65 },
          { x: 0.9, y: 0.65 },
          { x: 0.85, y: 0.75 },
          { x: 0.75, y: 0.75 },
          { x: 0.6, y: 0.7 },
          { x: 0.5, y: 0.75 },
          { x: 0.4, y: 0.7 },
          { x: 0.3, y: 0.65 },
          { x: 0.25, y: 0.6 },
        ],
      },
    ];

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#f0f8ff";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    // Nav Header
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "20px";
    header.style.marginBottom = "10px";

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "⬅️";
    btnPrev.style.fontSize = "1.5em";
    btnPrev.style.background = "none";
    btnPrev.style.border = "none";
    btnPrev.style.cursor = "pointer";
    btnPrev.onclick = () => this.prevLevel();

    const title = document.createElement("h2");
    title.id = "dotsTitle";
    title.style.color = "#2980b9";
    title.style.margin = "0";
    title.textContent = `Nivel ${this.level + 1}`;

    const btnNext = document.createElement("button");
    btnNext.textContent = "➡️";
    btnNext.style.fontSize = "1.5em";
    btnNext.style.background = "none";
    btnNext.style.border = "none";
    btnNext.style.cursor = "pointer";
    btnNext.onclick = () => this.nextLevel();

    header.appendChild(btnPrev);
    header.appendChild(title);
    header.appendChild(btnNext);
    this.c.appendChild(header);

    const canvasContainer = document.createElement("div");
    canvasContainer.style.position = "relative";
    canvasContainer.style.margin = "20px";
    this.c.appendChild(canvasContainer);

    this.canvas = document.createElement("canvas");
    this.canvas.style.background = "white";
    this.canvas.style.borderRadius = "20px";
    this.canvas.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
    const size = Math.min(this.c.clientWidth - 40, 400);
    this.canvas.width = size;
    this.canvas.height = size;
    canvasContainer.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "20px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);

    this.handleInput = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      let cx, cy;
      if (e.touches) {
        cx = e.touches[0].clientX - rect.left;
        cy = e.touches[0].clientY - rect.top;
      } else {
        cx = e.clientX - rect.left;
        cy = e.clientY - rect.top;
      }
      this.checkClick(cx, cy);
    };
    this.canvas.addEventListener("mousedown", this.handleInput);
    this.canvas.addEventListener("touchstart", this.handleInput, {
      passive: false,
    });

    this.loadLevel(this.level);
  }

  loadLevel(idx) {
    if (idx >= this.levels.length) {
      this.winGame();
      return;
    }
    this.level = idx;
    this.dots = this.levels[idx].points.map((p) => ({
      x: p.x * this.canvas.width,
      y: p.y * this.canvas.height,
    }));
    this.maxDots = this.dots.length;
    this.currentDot = 1;
    this.documentTitle = document.getElementById("dotsTitle");
    if (this.documentTitle)
      this.documentTitle.textContent = `Nivel ${this.level + 1}: ${this.currentDot} ➡️ ${this.currentDot + 1}`;
    this.lines = [];
    this.draw();
  }

  prevLevel() {
    if (this.level > 0) this.loadLevel(this.level - 1);
  }

  nextLevel() {
    if (this.level < this.levels.length - 1) this.loadLevel(this.level + 1);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.beginPath();
    this.ctx.strokeStyle = "#3498db";
    this.ctx.lineWidth = 5;
    this.lines.forEach((p, i) => {
      if (i === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    });
    if (this.lines.length > 0) {
      const last = this.lines[this.lines.length - 1];
      this.ctx.lineTo(last.x, last.y);
    }
    this.ctx.stroke();

    this.dots.forEach((p, i) => {
      const num = i + 1;
      const isDone = num < this.currentDot;
      const isNext = num === this.currentDot;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      this.ctx.fillStyle = isDone ? "#2ecc71" : isNext ? "#e74c3c" : "#bdc3c7";
      this.ctx.fill();

      this.ctx.fillStyle = "white";
      this.ctx.font = "bold 20px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(num, p.x, p.y);

      if (isNext) {
        this.ctx.strokeStyle = "#e74c3c";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
  }

  checkClick(x, y) {
    if (this.currentDot > this.maxDots) return;

    const target = this.dots[this.currentDot - 1];
    const dx = x - target.x;
    const dy = y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      window.app.audio.playPop();
      this.lines.push(target);
      this.currentDot++;

      if (this.currentDot > this.maxDots) {
        this.finishLevel();
      } else {
        this.documentTitle.textContent = `Nivel ${this.level + 1}: ${this.currentDot} ➡️ ${this.currentDot + 1}`;
        this.draw();
      }
    }
  }

  finishLevel() {
    this.draw();
    if (this.level === 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.dots[9].x, this.dots[9].y);
      this.ctx.lineTo(this.dots[0].x, this.dots[0].y);
      this.ctx.stroke();
    }

    this.documentTitle.textContent = `¡${this.levels[this.level].name}!`;
    window.app.audio.playWin();

    setTimeout(() => {
      this.loadLevel(this.level + 1);
    }, 2000);
  }

  winGame() {
    this.c.innerHTML = "";
    const winDiv = document.createElement("div");
    winDiv.style.textAlign = "center";

    winDiv.innerHTML = `
                    <div style="font-size: 6em;">✏️</div>
                    <h1 style="color:#2c3e50">¡Artista!</h1>
                    <p style="font-size:1.5em; color:#7f8c8d">Has completado todos los dibujos.</p>
                    <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                    <div style="height:10px"></div>
                    <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Volver</button>
                `;
    this.c.appendChild(winDiv);

    window.app.audio.playWin();
    window.app.updateParentStats(50, 1, "connect_dots");
  }

  cleanup() {
    if (this.canvas && this.handleInput) {
      this.canvas.removeEventListener("mousedown", this.handleInput);
      this.canvas.removeEventListener("touchstart", this.handleInput);
    }
  }
}
