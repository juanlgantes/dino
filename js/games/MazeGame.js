export class MazeGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.level = 0;
    this.grid = [];
    // Player is pixel-based now. Center point.
    this.p = { x: 0, y: 0 };
    this.tileSize = 40;
    this.speed = 3; // px per frame
    this.running = false;
    this.dragTarget = null; // {x, y} or null

    this.levels = [
      // Level 1: Easy
      [
        "#######",
        "#S....#",
        "###.###",
        "#.....#",
        "#.###.#",
        "#...E.#",
        "#######",
      ],
      // Level 2: Medium
      [
        "#########",
        "#S#.....#",
        "#.#.###.#",
        "#...#...#",
        "#####.###",
        "#...#...#",
        "#.###.E.#",
        "#.......#",
        "#########",
      ],
      // Level 3: Hard
      [
        "###########",
        "#S........#",
        "#.#######.#",
        "#.#.....#.#",
        "#.#.###.#.#",
        "#.#.#E....#",
        "#.#.###.#.#",
        "#.#.....#.#",
        "#.#######.#",
        "#.........#",
        "###########",
      ],
      // Level 4: Expert
      [
        "#############",
        "#S..........#",
        "#.#########.#",
        "#.#.......#.#",
        "#.#.#####.#.#",
        "#.#.#...#.#.#",
        "#.#.#.#.#.#.#",
        "#.#...#...#.#",
        "#.#####.#####",
        "#...........E",
        "#############",
      ],
      // Level 5: Master
      [
        "###############",
        "#S......#.....#",
        "###.###.#.###.#",
        "#...#...#...#.#",
        "#.###.#####.#.#",
        "#.#...#.....#.#",
        "#.#.###.###.###",
        "#.#.....#.....#",
        "#.###########.#",
        "#......E......#",
        "###############",
      ],
    ];

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#2c3e50";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "flex-start";
    this.c.style.overflow = "hidden";

    // Title & Nav
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "20px";
    header.style.margin = "10px 0";

    const btnPrev = document.createElement("button");
    btnPrev.textContent = "⬅️";
    btnPrev.style.fontSize = "1.5em";
    btnPrev.style.background = "none";
    btnPrev.style.border = "none";
    btnPrev.style.cursor = "pointer";
    if (this.level > 0) {
      btnPrev.onclick = () => this.prevLevel();
    } else {
      btnPrev.style.opacity = "0.3";
    }

    const title = document.createElement("h2");
    title.id = "mazeTitle";
    title.style.color = "#ecf0f1";
    title.style.margin = "0";
    title.textContent = `Nivel ${this.level + 1}`;

    const btnNext = document.createElement("button");
    btnNext.textContent = "➡️";
    btnNext.style.fontSize = "1.5em";
    btnNext.style.background = "none";
    btnNext.style.border = "none";
    btnNext.style.cursor = "pointer";
    if (this.level < this.levels.length - 1) {
      btnNext.onclick = () => this.nextLevel();
    } else {
      btnNext.style.opacity = "0.3";
    }

    header.appendChild(btnPrev);
    header.appendChild(title);
    header.appendChild(btnNext);
    this.c.appendChild(header);

    // Instruction
    const inst = document.createElement("p");
    inst.textContent = "👆 Arrastra a Dino para moverlo";
    inst.style.color = "#bdc3c7";
    inst.style.margin = "0 0 10px 0";
    this.c.appendChild(inst);

    // Canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.background = "#95a5a6";
    this.canvas.style.borderRadius = "10px";
    this.canvas.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
    this.canvas.style.touchAction = "none"; // Prevents scrolling
    this.c.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Bind Input
    this.bindInput();

    // Start Level
    this.loadLevel(this.level);

    // Loop
    this.running = true;
    this.loop();

    // Responsive
    this.ro = new ResizeObserver(() => this.resizeCanvas());
    this.ro.observe(this.c);

    // Exit
    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "10px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);
  }

  bindInput() {
    this.handlers = {
      start: (e) => {
        e.preventDefault();
        this.updateDragTarget(e);
      },
      move: (e) => {
        // Only prevent default if we are actively dragging the dino
        if (this.dragTarget) {
          if (e.cancelable) e.preventDefault();
          this.updateDragTarget(e);
        }
      },
      end: (e) => {
        // Only prevent default if we were dragging
        if (this.dragTarget) {
          if (e.cancelable) e.preventDefault();
          this.dragTarget = null;
        }
      },
    };

    this.canvas.addEventListener("mousedown", this.handlers.start);
    window.addEventListener("mousemove", this.handlers.move);
    window.addEventListener("mouseup", this.handlers.end);

    this.canvas.addEventListener("touchstart", this.handlers.start, {
      passive: false,
    });
    window.addEventListener("touchmove", this.handlers.move, {
      passive: false,
    });
    window.addEventListener("touchend", this.handlers.end);
  }

  updateDragTarget(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    this.dragTarget = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  loadLevel(idx) {
    if (idx >= this.levels.length) {
      this.winGame();
      return;
    }
    this.level = idx;
    const t = document.getElementById("mazeTitle");
    if (t) t.textContent = `Nivel ${this.level + 1}`;

    const map = this.levels[idx];
    this.grid = map.map((row) => row.split(""));

    this.resizeCanvas(); // Recalc grid size

    // Find Start Pixel
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] === "S") {
          this.p = {
            x: x * this.tileSize + this.tileSize / 2,
            y: y * this.tileSize + this.tileSize / 2,
          };
        }
      }
    }
  }

  resizeCanvas() {
    if (!this.grid || this.grid.length === 0) return;

    // Capture current relative pos
    let relX = 0.5,
      relY = 0.5;
    if (this.tileSize > 0 && this.p.x > 0) {
      relX = this.p.x / (this.grid[0].length * this.tileSize);
      relY = this.p.y / (this.grid.length * this.tileSize);
    }

    const rows = this.grid.length;
    const cols = this.grid[0].length;

    const rect = this.c.getBoundingClientRect();
    const availW = rect.width - 20;
    const availH = rect.height - 150;

    const tileW = Math.floor(availW / cols);
    const tileH = Math.floor(availH / rows);

    this.tileSize = Math.min(60, tileW, tileH);
    this.tileSize = Math.max(20, this.tileSize);

    this.canvas.width = cols * this.tileSize;
    this.canvas.height = rows * this.tileSize;

    // Restore pos scaled
    if (this.running && relX > 0) {
      this.p.x = relX * this.canvas.width;
      this.p.y = relY * this.canvas.height;
    }
  }

  loop() {
    if (!this.running) return;
    // Safety: Stop if canvas is gone
    if (!this.canvas.isConnected) {
      this.running = false;
      return;
    }

    if (this.dragTarget) {
      // Vector to target
      const dx = this.dragTarget.x - this.p.x;
      const dy = this.dragTarget.y - this.p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        // Deadzone
        // Normalize
        const speed = Math.min(dist, this.speed); // Slow down near finger
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        // Move X
        if (!this.checkWall(this.p.x + vx, this.p.y)) {
          this.p.x += vx;
        }
        // Move Y
        if (!this.checkWall(this.p.x, this.p.y + vy)) {
          this.p.y += vy;
        }

        // Check Events
        this.checkEvents();
      }
    }

    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  checkWall(x, y) {
    // Check bounding box (Player is size * 0.6)
    const rad = this.tileSize * 0.3;
    const testPoints = [
      { x: x - rad, y: y - rad },
      { x: x + rad, y: y - rad },
      { x: x - rad, y: y + rad },
      { x: x + rad, y: y + rad },
    ];

    for (let pt of testPoints) {
      const gx = Math.floor(pt.x / this.tileSize);
      const gy = Math.floor(pt.y / this.tileSize);

      // Out of bounds
      if (
        gy < 0 ||
        gy >= this.grid.length ||
        gx < 0 ||
        gx >= this.grid[0].length
      )
        return true;
      // Wall
      if (this.grid[gy][gx] === "#") return true;
    }
    return false;
  }

  checkEvents() {
    const gx = Math.floor(this.p.x / this.tileSize);
    const gy = Math.floor(this.p.y / this.tileSize);

    if (
      gy >= 0 &&
      gy < this.grid.length &&
      gx >= 0 &&
      gx < this.grid[0].length
    ) {
      if (this.grid[gy][gx] === "E") {
        window.app.audio.playPop();
        this.dragTarget = null; // Stop moving
        this.loadLevel(this.level + 1);
      }
    }
  }

  prevLevel() {
    if (this.level > 0) {
      this.level--;
      this.init();
    }
  }

  nextLevel() {
    if (this.level < this.levels.length - 1) {
      this.level++;
      this.init();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        if (cell === "#") {
          this.ctx.fillStyle = "#34495e";
          this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          this.ctx.fillStyle = "#2c3e50";
          this.ctx.fillRect(
            px + 4,
            py + 4,
            this.tileSize - 8,
            this.tileSize - 8,
          );
        } else if (cell === "E") {
          this.ctx.font = `${this.tileSize * 0.7}px Arial`;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            "🥚",
            px + this.tileSize / 2,
            py + this.tileSize / 2,
          );
        }
      }
    }

    // Draw Player
    this.ctx.font = `${this.tileSize * 0.7}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("🦖", this.p.x, this.p.y);
  }

  cleanup() {
    this.running = false;
    if (this.ro) this.ro.disconnect();

    if (this.handlers) {
      window.removeEventListener("mousemove", this.handlers.move);
      window.removeEventListener("mouseup", this.handlers.end);
      window.removeEventListener("touchmove", this.handlers.move);
      window.removeEventListener("touchend", this.handlers.end);
      this.handlers = null;
    }
  }

  winGame() {
    this.cleanup(); // Stop Loop & Remove Listeners
    this.c.innerHTML = "";
    const winDiv = document.createElement("div");
    winDiv.style.textAlign = "center";
    winDiv.style.color = "white";

    winDiv.innerHTML = `
                    <div style="font-size: 6em;">🏆</div>
                    <h1>¡Laberinto Completado!</h1>
                    <p>Has encontrado todos los huevos.</p>
                    <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                    <div style="height:10px"></div>
                    <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Volver</button>
                `;
    this.c.appendChild(winDiv);

    window.app.audio.playWin();
    window.app.updateParentStats(50, 1, "maze");
  }
}
