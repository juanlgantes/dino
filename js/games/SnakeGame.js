export class SnakeGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.score = 0;
                this.level = 1;
                this.running = false;
                this.speed = 300;
                this.gridSize = 20; // 20x20 grid
                this.snake = [];
                this.food = null;
                this.dir = { x: 1, y: 0 }; // Right
                this.nextDir = { x: 1, y: 0 };

                this.init();
            }

            init() {
                this.c.innerHTML = '';
                this.c.style.background = '#2d3436';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';

                const h = document.createElement('h2');
                h.textContent = '🐍 Serpiente Dino';
                h.style.color = '#55efc4';
                h.style.fontSize = '3em';
                h.style.marginBottom = '20px';
                this.c.appendChild(h);

                const btn = document.createElement('button');
                btn.className = 'mode-btn kid';
                btn.style.background = '#00b894';
                btn.textContent = '▶️ Jugar';
                btn.onclick = () => this.startGame();
                this.c.appendChild(btn);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.marginTop = '20px';
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);
            }

            startGame() {
                this.c.innerHTML = '';
                this.score = 0;
                this.level = 1;
                this.speed = 300;
                this.running = true;
                this.dir = { x: 1, y: 0 };
                this.nextDir = { x: 1, y: 0 };

                // Snake start center
                this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

                // Score UI
                this.scoreEl = document.createElement('div');
                this.scoreEl.style.cssText = 'color:white; font-size:1.5em; margin-bottom:10px; width:100%; text-align:center;';
                this.scoreEl.textContent = `Puntos: 0 | Nivel: 1`;
                this.c.appendChild(this.scoreEl);

                // Board
                this.boardEl = document.createElement('div');
                this.boardEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(${this.gridSize}, 1fr);
                    grid-template-rows: repeat(${this.gridSize}, 1fr);
                    gap: 1px;
                    width: 90vmin; max-width: 500px; aspect-ratio: 1/1;
                    background: #636e72; border: 5px solid #00b894;
                `;
                this.c.appendChild(this.boardEl);

                // Controls
                this.renderControls();

                // Listeners
                this.keyHandler = (e) => this.handleKey(e);
                window.addEventListener('keydown', this.keyHandler);

                this.spawnFood();
                this.render();
                this.loop();
            }

            renderControls() {
                const pad = document.createElement('div');
                pad.style.cssText = 'display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px;';

                const createBtn = (txt, dx, dy) => {
                    const b = document.createElement('button');
                    b.textContent = txt;
                    b.style.cssText = 'width:60px; height:60px; font-size:2em; background:rgba(255,255,255,0.2); border:none; border-radius:10px; color:white;';
                    b.onclick = () => this.setDir(dx, dy);
                    return b;
                };

                pad.appendChild(document.createElement('div')); // Empty
                pad.appendChild(createBtn('⬆️', 0, -1));
                pad.appendChild(document.createElement('div')); // Empty

                pad.appendChild(createBtn('⬅️', -1, 0));
                pad.appendChild(createBtn('⬇️', 0, 1));
                pad.appendChild(createBtn('➡️', 1, 0));

                this.c.appendChild(pad);

                // Exit overlay button
                const exit = document.createElement('button');
                exit.textContent = '🏠';
                exit.className = 'nav-btn';
                exit.style.cssText = 'position:absolute; top:10px; right:10px;';
                exit.onclick = () => {
                    this.running = false;
                    window.app.nav.goDashboard();
                };
                this.c.appendChild(exit);
            }

            handleKey(e) {
                if(!this.running) return;
                if(e.key === 'ArrowUp') this.setDir(0, -1);
                if(e.key === 'ArrowDown') this.setDir(0, 1);
                if(e.key === 'ArrowLeft') this.setDir(-1, 0);
                if(e.key === 'ArrowRight') this.setDir(1, 0);
            }

            setDir(dx, dy) {
                // Prevent reverse
                if(dx === -this.dir.x && dy === -this.dir.y) return;
                this.nextDir = { x: dx, y: dy };
            }

            spawnFood() {
                let valid = false;
                while(!valid) {
                    this.food = {
                        x: Math.floor(Math.random() * this.gridSize),
                        y: Math.floor(Math.random() * this.gridSize)
                    };
                    // Check collision with snake
                    valid = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
                }
            }

            loop() {
                if(!this.running) return;

                // Move
                this.dir = this.nextDir;
                const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

                // Collision Wall
                if(head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
                    this.gameOver();
                    return;
                }

                // Collision Self
                if(this.snake.some(s => s.x === head.x && s.y === head.y)) {
                    this.gameOver();
                    return;
                }

                this.snake.unshift(head);

                // Eat
                if(head.x === this.food.x && head.y === this.food.y) {
                    this.score += 10;
                    window.app.audio.playPop();
                    window.app.addScore(10, 'snake');

                    // Level Up logic
                    if(this.score % 50 === 0) {
                        this.level++;
                        this.speed = Math.max(100, this.speed - 30);
                        window.app.audio.playWin(); // Mini win
                    }

                    this.scoreEl.textContent = `Puntos: ${this.score} | Nivel: ${this.level}`;
                    this.spawnFood();
                } else {
                    this.snake.pop(); // Remove tail
                }

                this.render();

                setTimeout(() => this.loop(), this.speed);
            }

            render() {
                this.boardEl.innerHTML = '';

                // Render Snake
                this.snake.forEach((s, i) => {
                    const el = document.createElement('div');
                    el.style.cssText = `
                        grid-column: ${s.x + 1}; grid-row: ${s.y + 1};
                        background: ${i === 0 ? '#00b894' : '#55efc4'};
                        border-radius: ${i===0 ? '50%' : '2px'};
                        z-index: 1;
                    `;
                    // Head
                    if(i===0) {
                        el.textContent = '🐍';
                        el.style.display = 'flex'; el.style.alignItems='center'; el.style.justifyContent='center';
                        el.style.fontSize = '1.2em';
                    }
                    this.boardEl.appendChild(el);
                });

                // Render Food
                const f = document.createElement('div');
                f.style.cssText = `
                    grid-column: ${this.food.x + 1}; grid-row: ${this.food.y + 1};
                    font-size: 1.5em; display:flex; align-items:center; justify-content:center;
                `;
                f.textContent = '🍎';
                this.boardEl.appendChild(f);
            }

            gameOver() {
                this.running = false;
                window.app.audio.playError();
                window.app.updateParentStats(this.score, 1, 'snake');

                this.c.innerHTML = `
                    <div style="text-align: center; color: white;">
                        <div style="font-size: 6em;">💥</div>
                        <h1>¡Choque!</h1>
                        <p style="font-size: 1.5em;">Puntos: ${this.score}</p>
                        <button class="mode-btn kid" style="margin-top:20px; background:#00b894;" onclick="window.app.gameInstance.startGame()">🔄 Reintentar</button>
                        <br>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Salir</button>
                    </div>
                `;
            }

            cleanup() {
                this.running = false;
                window.removeEventListener('keydown', this.keyHandler);
            }
        }
