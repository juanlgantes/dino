export class EnglishMoodJumpGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;

        this.dino = { y: 0, isJumping: false, isDucking: false };
        this.clouds = [];
        this.score = 0;
        this.speed = 2.5; // Slower initial speed

        // Setup UI
        this.c.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)';
        this.c.style.position = 'relative';
        this.c.style.overflow = 'hidden';

        document.getElementById('livesContainer').style.display = 'none'; // We don't use lives here, or maybe we do? Let's not for now, just score.

        this.init();
    }

    init() {
        this.c.innerHTML = `
            <div id="ground" style="position:absolute; bottom:0; width:100%; height:20%; background:#8B4513; border-top: 5px solid #228B22;"></div>
            <div id="dino" style="position:absolute; left:50px; bottom:20%; font-size:3em; transition: bottom 0.5s ease-out, transform 0.3s; z-index:10; transform-origin: bottom;">🦕</div>

            <div style="position:absolute; bottom:10px; width:100%; display:flex; justify-content:space-around; z-index:20;">
                <button id="btnDuck" style="padding:15px 30px; font-size:1.5em; background:#f1c40f; border:none; border-radius:10px; font-weight:bold;">⏬ Duck</button>
                <button id="btnJump" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px; font-weight:bold;">⏫ Jump</button>
            </div>

            <button id="btnPause" style="position:absolute; top:10px; left:70px; width:50px; height:50px; font-size:1.5em; background:#fff3cd; border:2px solid #ffcc00; border-radius:10px; z-index:20; cursor:pointer;">⏸️</button>
            <div id="scoreDisplay" style="position:absolute; top:20px; left:50%; transform:translateX(-50%); font-size:2em; font-weight:bold; background:rgba(255,255,255,0.8); padding:5px 15px; border-radius:10px; z-index:20;">Score: 0</div>

            <div id="pauseMenu" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:30; display:none;">
                <h2 style="color:white; font-size:3em; margin-bottom:20px;">Pausado</h2>
                <button id="btnResume" style="margin-bottom:10px; padding:15px 30px; font-size:1.5em; background:#2ecc71; color:white; border:none; border-radius:10px; cursor:pointer;">▶️ Continuar</button>
                <button id="btnExit" style="padding:15px 30px; font-size:1.5em; background:#e74c3c; color:white; border:none; border-radius:10px; cursor:pointer;">🏠 Salir</button>
            </div>
        `;

        this.dinoEl = document.getElementById('dino');
        this.width = this.c.offsetWidth;
        this.height = this.c.offsetHeight;

        // Ensure container is somewhat sized if offsetWidth is 0
        if (this.width === 0) this.width = 800;
        if (this.height === 0) this.height = 600;

        this.bindEvents();
        this.loopTimeout = requestAnimationFrame(() => this.loop());

        this.spawnTimer = setTimeout(() => this.spawnCloud(), 2000);
    }

    bindEvents() {
        const jump = () => {
            if (this.dino.isJumping || this.dino.isDucking || !this.running || this.paused) return;
            this.dino.isJumping = true;
            this.dinoEl.style.bottom = '60%'; // Jump MUCH higher
            window.app.audio.playPop();

            // Hang in the air longer, then come down
            setTimeout(() => {
                if (!this.running || this.paused) return;
                this.dinoEl.style.bottom = '20%';
                // Wait for the CSS transition (0.5s) to finish before allowing another jump
                setTimeout(() => {
                    this.dino.isJumping = false;
                }, 500);
            }, 800); // 800ms hold time
        };

        const duck = () => {
            if (this.dino.isJumping || this.dino.isDucking || !this.running || this.paused) return;
            this.dino.isDucking = true;
            this.dinoEl.style.transform = 'scaleY(0.4)'; // Duck lower

            // Stay ducked much longer
            setTimeout(() => {
                if (!this.running || this.paused) return;
                this.dinoEl.style.transform = 'scaleY(1)';
                setTimeout(() => {
                    this.dino.isDucking = false;
                }, 300);
            }, 1200); // 1.2 seconds duck duration
        };

        document.getElementById('btnJump').addEventListener('mousedown', jump);
        document.getElementById('btnJump').addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, {passive:false});

        document.getElementById('btnDuck').addEventListener('mousedown', duck);
        document.getElementById('btnDuck').addEventListener('touchstart', (e) => { e.preventDefault(); duck(); }, {passive:false});

        document.getElementById('btnPause').addEventListener('click', () => this.togglePause());
        document.getElementById('btnResume').addEventListener('click', () => this.togglePause());
        document.getElementById('btnExit').addEventListener('click', () => window.app.nav.goBackFromGame());
    }

    togglePause() {
        if (!this.running) return;
        this.paused = !this.paused;
        const menu = document.getElementById('pauseMenu');

        if (this.paused) {
            menu.style.display = 'flex';
            clearTimeout(this.spawnTimer);
            cancelAnimationFrame(this.loopTimeout);
        } else {
            menu.style.display = 'none';
            this.loopTimeout = requestAnimationFrame(() => this.loop());
            this.spawnTimer = setTimeout(() => this.spawnCloud(), 1000); // Resume spawning soon
        }
    }

    spawnCloud() {
        if (!this.running || this.paused) return;

        const types = [
            { word: 'sad', icon: '😢', needsJump: true },
            { word: 'angry', icon: '😠', needsJump: true },
            { word: 'happy', icon: '😄', needsJump: false },
            { word: 'sleepy', icon: '😴', needsJump: false }
        ];

        const type = types[Math.floor(Math.random() * types.length)];

        const el = document.createElement('div');
        el.className = 'cloud-obstacle';
        el.style.position = 'absolute';
        el.style.left = this.width + 'px';

        // High (needs duck) or Low (needs jump)
        if (type.needsJump) {
            el.style.bottom = '20%'; // Ground level
        } else {
            el.style.bottom = '23%'; // Very low, forces duck to avoid collision
        }

        el.style.background = 'white';
        el.style.padding = '5px 10px'; // Even smaller padding horizontally
        el.style.borderRadius = '20px';
        el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        el.style.fontSize = '1.2em'; // Keep smaller font
        el.style.fontWeight = 'bold';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '5px';
        el.style.maxWidth = '120px'; // Prevent very long clouds
        el.innerHTML = `<span>${type.icon}</span> <span>${type.word}</span>`;

        this.c.appendChild(el);

        this.clouds.push({ x: this.width, el, passed: false, ...type });

        // Spawn next
        const nextTime = 1500 + Math.random() * 2000;
        this.spawnTimer = setTimeout(() => this.spawnCloud(), nextTime);

        // Optional: Speak the word
        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(type.word, 'en-US');
        }
    }

    loop() {
        if (!this.running || this.paused) return;

        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            cloud.x -= this.speed;
            cloud.el.style.left = cloud.x + 'px';

            // Check collision
            const cloudRect = cloud.el.getBoundingClientRect();
            const dinoRect = this.dinoEl.getBoundingClientRect();

            if (this.checkCollision(cloudRect, dinoRect)) {
                this.endGame(false);
                return;
            }

            // Check passed
            if (!cloud.passed && cloud.x < 50) { // Dino is around 50
                cloud.passed = true;
                this.score++;
                document.getElementById('scoreDisplay').textContent = 'Score: ' + this.score;
                this.speed += 0.02; // Very slight speed increase to remain easy

                if (this.score >= 10) { // Win at 10
                    this.endGame(true);
                    return;
                }
            }

            // Remove off-screen
            if (cloud.x < -100) {
                cloud.el.remove();
                this.clouds.splice(i, 1);
            }
        }

        this.loopTimeout = requestAnimationFrame(() => this.loop());
    }

    checkCollision(rect1, rect2) {
        // Horizontally: extremely forgiving so you don't clip the edges of long clouds
        // Vertically: still forgiving, but strict enough to enforce jump/duck difference
        // rect1 = cloud, rect2 = Dino
        return (
            rect1.left < rect2.right - 50 &&
            rect1.right > rect2.left + 50 &&
            rect1.top < rect2.bottom - 15 &&
            rect1.bottom > rect2.top + 15
        );
    }

    endGame(won) {
        this.running = false;
        clearTimeout(this.spawnTimer);
        cancelAnimationFrame(this.loopTimeout);

        const msg = won ? '¡Excelente!' : '¡Oops! Cuidado con las nubes.';
        const color = won ? '#2ecc71' : '#e74c3c';

        if (won) {
            window.app.audio.playWin();
            window.app.addScore(10);
            window.app.updateParentStats(10, 1, 'arcade');
        } else {
            window.app.audio.playError();
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.9); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:30;
        `;
        overlay.innerHTML = `
            <div style="font-size: 5em;">${won ? '🎉' : '🩹'}</div>
            <h2 style="color:${color}; font-size:2em;">${msg}</h2>
            <button id="btnReplayMood" style="margin-top:20px; padding:15px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px;">🔄 Volver a Jugar</button>
        `;
        this.c.appendChild(overlay);

        document.getElementById('btnReplayMood').onclick = () => {
            window.app.startGame(window.app.currentGameKey);
        };
    }

    cleanup() {
        this.running = false;
        clearTimeout(this.spawnTimer);
        cancelAnimationFrame(this.loopTimeout);
    }
}