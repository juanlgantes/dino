export class ConnectFourGame {
  constructor(data, container, savedState) {
    this.data = data;
    this.c = container;
    this.savedState = savedState;
    this.cols = 7;
    this.rows = 6;
    this.board = []; // 0=Empty, 1=Player, 2=Dino/P2
    this.turn = 1; // 1=Player, 2=Dino/P2
    this.gameOver = false;
    this.animating = false;
    this.gameMode = "pve"; // pve, pvp
    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#2c3e50";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";
    this.c.style.position = "relative";

    // Mode Selector
    const title = document.createElement("h2");
    title.textContent = "🔴 4 en Raya 🟡";
    title.style.color = "white";
    title.style.marginBottom = "30px";
    title.style.fontSize = "3em";
    this.c.appendChild(title);

    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "20px";

    const btnPVE = document.createElement("button");
    btnPVE.className = "mode-btn kid";
    btnPVE.style.background = "#e74c3c";
    btnPVE.innerHTML =
      '🤖 1 Jugador<br><span style="font-size:0.6em">vs Dino</span>';
    btnPVE.onclick = () => this.startGame("pve");

    const btnPVP = document.createElement("button");
    btnPVP.className = "mode-btn kid";
    btnPVP.style.background = "#f1c40f";
    btnPVP.innerHTML =
      '👥 2 Jugadores<br><span style="font-size:0.6em">Amigos</span>';
    btnPVP.onclick = () => this.startGame("pvp");

    btnContainer.appendChild(btnPVE);
    btnContainer.appendChild(btnPVP);

    if (this.savedState) {
      const btnResume = document.createElement("button");
      btnResume.className = "mode-btn kid";
      btnResume.style.background = "#2ecc71";
      btnResume.innerHTML = "📂 Continuar";
      btnResume.onclick = () => this.resumeGame();
      btnContainer.appendChild(btnResume);
    }

    this.c.appendChild(btnContainer);

    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "40px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);
  }

  resumeGame() {
    if (this.savedState) {
      this.gameMode = this.savedState.gameMode || "pve";
      this.board = this.savedState.board;
      this.turn = this.savedState.turn;
      this.startGame(this.gameMode, true);
    }
  }

  save() {
    const state = {
      gameMode: this.gameMode,
      board: this.board,
      turn: this.turn,
    };
    window.app.saveGame("connect_four", state);
  }

  startGame(mode, isRestore = false) {
    this.gameMode = mode;
    this.c.innerHTML = "";

    // Title
    const title = document.createElement("h2");
    title.textContent = "🔴 vs 🟡";
    title.style.color = "white";
    title.style.marginBottom = "10px";
    this.c.appendChild(title);

    // Controls
    const controls = document.createElement("div");
    controls.style.marginBottom = "10px";
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "💾 Guardar";
    saveBtn.className = "mode-btn kid";
    saveBtn.style.padding = "5px 15px";
    saveBtn.style.fontSize = "1em";
    saveBtn.style.background = "#3498db";
    saveBtn.onclick = () => this.save();
    controls.appendChild(saveBtn);
    this.c.appendChild(controls);

    // Game Board Container
    const boardEl = document.createElement("div");
    boardEl.className = "c4-board";
    boardEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1vmin;
                    padding: 1vmin;
                    background: #3498db;
                    border-radius: 10px;
                    width: 90vmin;
                    max-width: 600px;
                    aspect-ratio: 7/6;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                `;
    this.c.appendChild(boardEl);

    this.slots = [];
    // Init Logic Board
    if (!isRestore) {
      this.board = Array(this.rows)
        .fill(null)
        .map(() => Array(this.cols).fill(0));
    }

    // Create Slots
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const slot = document.createElement("div");
        slot.className = "c4-slot";
        slot.style.cssText = `
                            background: #2c3e50;
                            border-radius: 50%;
                            width: 100%; height: 100%;
                            cursor: pointer;
                            position: relative;
                        `;
        slot.dataset.col = c;
        slot.dataset.row = r;
        slot.onclick = () => this.handleSlotClick(c);

        // Inner circle for piece
        const piece = document.createElement("div");
        piece.className = "c4-piece";
        piece.style.cssText = `
                            width: 100%; height: 100%; border-radius: 50%;
                            transform: scale(0); transition: transform 0.3s cubic-bezier(1.000, 0.005, 0.295, 1.225);
                        `;

        // Restore Visuals
        if (isRestore && this.board[r][c] !== 0) {
          piece.style.transform = "scale(1)";
          piece.style.background =
            this.board[r][c] === 1 ? "#e74c3c" : "#f1c40f";
        }

        slot.appendChild(piece);
        this.slots.push({ el: slot, piece: piece, row: r, col: c });
        boardEl.appendChild(slot);
      }
    }

    // Exit Button
    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "20px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);

    // Status Message
    this.statusEl = document.createElement("div");
    this.statusEl.style.cssText =
      "color: white; font-size: 1.5em; margin-top: 10px; height: 30px;";
    this.statusEl.textContent =
      this.turn === 1 ? "Tu turno 🔴" : "Turno Amarillo 🟡";
    this.c.appendChild(this.statusEl);
  }

  handleSlotClick(col) {
    if (this.gameOver || this.animating) return;

    // PvE: Turn 1 is Player, Turn 2 is AI
    if (this.gameMode === "pve" && this.turn === 2) return;

    this.makeMove(col);
  }

  makeMove(col) {
    const currentPlayer = this.turn;

    if (this.dropPiece(col, currentPlayer)) {
      window.app.audio.playPop();

      // Check Win/Draw
      if (this.checkWin(currentPlayer)) return;
      if (this.checkDraw()) return;

      // Switch Turn
      this.turn = this.turn === 1 ? 2 : 1;

      if (this.gameMode === "pve") {
        if (this.turn === 2) {
          this.statusEl.textContent = "Dino piensa... 🤔";
          this.animating = true;
          setTimeout(() => this.dinoMove(), 800);
        } else {
          this.statusEl.textContent = "Tu turno 🔴";
        }
      } else {
        // PvP
        this.statusEl.textContent =
          this.turn === 1 ? "Turno Rojo 🔴" : "Turno Amarillo 🟡";
      }
    } else {
      window.app.audio.playError();
    }
  }

  // Kept for backward compatibility if called directly, but now routed via handleSlotClick
  playerMove(col) {
    this.handleSlotClick(col);
  }

  dinoMove() {
    if (this.gameOver) return;

    // Simple AI:
    // 1. Check if can win directly
    // 2. Check if must block player win
    // 3. Random valid move

    let bestCol = -1;

    // Helper to simulate drop
    const canWin = (player) => {
      for (let c = 0; c < this.cols; c++) {
        // Find row
        let r = -1;
        for (let i = this.rows - 1; i >= 0; i--) {
          if (this.board[i][c] === 0) {
            r = i;
            break;
          }
        }
        if (r !== -1) {
          this.board[r][c] = player;
          const win = this.checkWinLogic(player, false); // false = no visual update
          this.board[r][c] = 0; // Undo
          if (win) return c;
        }
      }
      return -1;
    };

    // 1. Try Win
    bestCol = canWin(2);

    // 2. Block Player
    if (bestCol === -1) bestCol = canWin(1);

    // 3. Random
    if (bestCol === -1) {
      const validCols = [];
      for (let c = 0; c < this.cols; c++) {
        if (this.board[0][c] === 0) validCols.push(c);
      }
      if (validCols.length > 0) {
        bestCol = validCols[Math.floor(Math.random() * validCols.length)];
      }
    }

    if (bestCol !== -1) {
      this.animating = false;
      this.dropPiece(bestCol, 2);

      if (!this.checkWin(2) && !this.checkDraw()) {
        this.turn = 1;
        this.statusEl.textContent = "Tu turno 🔴";
      }
    }
  }

  dropPiece(col, player) {
    // Find lowest empty row in col
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        this.board[r][col] = player;

        // Visual Update
        const slotObj = this.slots.find((s) => s.row === r && s.col === col);
        if (slotObj) {
          slotObj.piece.style.background = player === 1 ? "#e74c3c" : "#f1c40f"; // Red vs Yellow
          slotObj.piece.style.transform = "scale(1)";

          // Animate "falling" (Optional simple version)
        }
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    // If top row is full
    if (this.board[0].every((cell) => cell !== 0)) {
      this.gameOver = true;
      this.statusEl.textContent = "¡Empate! 🤝";
      return true;
    }
    return false;
  }

  checkWin(player) {
    if (this.checkWinLogic(player, true)) {
      this.gameOver = true;

      let msg = "";
      if (this.gameMode === "pve") {
        msg = player === 1 ? "¡GANASTE! 🎉" : "¡Dino Gana! 🦖";
      } else {
        msg = player === 1 ? "¡Rojo Gana! 🔴" : "¡Amarillo Gana! 🟡";
      }
      this.statusEl.textContent = msg;

      if (player === 1 || (this.gameMode === "pvp" && player === 2)) {
        window.app.audio.playWin();
        if (player === 1 && this.gameMode === "pve") window.app.addScore(20);
      } else {
        window.app.audio.playError();
      }

      setTimeout(() => {
        const ov = document.createElement("div");
        ov.style.cssText =
          "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:10px;";

        let icon = "🏆";
        if (msg.includes("Dino")) icon = "🦕";
        if (msg.includes("Amarillo")) icon = "🟡";
        if (msg.includes("Rojo")) icon = "🔴";

        ov.innerHTML = `
                            <div style="font-size:5em;">${icon}</div>
                            <h2 style="color:white; margin:20px;">${msg}</h2>
                            <div style="display:flex; gap:20px; flex-direction:column;">
                                <button class="mode-btn kid" style="background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                                <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                            </div>
                        `;
        this.c.appendChild(ov);
      }, 1500);
      return true;
    }
    return false;
  }

  checkWinLogic(player, visualEffects) {
    // Horizontal, Vertical, Diagonal
    // Iterate all cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c] !== player) continue;

        // Check 4 directions: Right, Down, Diag-Right, Diag-Left
        const directions = [
          { dr: 0, dc: 1 }, // Right
          { dr: 1, dc: 0 }, // Down
          { dr: 1, dc: 1 }, // Down-Right
          { dr: 1, dc: -1 }, // Down-Left
        ];

        for (let d of directions) {
          let count = 0;
          let winningCells = [];
          for (let i = 0; i < 4; i++) {
            const nr = r + d.dr * i;
            const nc = c + d.dc * i;
            if (
              nr >= 0 &&
              nr < this.rows &&
              nc >= 0 &&
              nc < this.cols &&
              this.board[nr][nc] === player
            ) {
              count++;
              winningCells.push({ r: nr, c: nc });
            } else {
              break;
            }
          }
          if (count === 4) {
            if (visualEffects) {
              winningCells.forEach((cell) => {
                const slot = this.slots.find(
                  (s) => s.row === cell.r && s.col === cell.c,
                );
                if (slot) slot.piece.style.border = "4px solid white";
              });
            }
            return true;
          }
        }
      }
    }
    return false;
  }

  cleanup() {}
}
