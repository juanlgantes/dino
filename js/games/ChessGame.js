export class ChessGame {
  constructor(data, container, savedState) {
    this.data = data;
    this.c = container;
    this.savedState = savedState;
    this.turn = "white"; // white | black
    this.selected = null; // {r, c}
    this.moves = []; // Valid moves for selected
    this.gameOver = false;

    this.piecesMap = {
      k: "♚",
      q: "♛",
      r: "♜",
      b: "♝",
      n: "♞",
      p: "♟",
      K: "♔",
      Q: "♕",
      R: "♖",
      B: "♗",
      N: "♘",
      P: "♙",
    };

    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#34495e";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    const title = document.createElement("h2");
    title.textContent = "♟️ Ajedrez 🦖";
    title.style.color = "#ecf0f1";
    title.style.marginBottom = "20px";
    this.c.appendChild(title);

    const btnPlay = document.createElement("button");
    btnPlay.className = "mode-btn kid";
    btnPlay.style.background = "#e74c3c";
    btnPlay.textContent = "🎮 Jugar";
    btnPlay.onclick = () => this.startGame(false);
    this.c.appendChild(btnPlay);

    if (this.savedState) {
      const btnResume = document.createElement("button");
      btnResume.className = "mode-btn kid";
      btnResume.style.background = "#2ecc71";
      btnResume.style.marginTop = "10px";
      btnResume.textContent = "📂 Continuar";
      btnResume.onclick = () => this.resumeGame();
      this.c.appendChild(btnResume);
    }

    const exit = document.createElement("button");
    exit.textContent = "🏠 Salir";
    exit.className = "mode-btn kid";
    exit.style.marginTop = "20px";
    exit.onclick = () => window.app.nav.goBackFromGame();
    this.c.appendChild(exit);
  }

  resumeGame() {
    this.board = this.savedState.board;
    this.turn = this.savedState.turn;
    this.startGame(true);
  }

  save() {
    const state = {
      board: this.board,
      turn: this.turn,
    };
    window.app.saveGame("chess", state);
  }

  startGame(isRestore) {
    this.c.innerHTML = "";

    // Controls
    const controls = document.createElement("div");
    controls.style.cssText =
      "display:flex; justify-content:space-between; width:95%; max-width:600px; margin-bottom:5px;";

    const btnBack = document.createElement("button");
    btnBack.textContent = "🔙";
    btnBack.style.cssText =
      "background:none; border:none; font-size:1.5em; cursor:pointer; margin-right: 10px;";
    btnBack.onclick = () => this.init();

    const btnSave = document.createElement("button");
    btnSave.textContent = "💾 Guardar";
    btnSave.className = "mode-btn kid";
    btnSave.style.cssText =
      "padding: 5px 15px; font-size: 1em; background: #3498db;";
    btnSave.onclick = () => this.save();

    controls.appendChild(btnBack);
    controls.appendChild(btnSave);
    this.c.appendChild(controls);

    const boardEl = document.createElement("div");
    boardEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    width: 90vmin; max-width: 600px; aspect-ratio: 1/1;
                    border: 5px solid #2c3e50;
                `;
    this.c.appendChild(boardEl);

    // Init Board State if not restoring
    if (!isRestore) {
      this.board = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ];
      this.turn = "white";
    }

    this.cells = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement("div");
        const isDark = (r + c) % 2 === 1;
        cell.style.cssText = `
                            width:100%; height:100%;
                            background: ${isDark ? "#7f8c8d" : "#ecf0f1"};
                            display: flex; align-items: center; justify-content: center;
                            font-size: 8vmin; cursor: pointer; user-select: none;
                        `;
        // Adjust font size for PC
        if (window.innerWidth > 1024) cell.style.fontSize = "50px";

        cell.onclick = () => this.clickCell(r, c);
        this.cells.push({ r, c, el: cell });
        boardEl.appendChild(cell);
      }
    }

    this.statusEl = document.createElement("div");
    this.statusEl.style.cssText =
      "color:white; margin-top:10px; font-size:1.5em;";
    this.statusEl.textContent =
      this.turn === "white" ? "Tu turno (Blancas)" : "Dino piensa...";
    this.c.appendChild(this.statusEl);

    this.render();

    if (isRestore && this.turn === "black") {
      setTimeout(() => this.dinoAI(), 500);
    }
  }

  render() {
    this.cells.forEach((obj) => {
      const p = this.board[obj.r][obj.c];
      obj.el.textContent = this.piecesMap[p] || "";

      // Reset Color
      const isDark = (obj.r + obj.c) % 2 === 1;
      obj.el.style.background = isDark ? "#7f8c8d" : "#ecf0f1";

      // Highlight Selected
      if (
        this.selected &&
        this.selected.r === obj.r &&
        this.selected.c === obj.c
      ) {
        obj.el.style.background = "#f1c40f"; // Yellow select
      }

      // Highlight Moves
      if (this.moves.some((m) => m.r === obj.r && m.c === obj.c)) {
        // Capture?
        if (this.board[obj.r][obj.c]) {
          obj.el.style.background = "#e74c3c"; // Red capture
        } else {
          obj.el.style.background = "#2ecc71"; // Green move
        }
      }
    });
  }

  clickCell(r, c) {
    if (this.turn !== "white" || this.gameOver) return;

    const p = this.board[r][c];
    const isOwn = p && p === p.toUpperCase(); // White are Upper

    if (isOwn) {
      this.selected = { r, c };
      this.moves = this.getMoves(r, c, p);
      this.render();
      window.app.audio.playPop();
    } else if (this.selected) {
      // Try Move
      const move = this.moves.find((m) => m.r === r && m.c === c);
      if (move) {
        this.executeMove(this.selected, move);
      }
    }
  }

  executeMove(from, to) {
    const p = this.board[from.r][from.c];
    const target = this.board[to.r][to.c];

    this.board[to.r][to.c] = p;
    this.board[from.r][from.c] = "";

    // Capture King Win Check
    if (target.toLowerCase() === "k") {
      this.gameOver = true;
      this.statusEl.textContent =
        this.turn === "white" ? "¡Jaque Mate! 🎉" : "¡Dino Gana! 🦖";
      window.app.audio.playWin();
      setTimeout(() => {
        const ov = document.createElement("div");
        ov.style.cssText =
          "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:10px;";
        ov.innerHTML = `
                            <div style="font-size:5em;">${this.statusEl.textContent.includes("Dino") ? "🦕" : "🏆"}</div>
                            <h2 style="color:white; margin:20px;">${this.statusEl.textContent}</h2>
                            <div style="display:flex; gap:20px; flex-direction:column;">
                                <button class="mode-btn kid" style="background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                                <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                            </div>
                        `;
        this.c.appendChild(ov);
      }, 1500);
    } else {
      window.app.audio.playPop();
    }

    this.selected = null;
    this.moves = [];
    this.render();

    if (!this.gameOver) {
      this.turn = this.turn === "white" ? "black" : "white";
      this.statusEl.textContent =
        this.turn === "white" ? "Tu turno" : "Dino piensa...";
      if (this.turn === "black") {
        setTimeout(() => this.dinoAI(), 500);
      }
    }
  }

  dinoAI() {
    // Simple AI: Find all black pieces, get all moves, prioritize Kings/Captures, else Random.
    let allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p === p.toLowerCase()) {
          // Black
          const moves = this.getMoves(r, c, p);
          moves.forEach((m) => {
            allMoves.push({ from: { r, c }, to: m });
          });
        }
      }
    }

    if (allMoves.length === 0) {
      // No moves? Stalemate or Mate? Assume loss for Dino if stuck.
      this.statusEl.textContent = "¡Dino no puede mover! 🤷‍♂️";
      return;
    }

    // Priority: Capture King > Capture Queen > Capture Any > Random
    let bestMove = null;
    let bestScore = -1;

    // Values
    const val = { K: 1000, Q: 9, R: 5, B: 3, N: 3, P: 1 };

    allMoves.forEach((mv) => {
      const target = this.board[mv.to.r][mv.to.c];
      let score = 0;
      if (target) score = val[target] || 1;

      if (score > bestScore) {
        bestScore = score;
        bestMove = mv;
      }
    });

    // Randomize if equal score (0) to allow variety
    if (bestScore === 0) {
      bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    if (bestMove) {
      this.executeMove(bestMove.from, bestMove.to);
    }
  }

  getMoves(r, c, p) {
    const moves = [];
    const type = p.toLowerCase();
    const isWhite = p === p.toUpperCase();

    // Helpers
    const isEmpty = (r, c) => this.onBoard(r, c) && this.board[r][c] === "";
    const isEnemy = (r, c) => {
      if (!this.onBoard(r, c)) return false;
      const t = this.board[r][c];
      if (!t) return false;
      return isWhite ? t === t.toLowerCase() : t === t.toUpperCase();
    };
    const addIfValid = (nr, nc) => {
      if (this.onBoard(nr, nc)) {
        if (isEmpty(nr, nc)) {
          moves.push({ r: nr, c: nc });
          return true;
        } // Continue sliding?
        if (isEnemy(nr, nc)) {
          moves.push({ r: nr, c: nc });
        } // Capture and stop
        return false; // Stop sliding
      }
      return false;
    };

    // Logic per piece
    if (type === "p") {
      // Pawn
      const dir = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;
      // Forward 1
      if (isEmpty(r + dir, c)) {
        moves.push({ r: r + dir, c: c });
        // Forward 2
        if (r === startRow && isEmpty(r + dir * 2, c)) {
          moves.push({ r: r + dir * 2, c: c });
        }
      }
      // Capture
      if (isEnemy(r + dir, c - 1)) moves.push({ r: r + dir, c: c - 1 });
      if (isEnemy(r + dir, c + 1)) moves.push({ r: r + dir, c: c + 1 });
    }

    if (type === "n") {
      // Knight
      [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ].forEach((o) => {
        const nr = r + o[0],
          nc = c + o[1];
        if (this.onBoard(nr, nc)) {
          if (isEmpty(nr, nc) || isEnemy(nr, nc)) moves.push({ r: nr, c: nc });
        }
      });
    }

    if (type === "k") {
      // King
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach((o) => {
        const nr = r + o[0],
          nc = c + o[1];
        if (this.onBoard(nr, nc)) {
          if (isEmpty(nr, nc) || isEnemy(nr, nc)) moves.push({ r: nr, c: nc });
        }
      });
    }

    if (type === "r" || type === "q") {
      // Rook/Queen lines
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach((d) => {
        for (let i = 1; i < 8; i++) {
          if (!addIfValid(r + d[0] * i, c + d[1] * i)) break;
        }
      });
    }

    if (type === "b" || type === "q") {
      // Bishop/Queen diags
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach((d) => {
        for (let i = 1; i < 8; i++) {
          if (!addIfValid(r + d[0] * i, c + d[1] * i)) break;
        }
      });
    }

    return moves;
  }

  onBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }
  cleanup() {}
}
