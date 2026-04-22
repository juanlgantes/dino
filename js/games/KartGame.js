export class KartGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.running = true;
                this.score = 0;
                this.lives = 3;

                // Track Progress (Time Based)
                this.timeLeft = 120; // 2 Minutes
                this.lastTime = Date.now();

                this.items = []; // Traffic cars

                this.width = this.c.offsetWidth;
                this.height = this.c.offsetHeight;
                this.playerX = 50; // Percentage

                this.init();
            }

            init() {
                this.c.style.background = '#333'; // Dark Asphalt
                this.c.style.overflow = 'hidden';
                this.c.style.position = 'relative';
                this.c.innerHTML = '';

                // Road Visuals
                // Grass sides
                this.createDiv('grass-l', `position:absolute; left:0; top:0; height:100%; width:15%; background:#4CAF50;`);
                this.createDiv('grass-r', `position:absolute; right:0; top:0; height:100%; width:15%; background:#4CAF50;`);

                // Animated Line
                const line = document.createElement('div');
                line.style.cssText = `
                    position: absolute; left: 50%; top: -100px; width: 10px; height: 200%;
                    background: repeating-linear-gradient(to bottom, white 0, white 50px, transparent 50px, transparent 100px);
                    transform: translateX(-50%); animation: roadScroll 1s linear infinite;
                `;
                // Inject keyframes if not exists
                if (!document.getElementById('roadAnim')) {
                    const s = document.createElement('style');
                    s.id = 'roadAnim';
                    s.innerHTML = `@keyframes roadScroll { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(50px); } }`;
                    document.head.appendChild(s);
                }
                this.c.appendChild(line);

                // Player Kart 🏎️
                this.playerEl = document.createElement('div');
                this.playerEl.style.cssText = `
                    position: absolute; bottom: 20%; left: 50%; font-size: 3.5em;
                    transform: translateX(-50%); z-index: 10; transition: left 0.1s linear;
                `;
                // Composite Kart - Adjusted Ratios
                // Kart Bigger (1em -> 1.5em), Dino Smaller (0.6em)
                this.playerEl.innerHTML = `
                    <div style="position:relative; display:flex; justify-content:center; align-items:center;">
                        <div style="z-index:2; position:absolute; bottom:15px; font-size: 0.5em;">🦖</div>
                        <div style="z-index:1; font-size: 1.5em;">🏎️</div>
                    </div>
                `;
                this.c.appendChild(this.playerEl);

                // UI
                this.uiEl = document.createElement('div');
                this.uiEl.style.cssText = `
                    position: absolute; top: 10px; left: 10px; color: white;
                    font-size: 1.5em; font-weight: bold; background: rgba(0,0,0,0.5);
                    padding: 5px 15px; border-radius: 15px; z-index: 20;
                `;

                // Optimized separate elements
                this.timeEl = document.createElement('span');
                this.livesEl = document.createElement('span');
                this.livesEl.style.marginLeft = '10px';

                this.uiEl.appendChild(document.createTextNode('⏱️ '));
                this.uiEl.appendChild(this.timeEl);
                this.uiEl.appendChild(document.createTextNode(' '));
                this.uiEl.appendChild(this.livesEl);
                this.c.appendChild(this.uiEl);

                // Cache for updateUI optimization
                this.lastTimeStr = '';
                this.lastLives = -1;

                this.bindControls();
                this.loop();
                this.spawnLoop();
            }

            createDiv(id, css) {
                const d = document.createElement('div');
                d.id = id;
                d.style.cssText = css;
                this.c.appendChild(d);
                return d;
            }

            bindControls() {
                this.inputHandler = (e) => {
                    if (!this.running) return;
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const rect = this.c.getBoundingClientRect();
                    let x = clientX - rect.left;

                    // Clamp to road area (15% to 85%)
                    const min = this.width * 0.15;
                    const max = this.width * 0.85;
                    x = Math.max(min, Math.min(max, x));

                    this.playerX = (x / this.width) * 100;
                    this.playerEl.style.left = this.playerX + '%';
                };
                window.addEventListener('mousemove', this.inputHandler);
                window.addEventListener('touchmove', this.inputHandler, { passive: false });
            }

            spawnLoop() {
                if (!this.running) return;

                // Spawn Traffic
                // Lanes: Approx 25%, 50%, 75%
                const lanes = [25, 45, 60, 75];
                const lane = lanes[Math.floor(Math.random() * lanes.length)];

                const car = document.createElement('div');
                car.textContent = Math.random() > 0.5 ? '🚙' : '🚛';
                car.className = 'traffic-car';
                car.style.cssText = `
                    position: absolute; top: -50px; left: ${lane}%; font-size: 3em;
                    transform: translateX(-50%); z-index: 5;
                `;
                this.c.appendChild(car);

                this.items.push({
                    el: car,
                    y: -50,
                    speed: Math.random() * 5 + 5, // Rel speed
                    active: true // FIX: Ensure it triggers in loop
                });

                // Spawn Rate based on distance? Harder at end?
                setTimeout(() => this.spawnLoop(), 1000);
            }

            loop() {
                if (!this.running) return;

                // Time Logic
                const now = Date.now();
                const dt = (now - this.lastTime) / 1000;
                this.lastTime = now;

                if (this.timeLeft > 0) {
                    this.timeLeft -= dt;
                    if (this.timeLeft < 0) this.timeLeft = 0;
                }

                this.updateUI();

                // Move Traffic
                this.items.forEach(item => {
                    // FIX: Proper logic check
                    if (!item.active) return;

                    item.y += item.speed;
                    item.el.style.top = item.y + 'px';

                    // Collision
                    const pRect = this.playerEl.getBoundingClientRect();
                    const iRect = item.el.getBoundingClientRect();
                    const pad = 20;

                    if (
                        pRect.left + pad < iRect.right - pad &&
                        pRect.right - pad > iRect.left + pad &&
                        pRect.top + pad < iRect.bottom - pad &&
                        pRect.bottom - pad > iRect.top + pad
                    ) {
                        this.crash(item);
                    }

                    if (item.y > this.height) {
                        item.el.remove();
                        item.removed = true;
                    }
                });

                this.items = this.items.filter(i => !i.removed);

                // Win?
                if (this.timeLeft <= 0) {
                    this.finishLine();
                } else {
                    requestAnimationFrame(() => this.loop());
                }
            }

            crash(item) {
                item.el.remove();
                item.removed = true;
                this.lives--;
                window.app.audio.playError();

                this.c.style.background = '#520000'; // Flash red
                setTimeout(() => this.c.style.background = '#333', 100);

                if (this.lives <= 0) this.endGame(false);
            }

            updateUI() {
                // Format MM:SS
                const m = Math.floor(this.timeLeft / 60);
                const s = Math.floor(this.timeLeft % 60);
                const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

                if (timeStr !== this.lastTimeStr) {
                    this.timeEl.textContent = timeStr;
                    this.lastTimeStr = timeStr;
                }

                if (this.lives !== this.lastLives) {
                    this.livesEl.textContent = `❤️ ${this.lives}`;
                    this.lastLives = this.lives;
                }
            }

            finishLine() {
                this.running = false;
                window.app.audio.playWin();
                window.app.updateParentStats(50, 1, 'kart'); // Big reward

                this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 20px; margin-top: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        <div style="font-size: 6em;">🏆</div>
                        <h2 style="color: #2ecc71;">¡Meta Alcanzada!</h2>
                        <p style="font-size: 1.5em; margin: 10px 0;">¡Gran carrera, Dino!</p>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Volver al Menú</button>
                    </div>
                `;
            }

            endGame(won) {
                this.running = false;
                this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px; margin-top: 50px;">
                        <div style="font-size: 6em;">💥</div>
                        <h2 style="color: var(--error-color);">¡Choque!</h2>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Volver al Menú</button>
                    </div>
                `;
            }

            cleanup() {
                this.running = false;
                window.removeEventListener('mousemove', this.inputHandler);
                window.removeEventListener('touchmove', this.inputHandler);
            }
        }
