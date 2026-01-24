        /**
         * 🦖 GOOSE GAME FIXED (v17.4 Layout Fix)
         * - Visuals: 8x8 Spiral
         * - Tokens: User(🦕), AI(🦆)
         * - Fix: Robust Positioning (ResizeObserver + DOM checks)
         */
        class GooseGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.app = window.app;
                this.pieces = [1, 1]; // P1 (User), P2 (AI)
                this.turn = 0; // 0 = User, 1 = AI
                this.waitingRoll = true;
                this.skip = [0, 0];

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

            init() {
                this.c.innerHTML = '';
                this.c.style.cssText = 'display:flex; flex-direction:column; align-items:center; background:#ecf0f1; height:100%; justify-content:center; overflow:hidden;';

                // 1. Cabecera
                const h = document.createElement('div');
                h.style.cssText = 'width:95%; max-width:500px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:white; padding:10px; border-radius:15px; box-shadow:0 2px 5px rgba(0,0,0,0.1); flex-shrink:0;';

                this.statusEl = document.createElement('h3');
                this.statusEl.innerText = '¡Tira el dado!';
                this.statusEl.style.fontSize = '1.1em';
                this.statusEl.style.margin = '0';

                this.diceEl = document.createElement('div');
                this.diceEl.innerText = '🎲';
                this.diceEl.style.fontSize = '2.5em';
                this.diceEl.onclick = () => this.rollDice();

                h.append(this.statusEl, this.diceEl);
                this.c.append(h);

                // 2. Tablero
                this.boardEl = document.createElement('div');
                this.boardEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    grid-template-rows: repeat(8, 1fr);
                    gap: 2px;
                    width: 95vmin; height: 95vmin;
                    max-width: 500px; max-height: 500px;
                    background: #2c3e50; border: 4px solid #34495e;
                    border-radius: 10px; position: relative;
                    padding: 2px;
                `;
                this.c.append(this.boardEl);

                // 3. Render
                this.renderSpiral();
                this.createTokens();
                this.updatePositions();

                // 4. Robustez: ResizeObserver para recalcular posiciones si cambia el layout (ej. al abrirse la vista)
                if (window.ResizeObserver) {
                    const ro = new ResizeObserver(() => this.updatePositions());
                    ro.observe(this.boardEl);
                } else {
                    // Fallback
                    setTimeout(() => this.updatePositions(), 500);
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

                for(let r=0; r<8; r++){
                    for(let c=0; c<8; c++){
                        let val = matrix[r][c];
                        if(val > 63) continue;

                        let cell = document.createElement('div');
                        cell.dataset.index = val;
                        cell.style.cssText = `
                            grid-row: ${r+1}; grid-column: ${c+1};
                            background:#ecf0f1; border-radius:2px; position:relative;
                            display:flex; justify-content:center; align-items:center;
                            font-size:1em; color:#7f8c8d; font-weight:bold;
                            flex-direction:column;
                        `;
                        cell.innerHTML = `<span>${val}</span>`;

                        // Iconos Grandes
                        if(this.DINOS.includes(val)) { cell.style.background='#f1c40f'; cell.innerHTML += '<div style="font-size:1.8em">🦕</div>'; }
                        else if(this.SPECIALS[val]) { cell.style.background='#e74c3c'; cell.style.color='white'; cell.innerHTML += '<div style="font-size:1.8em">⚠️</div>'; }
                        else if(val===63) { cell.style.background='#2ecc71'; cell.innerHTML = '<div style="font-size:2em">🥚</div>'; }

                        this.boardEl.append(cell);
                    }
                }
            }

            createTokens() {
                this.tokens = [];
                // User: Dino Pequeño (🦕)
                let t1 = document.createElement('div');
                t1.innerText = '🦕';
                t1.style.cssText = 'position:absolute; font-size:2.2em; transition:all 0.5s; z-index:20; pointer-events:none; filter: drop-shadow(0 0 2px white);';
                this.boardEl.append(t1);
                this.tokens.push(t1);

                // AI: Oca (🦆)
                let t2 = document.createElement('div');
                t2.innerText = '🦆';
                t2.style.cssText = 'position:absolute; font-size:2.2em; transition:all 0.5s; z-index:20; pointer-events:none; filter: drop-shadow(0 0 2px white);';
                this.boardEl.append(t2);
                this.tokens.push(t2);
            }

            updatePositions() {
                this.tokens.forEach((token, idx) => {
                    let pos = this.pieces[idx];
                    let cell = this.boardEl.querySelector(`div[data-index='${pos}']`);
                    // Si no encuentra la celda (ej. inicio 0?), usa la 1
                    if (!cell) cell = this.boardEl.querySelector(`div[data-index='1']`);

                    if(cell) {
                        let x = cell.offsetLeft + (cell.offsetWidth / 2) - (token.offsetWidth / 2 || 15);
                        let y = cell.offsetTop + (cell.offsetHeight / 2) - (token.offsetHeight / 2 || 15);

                        // Desplazamiento si coinciden
                        if (this.pieces[0] === this.pieces[1] && idx === 1) {
                            x += 8; y += 8;
                        }

                        token.style.left = x + 'px';
                        token.style.top = y + 'px';
                    }
                });
            }

            rollDice() {
                if (!this.waitingRoll) return;

                if (this.skip[this.turn] > 0) {
                    this.skip[this.turn]--;
                    this.statusEl.innerText = "Turno perdido 🚫";
                    this.app.audio.speak("Turno perdido");
                    setTimeout(() => this.nextTurn(), 1500);
                    return;
                }

                this.waitingRoll = false;
                let val = Math.floor(Math.random()*6)+1;
                this.diceEl.innerText = '🎲 ' + val;
                this.app.audio.speak(val.toString());

                setTimeout(() => this.move(val), 600);
            }

            move(steps) {
                let current = this.pieces[this.turn];
                let target = current + steps;

                if(target > 63) target = 63 - (target - 63);

                this.pieces[this.turn] = target;
                this.updatePositions();
                this.app.audio.playPop();

                setTimeout(() => this.checkRules(target), 600);
            }

            checkRules(pos) {
                if(pos === 63) {
                    this.statusEl.innerText = this.turn === 0 ? "¡GANASTE! 🎉" : "¡Dino Gana! 🦆";
                    this.app.audio.speak(this.turn === 0 ? "Ganaste" : "La Oca gana");
                    this.app.audio.playWin();
                    return;
                }

                if(this.DINOS.includes(pos)) {
                    this.statusEl.innerText = "¡De Dino a Dino! 🦕";
                    this.app.audio.speak("De dino a dino");

                    let idx = this.DINOS.indexOf(pos);
                    let next = this.DINOS[idx+1] || 63;

                    this.pieces[this.turn] = next;
                    this.updatePositions();
                    this.waitingRoll = true;
                    return;
                }

                if(this.SPECIALS[pos]) {
                    let r = this.SPECIALS[pos];
                    this.statusEl.innerText = r.msg;
                    this.app.audio.speak(r.msg);

                    if(r.t) {
                        this.pieces[this.turn] = r.t;
                        this.updatePositions();
                    }
                    if(r.skip) this.skip[this.turn] = r.skip;
                }

                this.nextTurn();
            }

            nextTurn() {
                this.turn = this.turn === 0 ? 1 : 0;
                this.waitingRoll = true;
                this.diceEl.innerText = '🎲';
                this.statusEl.innerText = this.turn===0 ? "Turno Jugador 🦕" : "Turno Oca 🦆";

                if(this.turn === 1) {
                    setTimeout(() => {
                        let val = Math.floor(Math.random()*6)+1;
                        this.diceEl.innerText = '🎲 ' + val;
                        this.app.audio.speak("Oca saca " + val);
                        this.move(val);
                    }, 1000);
                }
            }
        }