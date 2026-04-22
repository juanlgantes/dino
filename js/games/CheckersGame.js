export class CheckersGame {
  constructor(data, container, savedState) {
    this.data = data;
    this.c = container;
    this.savedState = savedState;
    this.board = []; // 8x8: 0=Empty, 1=Red(Player), 2=Black(Dino), 3=RedKing, 4=BlackKing
    this.turn = 1; // 1=Player, 2=Dino
    this.selectedPiece = null; // {r, c}
    this.validMoves = []; // [{r, c, isJump, jumpR, jumpC}]
    this.gameOver = false;
    this.animating = false;
    this.init();
  }

  init() {
    this.c.innerHTML = "";
    this.c.style.background = "#eecbad";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    const title = document.createElement("h2");
    title.textContent = "🏁 Damas 🦖";
    title.style.color = "#5d4037";
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
    window.app.saveGame("checkers", state);
  }

  startGame(isRestore) {
    this.c.innerHTML = "";

    // Controls Header
    const controls = document.createElement("div");
    controls.style.cssText =
      "display:flex; justify-content:space-between; width:95%; max-width:600px; margin-bottom:5px;";

    const btnBack = document.createElement("button");
    btnBack.textContent = "🔙";
    btnBack.style.cssText =
      "background:none; border:none; font-size:1.5em; cursor:pointer;";
    btnBack.onclick = () => this.init(); // Back to Menu

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
    boardEl.className = "checkers-board";
    boardEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    width: 90vmin; max-width: 600px; aspect-ratio: 1/1;
                    border: 1vmin solid #5d4037;
                    background: #f0d9b5;
                `;
    this.c.appendChild(boardEl);

    this.cells = [];
    if (!isRestore) this.board = this.createBoard();

    // Render Grid
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement("div");
        const isDark = (r + c) % 2 === 1;
        cell.style.cssText = `
                            width: 100%; height: 100%;
                            background: ${isDark ? "#b58863" : "#f0d9b5"};
                            position: relative;
                            display: flex; align-items: center; justify-content: center;
                        `;
        if (isDark) {
          cell.onclick = () => this.handleCellClick(r, c);
        }

        // Piece
        const piece = document.createElement("div");
        piece.className = "checkers-piece";
        piece.style.cssText = `
                            width: 80%; height: 80%; border-radius: 50%;
                            box-shadow: 0 0.5vmin 0.5vmin rgba(0,0,0,0.5);
                            transition: transform 0.2s, border 0.2s;
                            display: none;
                        `;
        cell.appendChild(piece);

        this.cells.push({ r, c, el: cell, pEl: piece });
        boardEl.appendChild(cell);
      }
    }

    this.statusEl = document.createElement("div");
    this.statusEl.style.cssText =
      "color: #5d4037; font-weight: bold; font-size: 1.5em; margin-top: 5px;";

    if (this.turn === 1) this.statusEl.textContent = "Tu turno (Rojos) 🔴";
    else this.statusEl.textContent = "Dino piensa... 🤔";

    this.c.appendChild(this.statusEl);

    this.updateView();

    if (isRestore && this.turn === 2) {
      setTimeout(() => this.dinoTurn(), 1000);
    }
  }

  createBoard() {
    const b = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0));
    // 1=Red (Player, Bottom), 2=Black (Dino, Top)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) b[r][c] = 2; // Black
          if (r > 4) b[r][c] = 1; // Red
        }
      }
    }
    return b;
  }

  updateView() {
    this.cells.forEach((cell) => {
      const val = this.board[cell.r][cell.c];
      const p = cell.pEl;

      // Reset styling
      cell.el.style.background =
        (cell.r + cell.c) % 2 === 1 ? "#b58863" : "#f0d9b5";
      p.style.display = val === 0 ? "none" : "block";
      p.style.border = "none";
      p.textContent = ""; // Clear King Icon

      if (val === 1 || val === 3) {
        p.style.background = "#d32f2f"; // Red
        if (val === 3) p.textContent = "👑";
      } else if (val === 2 || val === 4) {
        p.style.background = "#212121"; // Black
        if (val === 4) p.textContent = "👑";
      }

      // Highlight Selected
      if (
        this.selectedPiece &&
        this.selectedPiece.r === cell.r &&
        this.selectedPiece.c === cell.c
      ) {
        cell.el.style.background = "#795548"; // Darker highlight
        p.style.transform = "scale(1.1)";
      } else {
        p.style.transform = "scale(1)";
      }

      // Highlight Valid Moves
      if (this.validMoves.some((m) => m.r === cell.r && m.c === cell.c)) {
        cell.el.style.background = "#a5d6a7"; // Green hint
        // Add a small dot marker if empty?
        if (val === 0) {
          p.style.display = "block";
          p.style.background = "rgba(0,128,0,0.3)";
          p.style.width = "30%";
          p.style.height = "30%";
        }
      }
    });
  }

  handleCellClick(r, c) {
    if (this.gameOver || this.turn !== 1 || this.animating) return;

    const clickedVal = this.board[r][c];

    // 1. Select Own Piece
    if (clickedVal === 1 || clickedVal === 3) {
      this.selectedPiece = { r, c };
      this.validMoves = this.getMoves(r, c, 1);
      this.updateView();
      window.app.audio.playPop();
      return;
    }

    // 2. Move to valid spot
    const move = this.validMoves.find((m) => m.r === r && m.c === c);
    if (move) {
      this.executeMove(move);
    }
  }

  getMoves(r, c, player) {
    const moves = [];
    const piece = this.board[r][c];
    const isKing = piece === 3 || piece === 4;
    const opponent = player === 1 ? [2, 4] : [1, 3];

    // Directions: Player(1) moves UP (-1), Dino(2) moves DOWN (+1). Kings any.
    let dirs = [];
    if (player === 1 || isKing) dirs.push([-1, -1], [-1, 1]); // Up Left/Right
    if (player === 2 || isKing) dirs.push([1, -1], [1, 1]); // Down Left/Right

    dirs.forEach((d) => {
      const nr = r + d[0];
      const nc = c + d[1];

      if (this.onBoard(nr, nc)) {
        // Empty? Normal Move
        if (this.board[nr][nc] === 0) {
          moves.push({ r: nr, c: nc, isJump: false });
        }
        // Opponent? Check capture
        else if (opponent.includes(this.board[nr][nc])) {
          const jr = nr + d[0];
          const jc = nc + d[1];
          if (this.onBoard(jr, jc) && this.board[jr][jc] === 0) {
            moves.push({ r: jr, c: jc, isJump: true, jumpR: nr, jumpC: nc });
          }
        }
      }
    });

    // Optional: Forced Capture rules? Dino simplified rule: No forced capture for now.
    return moves;
  }

  onBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  executeMove(move) {
    const fromR = this.selectedPiece.r;
    const fromC = this.selectedPiece.c;
    const piece = this.board[fromR][fromC];

    // Move
    this.board[move.r][move.c] = piece;
    this.board[fromR][fromC] = 0;

    // Capture
    if (move.isJump) {
      this.board[move.jumpR][move.jumpC] = 0;
      window.app.audio.playPop(); // Crunch sound!
    } else {
      window.app.audio.playPop(); // Slide sound
    }

    // King Promotion
    // Player(1) reaches Row 0. Dino(2) reaches Row 7.
    if (this.turn === 1 && move.r === 0 && piece === 1)
      this.board[move.r][move.c] = 3;
    if (this.turn === 2 && move.r === 7 && piece === 2)
      this.board[move.r][move.c] = 4;

    this.selectedPiece = null;
    this.validMoves = [];
    this.updateView();

    // Check Win
    if (this.checkWin()) return;

    // Switch Turn
    this.turn = this.turn === 1 ? 2 : 1;
    this.statusEl.textContent =
      this.turn === 1 ? "Tu turno 🔴" : "Dino piensa... 🤔";

    if (this.turn === 2) {
      this.animating = true;
      setTimeout(() => this.dinoTurn(), 1000);
    }
  }

  dinoTurn() {
    if (this.gameOver) return;

    // Find all pieces
    let pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.board[r][c] === 2 || this.board[r][c] === 4) {
          pieces.push({ r, c });
        }
      }
    }

    // Aggregate all valid moves
    let allMoves = [];
    pieces.forEach((p) => {
      const moves = this.getMoves(p.r, p.c, 2);
      moves.forEach((m) => {
        allMoves.push({ ...m, fromR: p.r, fromC: p.c });
      });
    });

    if (allMoves.length === 0) {
      // Dino cannot move -> Player Wins
      this.gameOver = true;
      this.statusEl.textContent = "¡Dino no puede mover! ¡GANASTE! 🎉";
      window.app.audio.playWin();
      setTimeout(() => {
        const ov = document.createElement("div");
        ov.style.cssText =
          "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100;";
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
      return;
    }

    // AI Priority: Capture > Random
    const jumps = allMoves.filter((m) => m.isJump);
    let selectedMove;

    if (jumps.length > 0) {
      selectedMove = jumps[Math.floor(Math.random() * jumps.length)];
    } else {
      selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    // Execute
    this.selectedPiece = { r: selectedMove.fromR, c: selectedMove.fromC };
    this.executeMove(selectedMove);
    this.animating = false;
  }

  checkWin() {
    // Count pieces
    let red = 0,
      black = 0;
    this.board.forEach((row) =>
      row.forEach((c) => {
        if (c === 1 || c === 3) red++;
        if (c === 2 || c === 4) black++;
      }),
    );

    if (black === 0) {
      this.gameOver = true;
      this.statusEl.textContent = "¡GANASTE! 🔴🏆";
      window.app.audio.playWin();
      window.app.addScore(30);
      setTimeout(() => {
        const ov = document.createElement("div");
        ov.style.cssText =
          "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100;";
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
      return true;
    }
    if (red === 0) {
      this.gameOver = true;
      this.statusEl.textContent = "¡Dino Gana! 🦖";
      window.app.audio.playError();
      setTimeout(() => {
        const ov = document.createElement("div");
        ov.style.cssText =
          "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100;";
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
      return true;
    }
    return false;
  }
}
