        /**
         * 🤖 ROBOTICS GAME (Coding Logic)
         */
        class RoboticsGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.level = 0;
                this.program = [];
                this.running = false;
                this.speed = 500; // ms per step

                // 0=Empty, 1=Path, 2=Start, 3=Goal, 4=Obstacle
                this.levels = [
                    {
                        grid: [
                            [0,0,0,0,0],
                            [0,2,1,3,0],
                            [0,0,0,0,0],
                            [0,0,0,0,0],
                            [0,0,0,0,0]
                        ],
                        startDir: 1 // 0=N, 1=E, 2=S, 3=W
                    },
                    {
                        grid: [
                            [0,0,0,0,0],
                            [0,2,1,0,0],
                            [0,0,1,0,0],
                            [0,0,3,0,0],
                            [0,0,0,0,0]
                        ],
                        startDir: 1
                    },
                    {
                        grid: [
                            [0,0,3,0,0],
                            [0,0,1,0,0],
                            [0,1,1,0,0],
                            [0,2,0,0,0],
                            [0,0,0,0,0]
                        ],
                        startDir: 1
                    }
                ];

                this.robot = { x: 0, y: 0, dir: 1 };
                this.init();
            }

            init() {
                this.currentLevelData = this.levels[this.level];
                this.resetRobot();
                this.program = [];
                this.render();
            }

            resetRobot() {
                const grid = this.currentLevelData.grid;
                for(let r=0; r<grid.length; r++) {
                    for(let c=0; c<grid[0].length; c++) {
                        if(grid[r][c] === 2) {
                            this.robot.x = c;
                            this.robot.y = r;
                        }
                    }
                }
                this.robot.dir = this.currentLevelData.startDir;
            }

            render() {
                this.c.innerHTML = '';
                this.c.style.background = '#2c3e50';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'flex-start';
                this.c.style.padding = '10px';

                // Header
                const h = document.createElement('h2');
                h.innerHTML = `🤖 Nivel ${this.level + 1}`;
                h.style.color = '#00d2d3';
                this.c.appendChild(h);

                // Grid Container
                const gridEl = document.createElement('div');
                gridEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 2px;
                    width: 90vmin; max-width: 400px;
                    aspect-ratio: 1/1;
                    background: #34495e;
                    border: 4px solid #00d2d3;
                    border-radius: 10px;
                    margin-bottom: 20px;
                `;

                const grid = this.currentLevelData.grid;
                for(let r=0; r<grid.length; r++) {
                    for(let c=0; c<grid[0].length; c++) {
                        const cell = document.createElement('div');
                        cell.style.cssText = `
                            background: ${grid[r][c] === 0 ? '#34495e' : '#576574'};
                            display: flex; align-items: center; justify-content: center;
                            font-size: 2em; border-radius: 4px;
                        `;

                        if(grid[r][c] === 3) cell.innerHTML = '🔋'; // Goal

                        // Robot
                        if(this.robot.x === c && this.robot.y === r) {
                            cell.innerHTML = '🤖';
                            const rot = this.robot.dir * 90;
                            cell.firstChild.style.transform = `rotate(${rot}deg)`;
                            cell.firstChild.style.display = 'block';
                        }

                        gridEl.appendChild(cell);
                    }
                }
                this.c.appendChild(gridEl);

                // Queue Display
                const queueEl = document.createElement('div');
                queueEl.style.cssText = `
                    width: 95%; min-height: 50px; background: #222;
                    border-radius: 5px; padding: 5px; display: flex; gap: 5px;
                    overflow-x: auto; margin-bottom: 10px; color: white; align-items: center;
                `;
                if(this.program.length === 0) queueEl.innerHTML = '<span style="color:#666">...</span>';
                this.program.forEach((cmd, i) => {
                    const icon = this.getIcon(cmd);
                    const sp = document.createElement('span');
                    sp.textContent = icon;
                    sp.style.cssText = 'background:#555; padding:5px; border-radius:3px;';
                    queueEl.appendChild(sp);
                });
                this.c.appendChild(queueEl);

                // Controls
                const controls = document.createElement('div');
                controls.style.cssText = `display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 95%; max-width: 400px;`;

                this.createBtn(controls, '⬆️', '#2ecc71', () => this.addCmd('F'));
                this.createBtn(controls, '↺', '#f1c40f', () => this.addCmd('L'));
                this.createBtn(controls, '↻', '#f1c40f', () => this.addCmd('R'));
                this.createBtn(controls, '❌', '#e74c3c', () => { this.program = []; this.render(); }); // Clear

                this.c.appendChild(controls);

                // Run Button
                const runBtn = document.createElement('button');
                runBtn.textContent = this.running ? '🏃 Ejecutando...' : '▶️ EJECUTAR';
                runBtn.className = 'mode-btn kid';
                runBtn.style.cssText = `margin-top: 15px; background: ${this.running ? '#7f8c8d' : '#00d2d3'}; width: 95%; max-width: 400px;`;
                runBtn.onclick = () => this.runProgram();
                this.c.appendChild(runBtn);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.style.cssText = 'background:none; border:none; color:white; margin-top:10px; font-size:1.2em;';
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);
            }

            createBtn(parent, text, color, fn) {
                const b = document.createElement('button');
                b.textContent = text;
                b.style.cssText = `
                    background: ${color}; border: none; border-radius: 10px;
                    font-size: 2em; padding: 10px; cursor: pointer; color: white;
                    box-shadow: 0 4px 0 rgba(0,0,0,0.3);
                `;
                b.onclick = () => { if(!this.running) fn(); };
                parent.appendChild(b);
            }

            getIcon(cmd) {
                if(cmd === 'F') return '⬆️';
                if(cmd === 'L') return '↺';
                if(cmd === 'R') return '↻';
                return '?';
            }

            addCmd(cmd) {
                if(this.program.length < 10) {
                    this.program.push(cmd);
                    this.render();
                }
            }

            async runProgram() {
                if(this.running || this.program.length === 0) return;
                this.running = true;
                this.resetRobot();
                this.render();

                for(let i=0; i<this.program.length; i++) {
                    await new Promise(r => setTimeout(r, this.speed));
                    const cmd = this.program[i];

                    if(cmd === 'F') {
                        let nx = this.robot.x;
                        let ny = this.robot.y;
                        if(this.robot.dir === 0) ny--;
                        if(this.robot.dir === 1) nx++;
                        if(this.robot.dir === 2) ny++;
                        if(this.robot.dir === 3) nx--;

                        if(this.isValid(nx, ny)) {
                            this.robot.x = nx;
                            this.robot.y = ny;
                        } else {
                            window.app.audio.playError();
                        }
                    }
                    else if(cmd === 'L') {
                        this.robot.dir = (this.robot.dir - 1 + 4) % 4;
                    }
                    else if(cmd === 'R') {
                        this.robot.dir = (this.robot.dir + 1) % 4;
                    }

                    this.render();
                    window.app.audio.playPop();
                }

                const grid = this.currentLevelData.grid;
                if(grid[this.robot.y][this.robot.x] === 3) {
                    window.app.audio.playWin();
                    setTimeout(() => {
                        this.level++;
                        if(this.level >= this.levels.length) {
                            this.winGame();
                        } else {
                            this.init();
                        }
                    }, 1000);
                } else {
                    window.app.audio.playError();
                }

                this.running = false;
                this.render();
            }

            isValid(x, y) {
                const grid = this.currentLevelData.grid;
                if(y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
                if(grid[y][x] === 0) return false;
                return true;
            }

            winGame() {
                this.c.innerHTML = `
                    <div style="text-align: center; color: white;">
                        <div style="font-size: 6em;">🤖🏆</div>
                        <h1>¡Programación Completada!</h1>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="app.startGame(app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <br>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="app.nav.goDashboard()">🏠 Salir</button>
                    </div>
                `;
                window.app.updateParentStats(30, 1, 'robotics');
            }

            cleanup() { this.running = false; }
        }
