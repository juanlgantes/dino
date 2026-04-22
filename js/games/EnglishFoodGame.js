export class EnglishFoodGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.dino = { x: 0, y: 0, speedX: 5, speedY: 5, el: null };
        this.items = [];
        this.score = 0;

        // Setup UI
        this.c.style.background = 'linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%)';
        this.c.style.position = 'relative';
        this.c.style.overflow = 'hidden';

        document.getElementById('livesContainer').style.display = 'none';

        this.library = [
            { id: 'pizza', icon: '🍕', word: 'pizza', type: 'food' },
            { id: 'apple', icon: '🍎', word: 'apple', type: 'food' },
            { id: 'football', icon: '⚽', word: 'football', type: 'hobby' },
            { id: 'videogame', icon: '🎮', word: 'video games', type: 'hobby' }
        ];

        this.init();
    }

    init() {
        this.c.innerHTML = `
            <div id="dinoMouth" style="position:absolute; font-size:4em; z-index:10; transition: transform 0.1s;">🦕</div>
            <div id="scoreDisplay" style="position:absolute; top:10px; right:20px; font-size:2em; font-weight:bold;">Score: 0</div>

            <div id="speakModal" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:20; display:none;">
                <div id="targetIcon" style="font-size:6em; margin-bottom:10px;"></div>
                <h2 style="color:white; font-size:2em; margin-bottom:20px; text-align:center;">Say: <br><span id="targetPhrase" style="color:#f1c40f;"></span></h2>

                <div style="display:flex; flex-direction:column; align-items:center;">
                    <button id="btnMicFood" style="padding:20px; border-radius:50%; font-size:2em; background:#3498db; color:white; border:none; box-shadow:0 0 15px #3498db;">🎤</button>
                    <span id="micFoodStatus" style="color:white; margin-top:10px;">Tap to speak</span>
                </div>

                <button id="btnSkipFood" style="margin-top:40px; padding:10px 20px; font-size:1.2em; background:#95a5a6; color:white; border:none; border-radius:10px;">Or click here to say it</button>
            </div>
            <div id="powerupOverlay" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:15; display:flex; align-items:center; justify-content:center; font-size:4em; font-weight:bold; opacity:0; transition:opacity 0.5s;"></div>
        `;

        this.dino.el = document.getElementById('dinoMouth');
        this.width = this.c.offsetWidth || 800;
        this.height = this.c.offsetHeight || 600;

        this.dino.x = this.width / 2;
        this.dino.y = this.height / 2;
        this.updateDinoPos();

        this.setupMic();
        this.bindEvents();

        this.spawnTimer = setInterval(() => this.spawnItem(), 2000);
        this.loopTimeout = requestAnimationFrame(() => this.loop());
    }

    bindEvents() {
        this.targetX = this.width / 2;
        this.targetY = this.height / 2;

        const moveHandler = (e) => {
            if (!this.running || this.paused) return;
            const rect = this.c.getBoundingClientRect();
            const input = e.touches ? e.touches[0] : e;
            this.targetX = input.clientX - rect.left;
            this.targetY = input.clientY - rect.top;

            if (this.targetX < this.dino.x) {
                this.dino.el.style.transform = 'scaleX(-1)';
            } else {
                this.dino.el.style.transform = 'scaleX(1)';
            }
        };

        this.c.addEventListener('mousemove', moveHandler);
        this.c.addEventListener('touchmove', moveHandler, { passive: false });
    }

    spawnItem() {
        if (!this.running || this.paused) return;

        const item = this.library[Math.floor(Math.random() * this.library.length)];
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.fontSize = '3em';
        el.innerHTML = item.icon;

        const x = Math.random() * (this.width - 50);
        const y = Math.random() * (this.height - 50);

        el.style.left = x + 'px';
        el.style.top = y + 'px';

        this.c.appendChild(el);
        this.items.push({ x, y, el, ...item });

        // Remove after 5 seconds if not eaten
        setTimeout(() => {
            if (el.parentNode) {
                el.remove();
                this.items = this.items.filter(i => i.el !== el);
            }
        }, 5000);
    }

    loop() {
        if (!this.running) return;

        if (!this.paused) {
            // Move Dino towards target
            const dx = this.targetX - this.dino.x;
            const dy = this.targetY - this.dino.y;

            this.dino.x += dx * 0.05;
            this.dino.y += dy * 0.05;

            this.updateDinoPos();
            this.checkCollisions();
        }

        this.loopTimeout = requestAnimationFrame(() => this.loop());
    }

    updateDinoPos() {
        this.dino.el.style.left = (this.dino.x - 30) + 'px';
        this.dino.el.style.top = (this.dino.y - 30) + 'px';
    }

    checkCollisions() {
        const HIT_RAD = 40;
        this.items.forEach((item, index) => {
            const dx = Math.abs(this.dino.x - item.x);
            const dy = Math.abs(this.dino.y - item.y);

            if (dx < HIT_RAD && dy < HIT_RAD) {
                this.eatItem(item, index);
            }
        });
    }

    eatItem(item, index) {
        this.items.splice(index, 1);
        item.el.remove();

        this.paused = true;
        this.currentItem = item;

        const modal = document.getElementById('speakModal');
        const phraseEl = document.getElementById('targetPhrase');
        document.getElementById('targetIcon').textContent = item.icon;

        const phrase = item.type === 'food' ? `I like eating ${item.word}` : `I like playing ${item.word}`;
        this.targetPhraseStr = phrase;
        phraseEl.textContent = phrase;

        modal.style.display = 'flex';

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(phrase, 'en-US');
        }

        document.getElementById('micFoodStatus').textContent = 'Tap mic to speak';

        document.getElementById('btnSkipFood').onclick = () => {
            this.successAction();
        };
    }

    setupMic() {
        const btn = document.getElementById('btnMicFood');
        const status = document.getElementById('micFoodStatus');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            status.textContent = 'Voice not supported, use skip button';
            btn.style.opacity = '0.5';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            status.textContent = 'Heard: ' + transcript;

            // Fuzzy match the key word
            if (transcript.includes(this.currentItem.word)) {
                this.successAction();
            } else {
                window.app.audio.playError();
                status.textContent = 'Try again! (' + transcript + ')';
            }
        };

        btn.onclick = () => {
            try {
                this.recognition.start();
                status.textContent = 'Listening...';
            } catch (e) {}
        };
    }

    successAction() {
        window.app.audio.playWin();
        document.getElementById('speakModal').style.display = 'none';

        this.score++;
        document.getElementById('scoreDisplay').textContent = 'Score: ' + this.score;
        window.app.addScore(5);

        // Powerup
        const overlay = document.getElementById('powerupOverlay');
        if (this.currentItem.type === 'food') {
            overlay.textContent = '⚡ SPEED UP!';
            overlay.style.color = '#e74c3c';
        } else {
            overlay.textContent = '🛡️ SHIELD!';
            overlay.style.color = '#3498db';
        }

        overlay.style.opacity = '1';
        setTimeout(() => { overlay.style.opacity = '0'; }, 1500);

        this.paused = false;

        if (this.score >= 5) {
            this.endGame();
        }
    }

    endGame() {
        this.running = false;
        clearInterval(this.spawnTimer);

        window.app.updateParentStats(25, 1, 'arcade');

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.9); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:30;
        `;
        overlay.innerHTML = `
            <div style="font-size: 5em;">😋</div>
            <h2 style="color:#2ecc71; font-size:2em;">¡Dino está lleno!</h2>
            <button id="btnReplayFood" style="margin-top:20px; padding:15px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px;">🔄 Volver a Jugar</button>
        `;
        this.c.appendChild(overlay);

        document.getElementById('btnReplayFood').onclick = () => {
            window.app.startGame(window.app.currentGameKey);
        };
    }

    cleanup() {
        this.running = false;
        clearInterval(this.spawnTimer);
        cancelAnimationFrame(this.loopTimeout);
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e){}
        }
    }
}