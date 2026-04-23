export class GooseGame {
            constructor(data, container, savedState) {
                this.data = data;
                this.c = container;
                this.savedState = savedState;
                this.app = window.app;
                this.pieces = [1, 1]; // P1 (User/Dino), P2 (AI/Human)
                this.turn = 0; // 0 = P1, 1 = P2
                this.waitingRoll = false;
                this.skip = [0, 0];
                this.timeouts = [];
                this.gameMode = 'pve'; // pve, pvp, hybrid

                this.DINOS = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];
                this.SPECIALS = {
                    6: { t: 12, msg: '¡De Puente a Puente! 🌉' },
                    12: { t: 6, msg: '¡Puente roto! 🌉' },
                    19: { skip: 1, msg: '¡Posada! Pierdes 1 turno 💤' },
                    31: { skip: 2, msg: '¡Pozo! Pierdes 2 turnos 🕳️' },
                    42: { t: 30, msg: '¡Laberinto! Retrocedes 🌀' },
                    58: { t: 1, msg: '¡METEORITO! Vuelve al inicio ☄️' }
                };

                this.init();
            }

            wait(fn, ms) {
                const id = setTimeout(() => {
                    fn();
                    this.timeouts = this.timeouts.filter(t => t !== id);
                }, ms);
                this.timeouts.push(id);
            }

            injectStyles() {
                if (document.getElementById('goose-game-style')) return;
                const s = document.createElement('style');
                s.id = 'goose-game-style';
                s.innerHTML = `
                    /* --- GOOSE GAME STYLES --- */
                    .goose-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: #ecf0f1;
                        width: 100%;
                        height: 100%; /* Fill container */
                        justify-content: flex-start;
                        font-family: "Fredoka", sans-serif;
                        padding: 5px;
                        box-sizing: border-box;
                        overflow-y: auto; /* Allow internal scroll if needed */
                        -webkit-overflow-scrolling: touch;
                    }

                    .goose-header {
                        width: 95%;
                        max-width: 500px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 5px;
                        background: white;
                        padding: 8px;
                        border-radius: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        flex-shrink: 0;
                    }

                    .goose-board {
                        display: grid;
                        grid-template-columns: repeat(8, minmax(0, 1fr));
                        grid-template-rows: repeat(8, minmax(0, 1fr));
                        gap: 2px;
                        box-sizing: border-box;
                        background: #2c3e50;
                        border: 4px solid #34495e;
                        border-radius: 10px;
                        position: relative;
                        padding: 2px;

                        /* Responsive Sizing v17.31 */
                        width: 95%;
                        max-width: 55vh; /* Limit width based on viewport height (safe proxy for container) */
                        min-width: 280px; /* Minimum playable size */

                        max-height: calc(100% - 90px); /* Leave room for header */
                        aspect-ratio: 1/1;

                        /* Flex centering */
                        margin: 0 auto 10px auto;

                        /* Ensure it shrinks */
                        min-height: 0;
                    }

                    .goose-board > div {
                        overflow: hidden;
                        font-size: clamp(0.6em, 2.5vmin, 1.2em);
                    }
                    .goose-board > div > div {
                        max-width: 100%;
                        overflow: hidden;
                    }

                    /* --- MOBILE LANDSCAPE OPTIMIZATIONS --- */
                    @media (orientation: landscape) and (max-height: 600px) {
                        .container {
                            margin-top: 0px !important;
                        }

                        .goose-container {
                            flex-direction: row;
                            justify-content: center;
                            align-items: center;
                            gap: 10px;
                            padding: 2px;
                        }

                        .goose-header {
                            width: 120px;
                            flex-direction: column;
                            height: auto;
                            max-height: 98%;
                            overflow-y: auto;
                            padding: 5px;
                            gap: 10px;
                            margin-bottom: 0;
                            margin-right: 5px;
                        }

                        .goose-header > div {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }

                        .goose-board {
                            width: auto;
                            height: auto;
                            max-height: 70vh;
                            max-width: calc(100% - 130px);
                            min-width: 200px;
                            aspect-ratio: 1/1;
                        }

                        #gameArea {
                            height: auto !important;
                            min-height: 0 !important;
                            flex-grow: 1; /* Allow taking space */
                        }
                    }
                `;
                document.head.appendChild(s);
            }

            init() {
                this.injectStyles();
                this.c.innerHTML = '';
                this.c.classList.add('goose-container'); // Add class
                this.c.style.cssText = ''; // Clear inline

                // Title
                const title = document.createElement('h2');
                title.textContent = '🦆 La Oca Dino';
                title.style.cssText = 'color:#2c3e50; font-size:3em; margin-bottom:30px; text-align:center;';
                this.c.appendChild(title);

                const btnContainer = document.createElement('div');
                btnContainer.style.cssText = 'display:flex; gap:20px; flex-wrap:wrap; justify-content:center;';

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

                const btn3 = document.createElement('button');
                btn3.className = 'mode-btn kid';
                btn3.style.background = '#9b59b6';
                btn3.innerHTML = '🎲 Híbrido<br><span style="font-size:0.6em">Dado Real</span>';
                btn3.onclick = () => this.startGame('hybrid');

                const btn4 = document.createElement('button');
                btn4.className = 'mode-btn kid';
                btn4.style.background = '#8e44ad';
                btn4.innerHTML = '🎲 Híbrido 4<br><span style="font-size:0.6em">4P Real</span>';
                btn4.onclick = () => this.startGame('hybrid4');

                btnContainer.appendChild(btn1);
                btnContainer.appendChild(btn2);
                btnContainer.appendChild(btn3);
                btnContainer.appendChild(btn4);

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
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);
            }

            resumeGame() {
                if (this.savedState) {
                    this.gameMode = this.savedState.gameMode || 'pve';
                    this.pieces = this.savedState.pieces || [1, 1];
                    this.turn = this.savedState.turn || 0;
                    this.skip = this.savedState.skip || [0, 0, 0, 0]; // Accommodate 4
                    this.startGame(this.gameMode, true);
                }
            }

            save() {
                const state = {
                    gameMode: this.gameMode,
                    pieces: this.pieces,
                    turn: this.turn,
                    skip: this.skip
                };
                window.app.saveGame('goose', state);
            }

            startGame(mode, isRestore = false) {
                this.gameMode = mode;

                // Initialize Pieces
                if (!isRestore) {
                    if (this.gameMode === 'hybrid4') {
                        this.pieces = [1, 1, 1, 1];
                        this.skip = [0, 0, 0, 0];
                    } else {
                        this.pieces = [1, 1];
                        this.skip = [0, 0];
                    }
                }

                this.c.innerHTML = '';
                this.waitingRoll = true;

                // 1. Cabecera
                const h = document.createElement('div');
                h.className = 'goose-header';
                // h.style.cssText = ''; // Removed inline styles in favor of class

                this.statusEl = document.createElement('h3');
                this.statusEl.innerText = (mode === 'hybrid' || mode === 'hybrid4') ? 'Tira tu dado' : '¡Tira el dado!';
                this.statusEl.style.fontSize = '1.1em';
                this.statusEl.style.margin = '0';

                if (isRestore && this.turn !== 0 && this.gameMode === 'pve') {
                    // If resuming and it was AI turn?
                    // Let's just reset to waiting for roll to avoid instant AI move confusion or just set text
                    this.statusEl.innerText = `Turno ${this.turn === 0 ? 'Dino 🦕' : 'Oca 🦆'}`;
                } else if (isRestore) {
                    this.statusEl.innerText = `Turno ${this.turn === 0 ? 'Dino 🦕' : ((this.gameMode === 'pve') ? 'Oca 🦆' : 'J2 🦖')}`;
                }

                this.diceEl = document.createElement('div');
                this.diceEl.innerText = '🎲';
                this.diceEl.style.fontSize = '2.5em';
                this.diceEl.style.cursor = 'pointer';
                this.diceEl.onclick = () => this.rollDice();

                // Left Control Group
                const leftDiv = document.createElement('div');
                leftDiv.style.display = 'flex';
                leftDiv.style.alignItems = 'center';
                leftDiv.style.gap = '5px';

                // Back Button (New)
                const backBtn = document.createElement('button');
                backBtn.innerText = '🔙';
                backBtn.style.cssText = 'background:none; border:none; font-size:2em; cursor:pointer;';
                backBtn.onclick = () => {
                    if (confirm('¿Salir al menú de la Oca?')) {
                        this.cleanup();
                        this.init();
                    }
                };

                // Save Button
                const saveBtn = document.createElement('button');
                saveBtn.innerText = '💾';
                saveBtn.style.cssText = 'background:none; border:none; font-size:2em; cursor:pointer;';
                saveBtn.onclick = () => this.save();

                leftDiv.append(backBtn, saveBtn);

                // Wrap status and dice
                const rightDiv = document.createElement('div');
                rightDiv.style.display = 'flex';
                rightDiv.style.alignItems = 'center';
                rightDiv.style.gap = '10px';
                rightDiv.append(this.statusEl, this.diceEl);

                h.append(leftDiv, rightDiv);
                this.c.append(h);

                // Manual Input (Hidden)
                this.diceInput = document.createElement('div');
                this.diceInput.style.cssText = `
                    display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 20px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3); flex-direction: column; align-items: center; gap: 10px; z-index: 100;
                `;
                const inputLabel = document.createElement('h3');
                inputLabel.textContent = '¿Qué número salió?';
                this.diceInput.appendChild(inputLabel);
                const btnsDiv = document.createElement('div');
                btnsDiv.style.display = 'flex'; btnsDiv.style.gap = '10px';
                for (let i = 1; i <= 6; i++) {
                    const b = document.createElement('button');
                    b.textContent = i;
                    b.style.cssText = 'width:50px; height:50px; font-size:1.5em; border:none; border-radius:50%; background:#3498db; color:white; cursor:pointer;';
                    b.onclick = () => { this.diceInput.style.display = 'none'; this.processRoll(i); };
                    btnsDiv.appendChild(b);
                }
                this.diceInput.appendChild(btnsDiv);
                this.c.appendChild(this.diceInput);

                // 2. Tablero
                this.boardEl = document.createElement('div');
                this.boardEl.className = 'goose-board';
                this.c.append(this.boardEl);

                // 3. Render
                this.renderSpiral();
                this.createTokens();
                this.updatePositions();

                // 4. Robustez
                if (window.ResizeObserver) {
                    this.ro = new ResizeObserver(() => {
                        if (!this.ticking) {
                            window.requestAnimationFrame(() => {
                                this.updatePositions();
                                this.ticking = false;
                            });
                            this.ticking = true;
                        }
                    });
                    this.ro.observe(this.boardEl);
                } else {
                    this.wait(() => this.updatePositions(), 500);
                }
            }

            renderSpiral() {
                const matrix = Array(8).fill().map(() => Array(8).fill(0));
                let x = 0, y = 0, dx = 1, dy = 0;

                for (let i = 1; i <= 64; i++) {
                    matrix[y][x] = i;
                    let nx = x + dx, ny = y + dy;
                    if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8 || matrix[ny][nx] !== 0) {
                        [dx, dy] = [-dy, dx];
                    }
                    x += dx; y += dy;
                }

                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        let val = matrix[r][c];
                        if (val > 63) continue;

                        let cell = document.createElement('div');
                        cell.dataset.index = val;
                        cell.style.cssText = `
                            grid-row: ${r + 1}; grid-column: ${c + 1};
                            background:#ecf0f1; border-radius:2px; position:relative;
                            display:flex; justify-content:center; align-items:center;
                            font-size:1em; color:#7f8c8d; font-weight:bold;
                            flex-direction:column;
                        `;
                        cell.innerHTML = `<span>${val}</span>`;

                        // Iconos Grandes
                        if (this.DINOS.includes(val)) { cell.style.background = '#f1c40f'; cell.innerHTML += '<div style="font-size:1.8em">🦕</div>'; }
                        else if (this.SPECIALS[val]) { cell.style.background = '#e74c3c'; cell.style.color = 'white'; cell.innerHTML += '<div style="font-size:1.8em">⚠️</div>'; }
                        else if (val === 63) { cell.style.background = '#2ecc71'; cell.innerHTML = '<div style="font-size:2em">🥚</div>'; }

                        this.boardEl.append(cell);
                    }
                }
            }

            createTokens() {
                this.tokens = [];
                const icons = ['🦕', (this.gameMode === 'pve' ? '🦆' : '🦖'), '🐔', '🦄'];

                this.pieces.forEach((_, i) => {
                    let t = document.createElement('div');
                    t.innerText = icons[i] || '👤';
                    t.style.cssText = 'position:absolute; font-size:2.2em; transition:all 0.5s; z-index:20; pointer-events:none; filter: drop-shadow(0 0 2px white);';
                    this.boardEl.append(t);
                    this.tokens.push(t);
                });
            }

            updatePositions() {
                this.tokens.forEach((token, idx) => {
                    let pos = this.pieces[idx];
                    let cell = this.boardEl.querySelector(`div[data-index='${pos}']`);
                    if (!cell) cell = this.boardEl.querySelector(`div[data-index='1']`);

                    if (cell) {
                        let x = cell.offsetLeft + (cell.offsetWidth / 2) - (token.offsetWidth / 2 || 15);
                        let y = cell.offsetTop + (cell.offsetHeight / 2) - (token.offsetHeight / 2 || 15);

                        // Offset if occupying same square
                        if (this.pieces[0] === this.pieces[1]) {
                            if (idx === 0) { x -= 5; y -= 5; }
                            if (idx === 1) { x += 5; y += 5; }
                        }

                        token.style.left = x + 'px';
                        token.style.top = y + 'px';
                    }
                });
            }

            rollDice() {
                if (!this.waitingRoll) return;

                // PVE Mode Logic: P1 rolls, P2 is Auto
                if (this.gameMode === 'pve' && this.turn === 1) return;

                // Skip Turn Logic
                if (this.skip[this.turn] > 0) {
                    this.skip[this.turn]--;
                    this.statusEl.innerText = 'Turno perdido 🚫';
                    window.app.audio.speak('Turno perdido');
                    this.wait(() => this.nextTurn(), 1500);
                    return;
                }

                // Hybrid Mode
                if (this.gameMode === 'hybrid' || this.gameMode === 'hybrid4') {
                    this.diceInput.style.display = 'flex';
                    return;
                }

                // Standard Roll
                this.waitingRoll = false;
                let val = Math.floor(Math.random() * 6) + 1;
                this.processRoll(val);
            }

            processRoll(val) {
                this.diceEl.innerText = '🎲 ' + val;
                window.app.audio.speak(val.toString());
                this.wait(() => this.move(val), 600);
            }

            move(steps) {
                let current = this.pieces[this.turn];
                let target = current + steps;

                if (target > 63) target = 63 - (target - 63);

                this.pieces[this.turn] = target;
                this.updatePositions();
                window.app.audio.playPop();

                this.wait(() => this.checkRules(target), 600);
            }

            checkRules(pos) {
                if (pos === 63) {
                    this.statusEl.innerText = (this.turn === 0) ? '¡GANASTE! 🎉' : (this.gameMode === 'pve' ? '¡La Oca Gana! 🦆' : '¡J2 Gana! 🎉');
                    window.app.audio.speak(this.turn === 0 ? 'Ganaste' : 'Oca gana');
                    window.app.audio.playWin();

                    // REPLAY BUTTON OVERLAY
                    this.wait(() => {
                        const ov = document.createElement('div');
                        ov.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:10px;';
                        ov.innerHTML = `
                            <div style="font-size:5em;">${this.turn === 0 ? '🏆' : '🦆'}</div>
                            <h2 style="color:white; margin:20px;">${this.statusEl.innerText}</h2>
                            <button class="mode-btn kid" style="background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                            <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Salir</button>
                        `;
                        this.c.appendChild(ov);
                    }, 1000);
                    return;
                }

                if (this.DINOS.includes(pos)) {
                    this.statusEl.innerText = '¡De Dino a Dino! 🦕';
                    window.app.audio.speak('De dino a dino');

                    let idx = this.DINOS.indexOf(pos);
                    let next = this.DINOS[idx + 1] || 63;

                    this.pieces[this.turn] = next;
                    this.updatePositions();

                    // If AI (PVE Turn 1), Auto Roll again
                    if (this.gameMode === 'pve' && this.turn === 1) {
                        this.wait(() => {
                            let val = Math.floor(Math.random() * 6) + 1;
                            this.diceEl.innerText = '🎲 ' + val;
                            window.app.audio.speak('Oca saca ' + val);
                            this.processRoll(val);
                        }, 1000);
                    } else {
                        // Human or PVP: Wait for click
                        this.waitingRoll = true;
                    }
                    return;
                }

                if (this.SPECIALS[pos]) {
                    let r = this.SPECIALS[pos];
                    this.statusEl.innerText = r.msg;
                    window.app.audio.speak(r.msg);

                    if (r.t) {
                        this.pieces[this.turn] = r.t;
                        this.updatePositions();
                    }
                    if (r.skip) this.skip[this.turn] = r.skip;
                }

                this.nextTurn();
            }

            nextTurn() {
                const maxP = this.pieces.length;
                this.turn = (this.turn + 1) % maxP;
                this.waitingRoll = true;
                this.diceEl.innerText = '🎲';

                let pName;
                if (this.turn === 0) pName = 'Dino 🦕';
                else if (this.gameMode === 'pve') pName = 'Oca 🦆';
                else if (this.turn === 1) pName = 'J2 🦖';
                else if (this.turn === 2) pName = 'J3 🐔';
                else pName = 'J4 🦄';

                this.statusEl.innerText = `Turno ${pName}`;

                if (this.gameMode === 'pve' && this.turn === 1) {
                    this.wait(() => {
                        let val = Math.floor(Math.random() * 6) + 1;
                        this.diceEl.innerText = '🎲 ' + val;
                        window.app.audio.speak('Oca saca ' + val);
                        this.processRoll(val);
                    }, 1000);
                } else {
                    // PVP or Hybrid
                    if (this.gameMode !== 'pve') window.app.audio.playPop();
                }
            }

            cleanup() {
                if (this.ro) this.ro.disconnect();
                this.timeouts.forEach(clearTimeout);
                this.timeouts = [];
                this.c.classList.remove('goose-container');
            }
        }
