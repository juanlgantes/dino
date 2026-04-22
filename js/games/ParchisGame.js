export class ParchisGame {
            constructor(data, container, savedState) {
                this.data = data;
                this.c = container;
                this.savedState = savedState;
                // Game State
                this.turn = 1; // 1=Red, 2=Yellow, 3=Green, 4=Blue
                this.diceVal = null;
                this.waitingRoll = true;
                // Pieces: 0-3 Red, 4-7 Yellow, 8-11 Green, 12-15 Blue.
                this.pieces = Array(16).fill(0);
                this.msg = 'Selecciona Modo 🎮';
                this.gameOver = false;
                this.gameMode = 'pve'; // pve | pvp | pvp4

                this.init();
            }

            init() {
                this.c.innerHTML = '';
                this.c.style.background = '#ecf0f1';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';
                this.c.style.fontFamily = "'Fredoka', sans-serif";

                // Mode Selection Screen
                const title = document.createElement('h2');
                title.textContent = '🎲 Parchís Dino';
                title.style.color = '#2c3e50';
                title.style.fontSize = '3em';
                title.style.marginBottom = '40px';
                this.c.appendChild(title);

                const btnContainer = document.createElement('div');
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '20px';
                btnContainer.style.flexWrap = 'wrap';
                btnContainer.style.justifyContent = 'center';

                const btn1 = document.createElement('button');
                btn1.className = 'mode-btn kid';
                btn1.style.background = '#e74c3c';
                btn1.innerHTML = '🤖 1 Jugador<br><span style="font-size:0.6em">vs Dino</span>';
                btn1.onclick = () => this.startGame('pve');

                const btn2 = document.createElement('button');
                btn2.className = 'mode-btn kid';
                btn2.style.background = '#f1c40f';
                btn2.innerHTML = '👥 2 Jugadores<br><span style="font-size:0.6em">Amigos</span>';
                btn2.onclick = () => this.startGame('pvp');

                const btn4 = document.createElement('button');
                btn4.className = 'mode-btn kid';
                btn4.style.background = '#2ecc71';
                btn4.innerHTML = '👥 4 Jugadores<br><span style="font-size:0.6em">Fiesta</span>';
                btn4.onclick = () => this.startGame('pvp4');

                const btn3 = document.createElement('button');
                btn3.className = 'mode-btn kid';
                btn3.style.background = '#9b59b6';
                btn3.innerHTML = '🎲 Híbrido<br><span style="font-size:0.6em">2P Real</span>';
                btn3.onclick = () => this.startGame('hybrid');

                const btn5 = document.createElement('button');
                btn5.className = 'mode-btn kid';
                btn5.style.background = '#8e44ad';
                btn5.innerHTML = '🎲 Híbrido 4<br><span style="font-size:0.6em">4P Real</span>';
                btn5.onclick = () => this.startGame('hybrid4');

                btnContainer.appendChild(btn1);
                btnContainer.appendChild(btn2);
                btnContainer.appendChild(btn4);
                btnContainer.appendChild(btn3);
                btnContainer.appendChild(btn5);

                // Restore Button
                if (this.savedState) {
                    const btnResume = document.createElement('button');
                    btnResume.className = 'mode-btn kid';
                    btnResume.style.background = '#2ecc71';
                    btnResume.innerHTML = '📂 Continuar<br><span style="font-size:0.6em">Partida Guardada</span>';
                    btnResume.onclick = () => this.resumeGame();
                    btnContainer.appendChild(btnResume);
                }

                this.c.appendChild(btnContainer);

                // Exit Button
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.marginTop = '40px';
                exit.onclick = () => window.app.nav.goBackFromGame();
                this.c.appendChild(exit);
            }

            resumeGame() {
                if (this.savedState) {
                    this.gameMode = this.savedState.gameMode || 'pve';
                    this.pieces = this.savedState.pieces || Array(16).fill(0);
                    this.turn = this.savedState.turn || 1;
                    this.msg = (this.gameMode === 'hybrid' || this.gameMode === 'hybrid4') ? 'Tira tu dado y anota 📝' : 'Tira el dado 🎲';
                    this.setupBoard();
                    this.updateTurnUI();

                    if (this.gameMode === 'pve' && this.turn === 2) {
                        this.dinoAI();
                    } else {
                        this.waitingRoll = true;
                    }
                }
            }

            save() {
                const state = {
                    gameMode: this.gameMode,
                    pieces: this.pieces,
                    turn: this.turn
                };
                window.app.saveGame('parchis', state);
            }

            startGame(mode) {
                this.gameMode = mode;
                this.pieces = Array(16).fill(0);
                this.turn = 1;
                this.msg = (mode === 'hybrid' || mode === 'hybrid4') ? 'Tira tu dado y anota 📝' : 'Tira el dado 🎲';
                this.setupBoard();
                this.updateTurnUI();
            }

            setupBoard() {
                this.c.innerHTML = '';
                // Header
                const header = document.createElement('div');
                header.style.cssText = 'display:flex; justify-content:space-between; width:100%; max-width:600px; padding:10px; align-items:center;';

                this.statusEl = document.createElement('h2');
                this.statusEl.textContent = this.msg;
                this.statusEl.style.color = '#2c3e50';

                this.diceEl = document.createElement('div');
                this.diceEl.className = 'parchis-dice';
                this.diceEl.textContent = '🎲';
                this.diceEl.style.cssText = 'font-size:3em; cursor:pointer; background:white; padding:10px; border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.2); user-select:none;';
                this.diceEl.onclick = () => this.rollDice();

                header.appendChild(this.statusEl);
                header.appendChild(this.diceEl);
                this.c.appendChild(header);

                // Manual Dice Input (Hidden by default)
                this.diceInput = document.createElement('div');
                this.diceInput.style.cssText = `
                    display: none;
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.95);
                    padding: 20px; border-radius: 20px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                    flex-direction: column; align-items: center; gap: 10px;
                    z-index: 100;
                `;
                const inputLabel = document.createElement('h3');
                inputLabel.textContent = '¿Qué número salió?';
                inputLabel.style.color = '#2c3e50';
                this.diceInput.appendChild(inputLabel);

                const btnsDiv = document.createElement('div');
                btnsDiv.style.display = 'flex'; btnsDiv.style.gap = '10px';

                for (let i = 1; i <= 6; i++) {
                    const b = document.createElement('button');
                    b.textContent = i;
                    b.style.cssText = 'width:50px; height:50px; font-size:1.5em; border:none; border-radius:50%; background:#3498db; color:white; cursor:pointer;';
                    b.onclick = () => this.submitDice(i);
                    btnsDiv.appendChild(b);
                }
                this.diceInput.appendChild(btnsDiv);
                this.c.appendChild(this.diceInput);

                // Board (15x15 Grid)
                const board = document.createElement('div');
                board.className = 'parchis-board';
                // CSS Grid Logic for Cross
                board.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(11, 1fr);
                    grid-template-rows: repeat(11, 1fr);
                    gap: 1px;
                    width: 95vmin; height: 95vmin;
                    max-width: 600px; max-height: 600px;
                    background: white; border: 2px solid #333;
                    position: relative;
                `;
                this.c.appendChild(board);

                this.renderBoard(board);

                // Pieces Render
                this.pieceEls = [];
                const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db']; // Red, Yellow, Green, Blue

                // Show pieces based on mode
                const totalPieces = (this.gameMode === 'pvp4' || this.gameMode === 'hybrid4') ? 16 : 8; // 8 for 2P modes

                for (let i = 0; i < totalPieces; i++) {
                    const pIdx = Math.floor(i / 4); // 0, 1, 2, 3
                    const p = document.createElement('div');
                    p.className = 'parchis-piece';
                    p.style.cssText = `
                        width: 5.5%; height: 5.5%; border-radius: 50%;
                        background: ${colors[pIdx]};
                        border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.3);
                        position: absolute; transition: all 0.5s;
                        z-index: 10; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color:white; font-weight:bold;
                    `;
                    p.textContent = (i % 4) + 1;
                    p.onclick = () => this.clickPiece(i);
                    board.appendChild(p);
                    this.pieceEls.push(p);
                }
                this.updatePieces();

                // Controls Row
                const controls = document.createElement('div');
                controls.style.display = 'flex';
                controls.style.gap = '10px';
                controls.style.marginTop = '10px';

                // Save
                const saveBtn = document.createElement('button');
                saveBtn.textContent = '💾 Guardar';
                saveBtn.className = 'mode-btn kid';
                saveBtn.style.background = '#3498db'; // Blue
                saveBtn.style.padding = '10px 20px';
                saveBtn.style.fontSize = '1em';
                saveBtn.onclick = () => this.save();
                controls.appendChild(saveBtn);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.padding = '10px 20px';
                exit.style.fontSize = '1em';
                exit.onclick = () => window.app.nav.goBackFromGame();
                controls.appendChild(exit);

                this.c.appendChild(controls);
            }

            renderBoard(container) {
                // 11x11 Grid.
                for (let r = 0; r < 11; r++) {
                    for (let c = 0; c < 11; c++) {
                        const div = document.createElement('div');
                        div.style.cssText = 'width:100%; height:100%; position:relative;';

                        // Define Areas
                        // Corners (Homes)
                        if (r < 4 && c < 4) div.style.background = '#e74c3c'; // Red Home
                        else if (r < 4 && c > 6) div.style.background = '#f1c40f'; // Yellow Home
                        else if (r > 6 && c < 4) div.style.background = '#3498db'; // Blue (Unused in 2P but shown)
                        else if (r > 6 && c > 6) div.style.background = '#2ecc71'; // Green (Unused in 2P but shown)

                        // Center
                        else if (r === 5 && c === 5) div.style.background = 'conic-gradient(#e74c3c, #f1c40f, #2ecc71, #3498db)';

                        // Paths (White with borders)
                        else {
                            div.style.background = 'white';
                            div.style.border = '1px solid #eee';

                            // Safe Spots (Starts)
                            if ((r === 4 && c === 0) || (r === 0 && c === 6) || (r === 6 && c === 10) || (r === 10 && c === 4)) {
                                div.style.background = '#bdc3c7'; // Safe Grey
                                div.textContent = '⭐';
                                div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.justifyContent = 'center'; div.style.fontSize = '0.8em';
                            }
                            // Colored Goal Paths
                            if (r === 5 && c > 0 && c < 5) div.style.background = '#e74c3c'; // Red Path (Left)
                            if (c === 5 && r > 0 && r < 5) div.style.background = '#f1c40f'; // Yellow Path (Top)
                            if (r === 5 && c > 5 && c < 10) div.style.background = '#2ecc71'; // Green Path (Right)
                            if (c === 5 && r > 5 && r < 10) div.style.background = '#3498db'; // Blue Path (Bottom)
                        }
                        container.appendChild(div);
                    }
                }
            }

            getCoord(pos, playerIdx) {
                // Returns {x, y} grid indices (0-10)
                // pos: 0=Home, 1..40=Loop, 100+=Goal

                // HOMES
                if (pos === 0) {
                    const p = Math.floor(playerIdx / 4); // 0..3 (Red, Yel, Grn, Blu)
                    const sub = playerIdx % 4;
                    // Grid 11x11. Corners 4x4.
                    let bx = 0, by = 0;
                    if (p === 0) { bx = 1; by = 1; } // Red: TL
                    if (p === 1) { bx = 7; by = 1; } // Yel: TR
                    if (p === 2) { bx = 7; by = 7; } // Grn: BR
                    if (p === 3) { bx = 1; by = 7; } // Blu: BL

                    const r = by + Math.floor(sub / 2);
                    const c = bx + (sub % 2);
                    return { x: c, y: r };
                }

                // GOALS (100+)
                if (pos > 100) {
                    const step = pos - 100; // 1..5
                    const p = Math.floor(playerIdx / 4);
                    if (p === 0) return { x: step, y: 5 }; // Red -> Right
                    if (p === 1) return { x: 5, y: step }; // Yel -> Down
                    if (p === 2) return { x: 10 - step, y: 5 }; // Grn -> Left
                    if (p === 3) return { x: 5, y: 10 - step }; // Blu -> Up
                }

                // PATH (1..40)
                // Normalize 1..40 to Grid Coords
                let x = 0, y = 0;
                if (pos <= 5) { y = 4; x = pos - 1; }
                else if (pos <= 9) { y = 4 - (pos - 5); x = 4; }
                else if (pos <= 11) { y = 0; x = 4 + (pos - 9); }
                else if (pos <= 15) { y = (pos - 11); x = 6; }
                else if (pos <= 19) { y = 4; x = 6 + (pos - 15); }
                else if (pos <= 21) { y = 4 + (pos - 19); x = 10; }
                else if (pos <= 25) { y = 6; x = 10 - (pos - 21); }
                else if (pos <= 29) { y = 6 + (pos - 25); x = 6; }
                else if (pos <= 31) { y = 10; x = 6 - (pos - 29); }
                else if (pos <= 35) { y = 10 - (pos - 31); x = 4; }
                else if (pos <= 39) { y = 6; x = 4 - (pos - 35); }
                else if (pos === 40) { y = 5; x = 0; }

                return { x, y };
            }

            updatePieces() {
                if (!this.pieceEls) return;

                this.pieceEls.forEach((el, i) => {
                    const pos = this.pieces[i];
                    const coords = this.getCoord(pos, i);

                    el.style.left = `calc(${coords.x * 9.09}% + 1%)`;
                    el.style.top = `calc(${coords.y * 9.09}% + 1%)`;

                    // Highlight Active Player's Pieces
                    const pIdx = Math.floor(i / 4) + 1; // 1,2,3,4
                    const isMyTurn = (this.turn === pIdx);

                    let canInteract = false;
                    if (isMyTurn && this.diceVal && !this.waitingRoll) {
                        if (this.gameMode === 'pve') {
                            canInteract = (pIdx === 1); // Only Human Red
                        } else {
                            canInteract = true; // Any human turn
                        }
                    }

                    if (canInteract) {
                        el.style.border = '2px solid white';
                        el.style.transform = 'scale(1.2)';
                        el.style.cursor = 'pointer';
                        el.style.zIndex = '20';
                    } else {
                        el.style.border = '2px solid white';
                        el.style.transform = 'scale(1)';
                        el.style.cursor = 'default';
                        el.style.zIndex = '10';
                    }
                });
            }

            rollDice() {
                if (this.waitingRoll) {
                    if (this.gameMode === 'pve' && this.turn !== 1) return;

                    if (this.gameMode === 'hybrid' || this.gameMode === 'hybrid4') {
                        this.diceInput.style.display = 'flex';
                        return;
                    }

                    this.diceVal = Math.floor(Math.random() * 6) + 1;
                    this.processDice(this.diceVal);
                }
            }

            submitDice(val) {
                this.diceInput.style.display = 'none';
                this.diceVal = val;
                this.processDice(val);
            }

            processDice(val) {
                this.diceEl.textContent = '🎲 ' + val;
                this.waitingRoll = false;
                this.statusEl.textContent = `Has sacado un ${val}`;

                const playerToCheck = this.turn;
                if (!this.canMoveAny(playerToCheck)) {
                    setTimeout(() => {
                        this.statusEl.textContent = '¡No puedes mover! 🚫';
                        this.nextTurn();
                    }, 1000);
                } else {
                    this.statusEl.textContent = 'Mueve tu ficha...';
                    this.updatePieces(); // Refresh highlights
                }
            }

            canMoveAny(player) {
                const start = (player - 1) * 4;
                for (let i = start; i < start + 4; i++) {
                    if (this.validateMove(i, this.diceVal) !== false) return true;
                }
                return false;
            }

            clickPiece(idx) {
                const pieceOwner = Math.floor(idx / 4) + 1;

                if (this.turn !== pieceOwner) return;
                if (this.waitingRoll) return;
                if (this.gameMode === 'pve' && pieceOwner !== 1) return;

                if (this.tryMove(idx, this.diceVal)) {
                    const rolled = this.diceVal;
                    this.diceVal = null;
                    this.waitingRoll = true;

                    this.checkWin();
                    if (!this.gameOver) {
                        if (rolled === 6) {
                            this.waitingRoll = true;
                            this.statusEl.textContent = '¡6! Repite turno 🎲';
                            this.updatePieces();
                        } else {
                            this.nextTurn();
                        }
                    }
                } else {
                    window.app.audio.playError();
                }
            }

            tryMove(pIdx, steps) {
                const newPos = this.validateMove(pIdx, steps);
                if (newPos === false) return false;

                this.pieces[pIdx] = newPos;
                this.updatePieces();
                window.app.audio.playPop();
                return true;
            }

            validateMove(pIdx, steps) {
                const pos = this.pieces[pIdx];
                const playerNum = Math.floor(pIdx / 4); // 0,1,2,3

                // 1. Leave Home
                if (pos === 0) {
                    if (steps === 5) {
                        const starts = [1, 11, 21, 31];
                        return starts[playerNum];
                    } else {
                        return false;
                    }
                }

                // 2. In Goal Already (>100)
                if (pos > 100) {
                    const stepInGoal = pos - 100;
                    if (stepInGoal + steps <= 6) return pos + steps;
                    return false;
                }

                // 3. Normal Path
                // Robust Generic Logic:
                const absStart = [1, 11, 21, 31][playerNum];

                // Current Distance from Start (0..39)
                // Need to handle wrap logic correctly for modulo arithmetic on negative numbers if necessary,
                // but here numbers are positive.
                // pos 1..40. Start 1..40.
                // Distance = (pos - absStart + 40) % 40

                // Example: Red Start 1. Pos 1. Dist = 0.
                // Example: Yel Start 11. Pos 11. Dist = 0.
                // Example: Yel Pos 10. Dist = (10 - 11 + 40)%40 = 39. Correct (just before entry).

                let dist = (pos - absStart + 40) % 40;
                let nextDist = dist + steps;

                if (nextDist >= 40) {
                    // Entering Goal
                    const excess = nextDist - 40; // 0..5 (Steps into goal)
                    if (excess < 6) return 100 + (excess + 1);
                    return false; // Overshoot
                }

                // Just moving on path (Wrap 40 -> 1)
                let nextPos = pos + steps;
                if (nextPos > 40) nextPos -= 40;
                return nextPos;
            }

            updateTurnUI() {
                const colors = ['#fad390', '#fff9c4', '#a5d6a7', '#81d4fa'];
                const names = ['Rojo 🔴', 'Amarillo 🟡', 'Verde 🟢', 'Azul 🔵'];

                this.statusEl.textContent = `Turno ${names[this.turn - 1]}`;
                this.c.style.background = colors[this.turn - 1];
            }

            nextTurn() {
                const maxP = (this.gameMode === 'pvp4' || this.gameMode === 'hybrid4') ? 4 : 2;
                this.turn = (this.turn % maxP) + 1;

                this.diceEl.textContent = '🎲';
                this.updateTurnUI();

                if (this.gameMode === 'pve' && this.turn === 2) {
                    this.statusEl.textContent = 'Dino tira...';
                    setTimeout(() => this.dinoAI(), 1000);
                } else {
                    this.waitingRoll = true;
                }
            }

            dinoAI() {
                this.diceVal = Math.floor(Math.random() * 6) + 1;
                this.diceEl.textContent = '🎲 ' + this.diceVal;

                setTimeout(() => {
                    let moved = false;
                    const pIds = [4, 5, 6, 7].sort(() => Math.random() - 0.5);

                    for (let id of pIds) {
                        if (this.tryMove(id, this.diceVal)) {
                            moved = true;
                            break;
                        }
                    }

                    if (!moved) this.statusEl.textContent = 'Dino pasa 🐢';

                    this.checkWin();
                    if (!this.gameOver) {
                        if (this.diceVal === 6 && moved) {
                            setTimeout(() => this.dinoAI(), 1000);
                        } else {
                            this.nextTurn();
                        }
                    }
                }, 1000);
            }

            checkWin() {
                for (let p = 0; p < 4; p++) {
                    const start = p * 4;
                    // Check if all 4 pieces are in goal (>100)
                    const wins = this.pieces.slice(start, start + 4).every(pos => pos > 100);

                    if (wins) {
                        this.gameOver = true;
                        const names = ['Rojo 🔴', 'Amarillo 🟡', 'Verde 🟢', 'Azul 🔵'];
                        this.statusEl.textContent = `¡${names[p]} GANA! 🏆`;

                        window.app.audio.playWin();
                        if (p === 0 && this.gameMode === 'pve') window.app.addScore(40);

                        setTimeout(() => {
                            const ov = document.createElement('div');
                            ov.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:10px;';
                            ov.innerHTML = `
                                <div style="font-size:5em;">🏆</div>
                                <h2 style="color:white; margin:20px;">${names[p]} GANA</h2>
                                <div style="display:flex; gap:20px; flex-direction:column;">
                                    <button class="mode-btn kid" style="background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                                    <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                                </div>
                            `;
                            this.c.appendChild(ov);
                        }, 1500);
                        return;
                    }
                }
            }

        }
