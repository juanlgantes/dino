export class EnglishMoodJumpGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;

        this.dino = { y: 0, isJumping: false, isDucking: false };
        this.clouds = [];
        this.score = 0;
        this.speed = 4;

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
            <div id="dino" style="position:absolute; left:50px; bottom:20%; font-size:4em; transition: bottom 0.3s, transform 0.3s; z-index:10;">🦕</div>

            <div style="position:absolute; bottom:10px; width:100%; display:flex; justify-content:space-around; z-index:20;">
                <button id="btnDuck" style="padding:15px 30px; font-size:1.5em; background:#f1c40f; border:none; border-radius:10px; font-weight:bold;">⏬ Duck</button>
                <button id="btnJump" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px; font-weight:bold;">⏫ Jump</button>
            </div>
            <div id="scoreDisplay" style="position:absolute; top:20px; right:20px; font-size:2em; font-weight:bold;">Score: 0</div>
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
            if (this.dino.isJumping || this.dino.isDucking || !this.running) return;
            this.dino.isJumping = true;
            this.dinoEl.style.bottom = '40%';
            window.app.audio.playPop(); // simple jump sound
            setTimeout(() => {
                if (!this.running) return;
                this.dinoEl.style.bottom = '20%';
                setTimeout(() => {
                    this.dino.isJumping = false;
                }, 300);
            }, 500);
        };

        const duck = () => {
            if (this.dino.isJumping || this.dino.isDucking || !this.running) return;
            this.dino.isDucking = true;
            this.dinoEl.style.transform = 'scaleY(0.5)';
            this.dinoEl.style.transformOrigin = 'bottom';
            setTimeout(() => {
                if (!this.running) return;
                this.dinoEl.style.transform = 'scaleY(1)';
                setTimeout(() => {
                    this.dino.isDucking = false;
                }, 100);
            }, 600);
        };

        document.getElementById('btnJump').addEventListener('mousedown', jump);
        document.getElementById('btnJump').addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

        document.getElementById('btnDuck').addEventListener('mousedown', duck);
        document.getElementById('btnDuck').addEventListener('touchstart', (e) => { e.preventDefault(); duck(); });
    }

    spawnCloud() {
        if (!this.running) return;

        const types = [
            { word: 'sad', needsJump: true },
            { word: 'angry', needsJump: true },
            { word: 'happy', needsJump: false },
            { word: 'sleepy', needsJump: false }
        ];

        const type = types[Math.floor(Math.random() * types.length)];

        const el = document.createElement('div');
        el.className = 'cloud-obstacle';
        el.style.position = 'absolute';
        el.style.left = this.width + 'px';

        // High (needs duck) or Low (needs jump)
        if (type.needsJump) {
            el.style.bottom = '22%';
        } else {
            el.style.bottom = '35%'; // higher
        }

        el.style.background = 'white';
        el.style.padding = '10px 20px';
        el.style.borderRadius = '20px';
        el.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        el.style.fontSize = '1.5em';
        el.style.fontWeight = 'bold';
        el.textContent = type.word;

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
        if (!this.running) return;

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
                this.speed += 0.1; // Increase speed slightly

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
        // Adjust hitboxes slightly for leniency
        return (
            rect1.left < rect2.right - 20 &&
            rect1.right > rect2.left + 20 &&
            rect1.top < rect2.bottom - 20 &&
            rect1.bottom > rect2.top + 20
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