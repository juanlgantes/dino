export class FighterGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.playerHp = 100;
                this.enemyHp = 100;
                this.playerState = 'idle'; // idle, attack, block, hit
                this.enemyState = 'idle';
                this.running = true;
                this.aiLoop = null;

                this.init();
            }

            init() {
                // Dojo Background
                this.c.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 50%, #8D6E63 50%, #5D4037 100%)';
                this.c.style.overflow = 'hidden';
                this.c.style.position = 'relative';
                this.c.innerHTML = '';

                // Sun / Fuji Decor
                this.c.innerHTML += `
                    <div style="position: absolute; top: 10%; right: 10%; width: 100px; height: 100px; background: #e74c3c; border-radius: 50%; box-shadow: 0 0 20px #e74c3c;"></div>
                    <div style="position: absolute; bottom: 50%; left: 0; width: 100%; height: 20px; background: #4CAF50;"></div>
                `;

                // HUD (HP Bars)
                this.hud = document.createElement('div');
                this.hud.style.cssText = `
                    position: absolute; top: 10px; width: 100%; padding: 10px;
                    display: flex; justify-content: space-between; z-index: 100;
                `;
                this.hud.innerHTML = `
                    <div style="width: 45%;">
                        <div style="font-weight:bold; color:white; text-shadow: 1px 1px 0 #000;">DINO 🦕</div>
                        <div style="border: 2px solid white; height: 20px; background: #555; border-radius: 10px; overflow: hidden;">
                            <div id="playerHpBar" style="width: 100%; height: 100%; background: #2ecc71; transition: width 0.2s;"></div>
                        </div>
                    </div>
                    <div style="width: 10%; text-align:center; font-size: 2em;">🆚</div>
                    <div style="width: 45%; text-align: right;">
                        <div style="font-weight:bold; color:white; text-shadow: 1px 1px 0 #000;">REX 🦖</div>
                        <div style="border: 2px solid white; height: 20px; background: #555; border-radius: 10px; overflow: hidden;">
                            <div id="enemyHpBar" style="width: 100%; height: 100%; background: #e74c3c; float: right; transition: width 0.2s;"></div>
                        </div>
                    </div>
                `;
                this.c.appendChild(this.hud);

                // Characters
                // Player
                this.pEl = document.createElement('div');
                this.pEl.textContent = '🦕';
                this.pEl.style.cssText = `
                    position: absolute; bottom: 20%; left: 35%; font-size: 8em;
                    transform: scaleX(-1); /* Face Right */
                    transition: transform 0.1s; filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.3));
                `;
                this.c.appendChild(this.pEl);

                // Enemy
                this.eEl = document.createElement('div');
                this.eEl.textContent = '🦖';
                this.eEl.style.cssText = `
                    position: absolute; bottom: 20%; right: 35%; font-size: 8em;
                    /* Default faces Left for T-Rex usually? */
                    transition: transform 0.1s; filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.3));
                `;
                this.c.appendChild(this.eEl);

                // Status Text Overlay (Pow, Block)
                this.fxEl = document.createElement('div');
                this.fxEl.style.cssText = `
                    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 5em; font-weight: bold; pointer-events: none; z-index: 50; text-shadow: 2px 2px 0 #fff;
                `;
                this.c.appendChild(this.fxEl);

                // Controls
                const ctrls = document.createElement('div');
                ctrls.style.cssText = `
                    position: absolute; bottom: 20px; width: 100%;
                    display: flex; justify-content: center; gap: 15px; z-index: 100;
                `;

                const btnBlock = this.createBtn('🛡️ BLOCAR', '#3498db');
                const btnAttack = this.createBtn('🥊 PELEAR', '#e74c3c');

                // Block Logic
                // Mouse
                btnBlock.onmousedown = (e) => { e.preventDefault(); this.startBlock(); };
                btnBlock.onmouseup = (e) => { e.preventDefault(); this.endBlock(); };
                btnBlock.onmouseleave = (e) => { e.preventDefault(); this.endBlock(); };
                // Touch
                btnBlock.ontouchstart = (e) => { e.preventDefault(); this.startBlock(); };
                btnBlock.ontouchend = (e) => { e.preventDefault(); this.endBlock(); };

                // Attack Logic
                btnAttack.onclick = () => this.attack();

                ctrls.appendChild(btnBlock);
                ctrls.appendChild(btnAttack);
                this.c.appendChild(ctrls);

                this.startAI();
            }

            createBtn(text, color) {
                const btn = document.createElement('button');
                btn.textContent = text;
                btn.style.cssText = `
                    padding: 20px 30px; font-size: 1.5em; border: none; border-radius: 20px;
                    background: ${color}; color: white; box-shadow: 0 8px 0 rgba(0,0,0,0.2);
                    cursor: pointer; font-family: inherit; transition: transform 0.1s, box-shadow 0.1s;
                `;
                btn.onmousedown = () => {
                    btn.style.transform = 'translateY(4px)';
                    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,0.2)';
                };
                btn.onmouseup = () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = '0 8px 0 rgba(0,0,0,0.2)';
                };
                // Touch visual feedback
                btn.ontouchstart = () => {
                    btn.style.transform = 'translateY(4px)';
                    btn.style.boxShadow = '0 4px 0 rgba(0,0,0,0.2)';
                };
                btn.ontouchend = () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = '0 8px 0 rgba(0,0,0,0.2)';
                };

                return btn;
            }

            // Player Actions
            startBlock() {
                if (!this.running || this.playerState === 'attack') return;
                this.playerState = 'block';
                this.pEl.style.filter = 'brightness(1.5) drop-shadow(0 0 10px #3498db)';
                this.pEl.textContent = '🛡️'; // Shield mode
            }

            endBlock() {
                if (!this.running || this.playerState !== 'block') return;
                this.playerState = 'idle';
                this.pEl.style.filter = 'drop-shadow(5px 5px 5px rgba(0,0,0,0.3))';
                this.pEl.textContent = '🦕';
            }

            attack() {
                if (!this.running || this.playerState !== 'idle') return;

                this.playerState = 'attack';
                window.app.audio.playPop(); // Swoosh

                // Anim (Face Right = scaleX(-1))
                // To move right visually (towards enemy), we need translateX(positive).
                // But since scaleX(-1) is applied, translateX(100px) moves LEFT visually?
                // Let's test logic:
                // transform: scaleX(-1) translateX(??)
                // If I want to move VISUALLY RIGHT ->
                // CSS Transform order matters.
                // If I set transform: scaleX(-1) translateX(100px);
                // The translation happens in the local coordinate system which is flipped.
                // So +100px becomes -100px (Left).
                // So I need translateX(-100px) to move visually RIGHT.

                this.pEl.style.transform = 'scaleX(-1) translateX(-80px) rotate(20deg)';
                setTimeout(() => {
                    if (!this.running) return;
                    this.pEl.style.transform = 'scaleX(-1) translateX(0) rotate(0deg)';
                    this.playerState = 'idle';
                }, 300);

                // Hit Check
                if (this.enemyState !== 'block') {
                    // Hit!
                    this.damageEnemy(15);
                } else {
                    // Blocked!
                    this.showFx('🛡️', '#3498db');
                    this.playMetalSound();
                }
            }

            damageEnemy(amt) {
                this.enemyHp = Math.max(0, this.enemyHp - amt);
                this.updateBars();

                this.showFx('💥', '#e74c3c');
                this.playHitSound();

                // Enemy Hit Anim (Default facing Left)
                // Knockback -> Move Right (away from player)
                // Default: scaleX(1). translateX(50px) moves Right.
                this.eEl.style.transform = 'translateX(50px) rotate(-20deg)';
                setTimeout(() => {
                    if (!this.running) return;
                    this.eEl.style.transform = 'translateX(0)';
                }, 200);

                if (this.enemyHp <= 0) this.endGame(true);
            }

            // AI Logic
            startAI() {
                this.aiLoop = setInterval(() => {
                    if (!this.running) return;

                    const action = Math.random();
                    if (action < 0.4) {
                        // AI Attack
                        this.aiAttack();
                    } else if (action < 0.6) {
                        // AI Block for a bit
                        this.enemyState = 'block';
                        this.eEl.style.filter = 'brightness(0.5) drop-shadow(0 0 10px #3498db)'; // Changed to blue for block
                        setTimeout(() => {
                            if (!this.running) return;
                            this.enemyState = 'idle';
                            this.eEl.style.filter = 'drop-shadow(5px 5px 5px rgba(0,0,0,0.3))';
                        }, 1000);
                    }
                    // Else Idle
                }, 1500); // Act every 1.5s
            }

            aiAttack() {
                if (this.enemyState !== 'idle') return;
                this.enemyState = 'attack';

                // Anim Lunge (Move Left towards player)
                // Default scaleX(1). translateX(-100px) moves Left.
                this.eEl.style.transform = 'translateX(-80px) rotate(20deg)';
                setTimeout(() => {
                    if (!this.running) return;
                    this.eEl.style.transform = 'translateX(0)';
                    this.enemyState = 'idle';
                }, 300);

                // Hit Player? (Delayed to match animation)
                setTimeout(() => {
                    if (!this.running) return;
                    if (this.playerState === 'block') {
                        this.showFx('🛡️', '#3498db');
                        this.playMetalSound();
                    } else {
                        // Ouch
                        this.playerHp = Math.max(0, this.playerHp - 15);
                        this.updateBars();
                        this.playHitSound();

                        // Player Hurt Anim
                        this.pEl.style.transform = 'translateX(-50px)';
                        setTimeout(() => this.pEl.style.transform = 'translateX(0)', 200);

                        // Flash Red
                        this.c.style.backgroundColor = '#ffcccb';
                        setTimeout(() => this.c.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 50%, #8D6E63 50%, #5D4037 100%)', 100);

                        if (this.playerHp <= 0) this.endGame(false);
                    }
                }, 150);
            }

            updateBars() {
                document.getElementById('playerHpBar').style.width = this.playerHp + '%';
                document.getElementById('enemyHpBar').style.width = this.enemyHp + '%';
            }

            showFx(emoji, color) {
                const el = document.createElement('div');
                el.textContent = emoji;
                el.style.cssText = `
                    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.5);
                    font-size: 6em; font-weight: bold; pointer-events: none; z-index: 200;
                    text-shadow: 0 0 10px ${color}; opacity: 1; transition: all 0.5s;
                `;
                this.c.appendChild(el);

                // Pop animation
                setTimeout(() => el.style.transform = 'translate(-50%, -50%) scale(1.5)', 50);
                setTimeout(() => {
                    el.style.opacity = '0';
                    setTimeout(() => el.remove(), 200);
                }, 500);
            }

            playHitSound() { window.app.audio.playError(); } // Re-using error tone as "thud"
            playMetalSound() { window.app.audio.playPop(); } // Re-using pop as "tink"

            endGame(won) {
                this.running = false;
                clearInterval(this.aiLoop);

                const msg = won ? '¡Victoria! 🏆' : '¡Derrota! 🤕';
                const color = won ? '#2ecc71' : '#e74c3c';

                if (won) window.app.updateParentStats(50, 1, 'fighter');

                this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.95); border-radius: 20px; margin-top: 50px;">
                        <div style="font-size: 6em;">${won ? '🥋' : '🩹'}</div>
                        <h2 style="color: ${color};">${msg}</h2>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" style="margin-top:10px;" onclick="window.app.nav.goDashboard()">🏠 Volver al Menú</button>
                    </div>
                `;
            }

            cleanup() {
                this.running = false;
                if (this.aiLoop) clearInterval(this.aiLoop);
            }
        }
