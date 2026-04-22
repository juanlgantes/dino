export class RecycleGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.score = 0;
                this.timeLeft = 60;
                this.running = false;
                this.items = [];
                this.spawnRate = 2000;

                this.bins = [
                    { id: 'paper', color: '#3498db', icon: '🔵', label: 'Papel', types: ['📰', '📦', '📄', '✉️'] },
                    { id: 'plastic', color: '#f1c40f', icon: '🟡', label: 'Plástico', types: ['🥤', '🍼', '🥄', '🥡'] },
                    { id: 'organic', color: '#795548', icon: '🟤', label: 'Orgánico', types: ['🍎', '🍌', '🦴', '🥚'] }
                ];

                this.init();
            }

            init() {
                this.c.innerHTML = '';
                this.c.style.background = '#81ecec';
                this.c.style.overflow = 'hidden';
                this.c.style.position = 'relative';

                // Intro
                const h = document.createElement('h2');
                h.textContent = '♻️ Reciclaje';
                h.style.cssText = 'position:absolute; top:20%; width:100%; text-align:center; font-size:3em; color:#2d3436;';
                this.c.appendChild(h);

                const btn = document.createElement('button');
                btn.className = 'mode-btn kid';
                btn.textContent = '▶️ Empezar (1 min)';
                btn.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:#00b894;';
                btn.onclick = () => this.startGame();
                this.c.appendChild(btn);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠';
                exit.className = 'nav-btn';
                exit.style.cssText = 'position:absolute; top:10px; right:10px;';
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);
            }

            startGame() {
                this.c.innerHTML = '';
                this.score = 0;
                this.timeLeft = 60;
                this.running = true;
                this.items = [];
                window.app.addScore(0);

                // HUD
                const hud = document.createElement('div');
                hud.style.cssText = 'position:absolute; top:10px; left:10px; font-size:1.5em; font-weight:bold; color:#2d3436; background:rgba(255,255,255,0.8); padding:5px 15px; border-radius:15px;';
                hud.id = 'recycleHud';
                hud.textContent = `⏱️ ${this.timeLeft}s`;
                this.c.appendChild(hud);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠';
                exit.className = 'nav-btn';
                exit.style.cssText = 'position:absolute; top:10px; right:10px; z-index:100;';
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);

                // Bins Container
                const binCont = document.createElement('div');
                binCont.style.cssText = 'position:absolute; bottom:0; left:0; width:100%; height:120px; display:flex;';
                this.c.appendChild(binCont);

                this.binEls = [];
                this.bins.forEach(bin => {
                    const el = document.createElement('div');
                    el.style.cssText = `flex:1; background:${bin.color}; display:flex; flex-direction:column; align-items:center; justify-content:center; border-top:5px solid rgba(0,0,0,0.1);`;
                    el.innerHTML = `<div style="font-size:3em;">${bin.icon}</div><div style="color:white; font-weight:bold;">${bin.label}</div>`;
                    binCont.appendChild(el);

                    // Drop Zone Data
                    el.dataset.id = bin.id;
                    this.binEls.push(el);
                });

                // Loops
                this.timerInterval = setInterval(() => {
                    if(!this.running) return;
                    this.timeLeft--;
                    document.getElementById('recycleHud').textContent = `⏱️ ${this.timeLeft}s`;
                    if(this.timeLeft <= 0) this.endGame();
                }, 1000);

                this.spawnLoop();
                this.updateLoop();
            }

            spawnLoop() {
                if(!this.running) return;
                this.spawnItem();
                const next = Math.max(500, 2000 - (60 - this.timeLeft) * 20); // Faster over time
                this.spawnTimeout = setTimeout(() => this.spawnLoop(), next);
            }

            spawnItem() {
                const binType = this.bins[Math.floor(Math.random() * this.bins.length)];
                const itemIcon = binType.types[Math.floor(Math.random() * binType.types.length)];

                const el = document.createElement('div');
                el.textContent = itemIcon;
                el.style.cssText = `
                    position:absolute; top:-50px; left:${Math.random() * 80 + 10}%;
                    font-size:3.5em; cursor:grab; touch-action:none; user-select:none;
                    z-index: 10;
                `;

                this.c.appendChild(el);

                const item = { el: el, type: binType.id, y: -50, speed: Math.random() * 2 + 1 + (60 - this.timeLeft)/30, dragging: false };
                this.items.push(item);

                // Drag Logic
                const startDrag = (e) => {
                    if(!this.running) return;
                    e.preventDefault(); // Stop scroll
                    item.dragging = true;
                    el.style.cursor = 'grabbing';
                    el.style.zIndex = 100;
                    el.style.transition = 'none';
                };

                const moveDrag = (e) => {
                    if(!item.dragging) return;
                    const input = e.touches ? e.touches[0] : e;
                    const rect = this.c.getBoundingClientRect();
                    const x = input.clientX - rect.left;
                    const y = input.clientY - rect.top;

                    el.style.left = (x - el.offsetWidth/2) + 'px';
                    el.style.top = (y - el.offsetHeight/2) + 'px';
                    item.y = y; // Sync y
                };

                const endDrag = (e) => {
                    if(!item.dragging) return;
                    item.dragging = false;
                    el.style.cursor = 'grab';
                    el.style.zIndex = 10;

                    // Check Drop
                    const rect = el.getBoundingClientRect();
                    const centerX = rect.left + rect.width/2;
                    const centerY = rect.top + rect.height/2;

                    // Check collision with bins
                    let dropped = false;
                    this.binEls.forEach(binEl => {
                        const bRect = binEl.getBoundingClientRect();
                        if(centerX > bRect.left && centerX < bRect.right && centerY > bRect.top && centerY < bRect.bottom) {
                            this.checkSort(item, binEl.dataset.id);
                            dropped = true;
                        }
                    });

                    if(!dropped) {
                        // Return to fall (visual glitch maybe, but ok)
                    }
                };

                el.addEventListener('mousedown', startDrag);
                el.addEventListener('touchstart', startDrag, {passive:false});
                window.addEventListener('mousemove', moveDrag);
                window.addEventListener('touchmove', moveDrag, {passive:false});
                window.addEventListener('mouseup', endDrag);
                window.addEventListener('touchend', endDrag);

                // Attach listeners to item to remove them later
                item.listeners = { move: moveDrag, up: endDrag };
            }

            updateLoop() {
                if(!this.running) return;

                this.items.forEach(item => {
                    if(!item.dragging) {
                        item.y += item.speed;
                        item.el.style.top = item.y + 'px';

                        // Missed (Floor)
                        if(item.y > this.c.offsetHeight - 120) {
                            // Only if not dragged
                            // Actually floor is bins top. If hit bins without drag?
                            // Let's say if y > height, it's trash (missed).
                            if(item.y > this.c.offsetHeight) {
                                this.removeItem(item);
                                // Optional: Penalty?
                            }
                        }
                    }
                });

                requestAnimationFrame(() => this.updateLoop());
            }

            checkSort(item, binId) {
                if(item.type === binId) {
                    // Correct
                    window.app.audio.playPop();
                    window.app.addScore(10, 'recycle');
                    this.score += 10;
                    this.showFeedback(item.el, '✅');
                } else {
                    // Wrong
                    window.app.audio.playError();
                    this.showFeedback(item.el, '❌');
                }
                this.removeItem(item);
            }

            showFeedback(el, text) {
                const rect = el.getBoundingClientRect();
                const f = document.createElement('div');
                f.textContent = text;
                f.style.cssText = `position:fixed; top:${rect.top}px; left:${rect.left}px; font-size:3em; pointer-events:none; z-index:200; animation: fadeUp 0.5s forwards;`;
                document.body.appendChild(f);
                setTimeout(() => f.remove(), 500);
            }

            removeItem(item) {
                item.el.remove();
                window.removeEventListener('mousemove', item.listeners.move);
                window.removeEventListener('touchmove', item.listeners.move);
                window.removeEventListener('mouseup', item.listeners.up);
                window.removeEventListener('touchend', item.listeners.up);
                this.items = this.items.filter(i => i !== item);
            }

            endGame() {
                this.running = false;
                clearInterval(this.timerInterval);
                clearTimeout(this.spawnTimeout);

                this.items.forEach(i => this.removeItem(i));
                window.app.audio.playWin();
                window.app.updateParentStats(this.score, 1, 'recycling');

                this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px;">
                        <div style="font-size: 6em;">🌍</div>
                        <h2 style="color: #2ecc71;">¡Tiempo!</h2>
                        <p style="font-size: 1.5em;">Puntuación: ${this.score}</p>
                        <button class="mode-btn kid" style="margin-top:20px; background:#00b894;" onclick="window.app.gameInstance.startGame()">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" onclick="window.app.nav.goDashboard()">🏠 Salir</button>
                    </div>
                `;
            }

            cleanup() {
                this.running = false;
                clearInterval(this.timerInterval);
                clearTimeout(this.spawnTimeout);
                if(this.items) this.items.forEach(i => this.removeItem(i));
            }
        }
