export class MemoryGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.gridSize = 4; // 4 or 6
                this.cards = [];
                this.flipped = [];
                this.matched = [];
                this.locked = false;
                this.timeouts = [];

                this.ASSETS = ['🦕', '🦖', '🐢', '🐊', '🦎', '🐍', '🥚', '🍳', '🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🥥', '🦴'];

                this.init();
            }

            init() {
                this.clearTimeouts();
                this.c.innerHTML = '';
                this.c.style.background = '#a18cd1';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';

                const h = document.createElement('h2');
                h.textContent = '🧠 Memorama Dino';
                h.style.color = 'white';
                h.style.fontSize = '3em';
                h.style.marginBottom = '30px';
                h.style.textShadow = '2px 2px 0 #7f8c8d';
                this.c.appendChild(h);

                const btnContainer = document.createElement('div');
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '20px';

                const btn4 = document.createElement('button');
                btn4.className = 'mode-btn kid';
                btn4.style.background = '#f1c40f';
                btn4.textContent = '4 x 4 (Fácil)';
                btn4.onclick = () => this.startGame(4);

                const btn6 = document.createElement('button');
                btn6.className = 'mode-btn kid';
                btn6.style.background = '#e74c3c';
                btn6.textContent = '6 x 6 (Difícil)';
                btn6.onclick = () => this.startGame(6);

                btnContainer.appendChild(btn4);
                btnContainer.appendChild(btn6);
                this.c.appendChild(btnContainer);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.marginTop = '40px';
                exit.onclick = () => window.app.nav.goBackFromGame();
                this.c.appendChild(exit);
            }

            startGame(size) {
                this.clearTimeouts();
                this.gridSize = size;
                this.c.innerHTML = '';
                this.flipped = [];
                this.matched = [];
                this.locked = false;

                // Header
                const header = document.createElement('div');
                header.style.cssText = 'display:flex; justify-content:space-between; width:95%; max-width:600px; margin-bottom:10px; align-items:center; flex-shrink: 0;';

                const btnBack = document.createElement('button');
                btnBack.textContent = '🔙';
                btnBack.style.cssText = 'background:none; border:none; font-size:2em; cursor:pointer;';
                btnBack.onclick = () => this.init();
                header.appendChild(btnBack);

                this.scoreEl = document.createElement('div');
                this.scoreEl.style.cssText = 'font-size:1.5em; color:white; font-weight:bold;';
                this.scoreEl.textContent = 'Parejas: 0';
                header.appendChild(this.scoreEl);

                this.c.appendChild(header);

                // Grid Container - FLEXIBLE Layout
                const gridEl = document.createElement('div');
                gridEl.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(${size}, 1fr);
                    grid-template-rows: repeat(${size}, 1fr);
                    gap: 10px;
                    width: 100%;
                    max-width: 600px;
                    height: auto;
                    aspect-ratio: 1/1;
                    max-height: 100%; /* Constrain to parent */
                    margin: 0 auto;
                `;

                this.c.appendChild(gridEl);

                // Generate Cards
                const numPairs = (size * size) / 2;
                const selectedAssets = this.ASSETS.slice(0, numPairs);
                let deck = [...selectedAssets, ...selectedAssets];
                deck.sort(() => Math.random() - 0.5);

                this.cards = deck.map((emoji, i) => {
                    const card = document.createElement('div');
                    card.className = 'memory-card'; // We can inject style or use inline
                    card.style.cssText = `
                        background: white; border-radius: 10px; cursor: pointer;
                        display: flex; align-items: center; justify-content: center;
                        font-size: ${size === 4 ? '4em' : '2.5em'};
                        box-shadow: 0 4px 0 rgba(0,0,0,0.2);
                        transform-style: preserve-3d; transition: transform 0.3s;
                        position: relative; user-select: none;
                    `;

                    // Cover (Back)
                    const back = document.createElement('div');
                    back.textContent = '❓';
                    back.style.cssText = `
                        position: absolute; width: 100%; height: 100%;
                        backface-visibility: hidden; background: #3498db;
                        border-radius: 10px; display: flex; align-items: center; justify-content: center;
                        color: white;
                    `;

                    // Front (Face)
                    const front = document.createElement('div');
                    front.textContent = emoji;
                    front.style.cssText = `
                        position: absolute; width: 100%; height: 100%;
                        backface-visibility: hidden; transform: rotateY(180deg);
                        background: white; border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                    `;

                    card.appendChild(back);
                    card.appendChild(front);

                    card.onclick = () => this.flipCard(card, emoji);

                    gridEl.appendChild(card);
                    return { el: card, val: emoji, matched: false };
                });
            }

            flipCard(cardEl, val) {
                if (this.locked) return;
                if (this.flipped.length >= 2) return;
                if (this.flipped.some(item => item.el === cardEl)) return;
                if (cardEl.classList.contains('matched')) return;

                window.app.audio.playPop();
                cardEl.style.transform = 'rotateY(180deg)';
                this.flipped.push({ el: cardEl, val: val });

                if (this.flipped.length === 2) {
                    this.checkMatch();
                }
            }

            checkMatch() {
                this.locked = true;
                const [c1, c2] = this.flipped;

                if (c1.val === c2.val) {
                    // Match
                    this.wait(() => {
                        window.app.audio.playWin(); // Small win sound
                        c1.el.classList.add('matched');
                        c2.el.classList.add('matched');
                        c1.el.style.background = '#2ecc71';
                        c2.el.style.background = '#2ecc71';
                        // Keep visible
                        this.matched.push(c1, c2);
                        this.flipped = [];
                        this.locked = false;
                        this.scoreEl.textContent = `Parejas: ${this.matched.length / 2}`;

                        if (this.matched.length === this.cards.length) {
                            this.winGame();
                        }
                    }, 500);
                } else {
                    // No Match
                    this.wait(() => {
                        window.app.audio.playError();
                        c1.el.style.transform = 'rotateY(0deg)';
                        c2.el.style.transform = 'rotateY(0deg)';
                        this.flipped = [];
                        this.locked = false;
                    }, 1000);
                }
            }

            wait(fn, ms) {
                const id = setTimeout(fn, ms);
                this.timeouts.push(id);
            }

            clearTimeouts() {
                this.timeouts.forEach(clearTimeout);
                this.timeouts = [];
            }

            winGame() {
                window.app.audio.playWin();
                window.app.updateParentStats(20, 1, 'memory');

                this.wait(() => {
                    this.c.innerHTML = `
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 6em;">🧠🏆</div>
                            <h1>¡Memoria Excelente!</h1>
                            <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.gameInstance.init()">🔄 Jugar Otra Vez</button>
                            <br>
                            <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                        </div>
                    `;
                }, 1000);
            }

            cleanup() {
                this.clearTimeouts();
            }
        }
