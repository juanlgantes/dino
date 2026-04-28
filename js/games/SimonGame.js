export class SimonGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.sequence = [];
    this.playerStep = 0;
    this.isPlaying = false;

    this.colors = [
      { id: "red", color: "#e74c3c", note: 261.63, icon: "🦖" },
      { id: "green", color: "#2ecc71", note: 329.63, icon: "🐊" },
      { id: "blue", color: "#3498db", note: 392.0, icon: "🦕" },
      { id: "yellow", color: "#f1c40f", note: 523.25, icon: "🐣" },
    ];

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#2c3e50";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    const h = document.createElement("h2");
    h.textContent = "🔊 Dino Dice";
    h.style.color = "white";
    h.style.fontSize = "3em";
    h.style.marginBottom = "20px";
    this.c.appendChild(h);

    const btn = document.createElement("button");
    btn.className = "mode-btn kid";
    btn.style.background = "#2ecc71";
    btn.textContent = "▶️ Jugar";
    btn.onclick = () => this.startGame();
    this.c.appendChild(btn);

    // Exit
    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "20px";
    exit.onclick = () => window.app.nav.goDashboard();
    this.c.appendChild(exit);
  }

  startGame() {
    this.sequence = [];
    this.renderBoard();
    this.nextLevel();
  }

  renderBoard() {
    this.c.innerHTML = "";
    this.c.style.justifyContent = "flex-start";
    this.c.style.paddingTop = "20px";

    // Status Text
    this.statusEl = document.createElement("h2");
    this.statusEl.textContent = "¡Atento!";
    this.statusEl.style.color = "white";
    this.statusEl.style.marginBottom = "20px";
    this.c.appendChild(this.statusEl);

    // Grid 2x2
    const grid = document.createElement("div");
    grid.style.cssText = `
                    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
                    width: 90vmin; max-width: 500px; aspect-ratio: 1/1;
                `;

    this.btnEls = {};

    this.colors.forEach((c) => {
      const btn = document.createElement("div");
      btn.style.cssText = `
                        background: ${c.color}; border-radius: 20px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 4em; cursor: pointer; transition: transform 0.1s, opacity 0.1s;
                        opacity: 0.8; box-shadow: 0 5px 0 rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent;
                    `;
      btn.textContent = c.icon;

      // Touch/Click
      const activate = (e) => {
        e.preventDefault();
        if (this.isPlaying) return;
        this.activateBtn(c);
        this.handleInput(c.id);
      };
      btn.addEventListener("mousedown", activate);
      btn.addEventListener("touchstart", activate);

      this.btnEls[c.id] = btn;
      grid.appendChild(btn);
    });

    this.c.appendChild(grid);

    // Controls (Exit)
    const controls = document.createElement("div");
    controls.style.marginTop = "20px";
    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.padding = "10px 20px";
    exit.style.fontSize = "1em";
    exit.onclick = () => window.app.nav.goDashboard();
    controls.appendChild(exit);
    this.c.appendChild(controls);
  }

  nextLevel() {
    this.playerStep = 0;
    this.isPlaying = true;
    this.statusEl.textContent = `Nivel ${this.sequence.length + 1}`;

    // Add random color
    const randomColor =
      this.colors[Math.floor(Math.random() * this.colors.length)];
    this.sequence.push(randomColor);

    // Play Sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i >= this.sequence.length) {
        clearInterval(interval);
        this.isPlaying = false;
        this.statusEl.textContent = "¡Tu Turno!";
        return;
      }
      this.activateBtn(this.sequence[i]);
      i++;
    }, 1000); // 1 sec delay between steps
  }

  activateBtn(colorObj) {
    const el = this.btnEls[colorObj.id];

    // Visual
    el.style.opacity = "1";
    el.style.transform = "scale(0.95)";
    el.style.filter = "brightness(1.5)";

    // Audio
    window.app.audio.playTone(colorObj.note, "sine", 0.5);

    setTimeout(() => {
      el.style.opacity = "0.8";
      el.style.transform = "scale(1)";
      el.style.filter = "brightness(1)";
    }, 400);
  }

  handleInput(colorId) {
    const expected = this.sequence[this.playerStep].id;

    if (colorId === expected) {
      this.playerStep++;
      if (this.playerStep >= this.sequence.length) {
        this.isPlaying = true; // Block input
        this.statusEl.textContent = "¡Bien hecho! 👍";
        window.app.audio.playPop();
        setTimeout(() => this.nextLevel(), 1500);
      }
    } else {
      this.gameOver();
    }
  }

  gameOver() {
    this.isPlaying = true;
    window.app.audio.playError();
    this.statusEl.textContent = "¡Oh no! 💥";

    setTimeout(() => {
      this.c.innerHTML = `
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 5em;">📢</div>
                            <h1>¡Juego Terminado!</h1>
                            <p style="font-size: 1.5em;">Llegaste al Nivel ${this.sequence.length}</p>
                            <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.gameInstance.startGame()">🔄 Reintentar</button>
                            <br>
                            <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Salir</button>
                        </div>
                    `;
      window.app.updateParentStats(this.sequence.length, 1, "simon");
    }, 1000);
  }

  cleanup() {}
}
