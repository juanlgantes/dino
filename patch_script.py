import re

with open("indexdino.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. HEADER
if "v17.5" not in content:
    header_old = """<title>v17.0 "Dino Oca"</title>
    <!--
        CHANGELOG v17.0"""
    header_new = """<title>v17.5 "Dino Oca Remaster"</title>
    <!--
        CHANGELOG v17.5
        - [FIX] Oca: Tablero 8x8 corregido, tokens visuales (Dino/Oca) y movimiento suave.
        - [FEATURE] Oca: Botón "Jugar Otra Vez" añadido al finalizar.
        - [FEATURE] Unir Puntos: Añadidos 3 nuevos animales (Gato, Perro, Pato).
        - [SYS] AudioEngine: Soporte para síntesis de voz (Speak).

        CHANGELOG v17.0"""
    content = content.replace(header_old, header_new)

# 2. AUDIO ENGINE
audio_search = """            playWin() {
                this.playTone(500, 'sine', 0.2);
                setTimeout(() => this.playTone(800, 'sine', 0.4), 200);
            }
        }"""
audio_replace = """            playWin() {
                this.playTone(500, 'sine', 0.2);
                setTimeout(() => this.playTone(800, 'sine', 0.4), 200);
            }

            speak(text) {
                if (this.muted) return;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "es-ES";
                utterance.rate = 1.2;
                window.speechSynthesis.speak(utterance);
            }
        }"""
content = content.replace(audio_search, audio_replace)

# 3. CONNECT DOTS
dots_pattern = r"class ConnectDotsGame \{[\s\S]*?cleanup\(\) \{[\s\S]*?\}\s+?\}"
dots_new = """class ConnectDotsGame {
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
                            { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.3 }, { x: 0.6, y: 0.3 }, { x: 0.8, y: 0.5 },
                            { x: 0.9, y: 0.3 }, { x: 0.9, y: 0.7 }, { x: 0.8, y: 0.5 }, { x: 0.6, y: 0.7 },
                            { x: 0.4, y: 0.7 }, { x: 0.2, y: 0.5 }
                        ]
                    },
                    {
                        name: "MARIPOSA 🦋",
                        points: [
                            { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.2 }, { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.8 },
                            { x: 0.5, y: 0.6 }, { x: 0.7, y: 0.8 }, { x: 0.8, y: 0.5 }, { x: 0.7, y: 0.2 },
                            { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.2 }
                        ]
                    },
                    {
                        name: "GATO 🐱",
                        points: [
                            { x: 0.2, y: 0.6 }, { x: 0.2, y: 0.3 }, { x: 0.3, y: 0.2 }, { x: 0.4, y: 0.3 },
                            { x: 0.6, y: 0.3 }, { x: 0.7, y: 0.2 }, { x: 0.8, y: 0.3 }, { x: 0.8, y: 0.6 },
                            { x: 0.7, y: 0.8 }, { x: 0.3, y: 0.8 }
                        ]
                    },
                    {
                        name: "PERRO 🐶",
                        points: [
                            { x: 0.3, y: 0.4 }, { x: 0.2, y: 0.6 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 },
                            { x: 0.8, y: 0.6 }, { x: 0.7, y: 0.4 }, { x: 0.8, y: 0.2 }, { x: 0.6, y: 0.2 },
                            { x: 0.5, y: 0.3 }, { x: 0.2, y: 0.2 }
                        ]
                    },
                    {
                        name: "PATO 🦆",
                        points: [
                            { x: 0.3, y: 0.3 }, { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.3 }, { x: 0.8, y: 0.5 },
                            { x: 0.7, y: 0.7 }, { x: 0.5, y: 0.8 }, { x: 0.3, y: 0.7 }, { x: 0.2, y: 0.5 },
                            { x: 0.1, y: 0.4 }, { x: 0.4, y: 0.4 }
                        ]
                    }
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

                const title = document.createElement("h2");
                title.id = "dotsTitle";
                title.style.color = "#2980b9";
                title.textContent = `Nivel ${this.level + 1}`;
                this.c.appendChild(title);

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
                exit.onclick = () => app.nav.goDashboard();
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
                this.canvas.addEventListener("touchstart", this.handleInput, { passive: false });

                this.loadLevel(this.level);
            }

            loadLevel(idx) {
                if (idx >= this.levels.length) {
                    this.winGame();
                    return;
                }
                this.level = idx;
                this.dots = this.levels[idx].points.map(p => ({
                    x: p.x * this.canvas.width,
                    y: p.y * this.canvas.height
                }));
                this.currentDot = 1;
                this.documentTitle = document.getElementById("dotsTitle");
                this.documentTitle.textContent = `Nivel ${this.level + 1}: ${this.currentDot} ➡️ ${this.currentDot + 1}`;
                this.lines = [];
                this.draw();
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
                    this.ctx.fillStyle = isDone ? "#2ecc71" : (isNext ? "#e74c3c" : "#bdc3c7");
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
                    app.audio.playPop();
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
                app.audio.playWin();

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
                    <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="app.startGame(app.currentGameKey)">🔄 Jugar Otra Vez</button>
                    <div style="height:10px"></div>
                    <button class="mode-btn kid" onclick="app.nav.goDashboard()">🏠 Volver</button>
                `;
                this.c.appendChild(winDiv);

                app.audio.playWin();
                app.updateParentStats(50, 1, "connect_dots");
            }

            cleanup() {
                if (this.canvas && this.handleInput) {
                    this.canvas.removeEventListener("mousedown", this.handleInput);
                    this.canvas.removeEventListener("touchstart", this.handleInput);
                }
            }
        }"""
content = re.sub(dots_pattern, dots_new, content)

# 4. GOOSE GAME
goose_block_pattern = r"(class GooseGame \{[\s\S]+?)(?=class ChessGame)"
goose_new_code = """class GooseGame {
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

                // 4. Robustez
                if (window.ResizeObserver) {
                    const ro = new ResizeObserver(() => this.updatePositions());
                    ro.observe(this.boardEl);
                } else {
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
                        if(this.DINOS.includes(val)) { cell.style.background='#f1c40f'; cell.innerHTML += '<div style=\"font-size:1.8em\">🦕</div>'; }
                        else if(this.SPECIALS[val]) { cell.style.background='#e74c3c'; cell.style.color='white'; cell.innerHTML += '<div style=\"font-size:1.8em\">⚠️</div>'; }
                        else if(val===63) { cell.style.background='#2ecc71'; cell.innerHTML = '<div style=\"font-size:2em\">🥚</div>'; }

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
                    if (!cell) cell = this.boardEl.querySelector(`div[data-index='1']`);

                    if(cell) {
                        let x = cell.offsetLeft + (cell.offsetWidth / 2) - (token.offsetWidth / 2 || 15);
                        let y = cell.offsetTop + (cell.offsetHeight / 2) - (token.offsetHeight / 2 || 15);

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
                    this.statusEl.innerText = 'Turno perdido 🚫';
                    this.app.audio.speak('Turno perdido');
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
                    this.statusEl.innerText = this.turn === 0 ? '¡GANASTE! 🎉' : '¡Dino Gana! 🦆';
                    this.app.audio.speak(this.turn === 0 ? 'Ganaste' : 'La Oca gana');
                    this.app.audio.playWin();

                    // REPLAY BUTTON OVERLAY
                    setTimeout(() => {
                        const ov = document.createElement('div');
                        ov.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:100; border-radius:10px;';
                        ov.innerHTML = `
                            <div style="font-size:5em;">${this.turn===0 ? '🏆' : '🦆'}</div>
                            <h2 style="color:white; margin:20px;">${this.statusEl.innerText}</h2>
                            <button class="mode-btn kid" style="background:#2ecc71;" onclick="app.startGame(app.currentGameKey)">🔄 Jugar Otra Vez</button>
                            <button class="mode-btn kid" style="margin-top:10px;" onclick="app.nav.goDashboard()">🏠 Salir</button>
                        `;
                        this.c.appendChild(ov);
                    }, 1000);
                    return;
                }

                if(this.DINOS.includes(pos)) {
                    this.statusEl.innerText = '¡De Dino a Dino! 🦕';
                    this.app.audio.speak('De dino a dino');

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
                this.statusEl.innerText = this.turn===0 ? 'Turno Jugador 🦕' : 'Turno Oca 🦆';

                if(this.turn === 1) {
                    setTimeout(() => {
                        let val = Math.floor(Math.random()*6)+1;
                        this.diceEl.innerText = '🎲 ' + val;
                        this.app.audio.speak('Oca saca ' + val);
                        this.move(val);
                    }, 1000);
                }
            }

            cleanup() { }
        }
        """
content = re.sub(goose_block_pattern, goose_new_code + "\n        /**\n         * ♟️ CHESS GAME (Ajedrez Simplified)", content)

with open("indexdino_v17.5.html", "w", encoding="utf-8") as f:
    f.write(content)
