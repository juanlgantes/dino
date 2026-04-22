export class EnglishSimonGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.score = 0;

        // Setup UI
        this.c.style.background = 'linear-gradient(to bottom, #a8edea 0%, #fed6e3 100%)';
        this.c.style.position = 'relative';
        this.c.style.overflow = 'hidden';
        this.c.style.display = 'flex';
        this.c.style.flexDirection = 'column';
        this.c.style.alignItems = 'center';
        this.c.style.justifyContent = 'center';

        document.getElementById('livesContainer').style.display = 'none';

        this.actions = [
            { id: 'jump', label: 'Jump!', icon: '⏫', text: 'jump' },
            { id: 'run', label: 'Run!', icon: '🏃', text: 'run' },
            { id: 'sleep', label: 'Sleep!', icon: '😴', text: 'sleep' },
            { id: 'dance', label: 'Dance!', icon: '💃', text: 'dance' }
        ];

        this.init();
    }

    init() {
        this.c.innerHTML = `
            <div id="simonScore" style="position:absolute; top:20px; right:20px; font-size:2em; font-weight:bold; background:white; padding:5px 15px; border-radius:20px;">Score: 0</div>

            <div id="simonDino" style="font-size:8em; margin-bottom:30px; transition: transform 0.3s;">🦕</div>

            <div id="commandText" style="font-size:2em; font-weight:bold; color:#2c3e50; margin-bottom:20px; height:40px;">Listen carefully...</div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; width:80%; max-width:400px;">
                ${this.actions.map(a => `
                    <button class="simon-btn" data-id="${a.id}" style="padding:20px; font-size:1.5em; border-radius:15px; border:none; background:white; box-shadow:0 5px 15px rgba(0,0,0,0.1); cursor:pointer; font-weight:bold;">
                        ${a.icon} ${a.label}
                    </button>
                `).join('')}
            </div>
        `;

        this.dinoEl = document.getElementById('simonDino');
        this.cmdText = document.getElementById('commandText');

        // Bind buttons
        const btns = this.c.querySelectorAll('.simon-btn');
        btns.forEach(btn => {
            btn.onclick = () => this.handleInput(btn.dataset.id);
        });

        setTimeout(() => this.nextRound(), 2000);
    }

    nextRound() {
        if (!this.running) return;

        this.isSimon = Math.random() > 0.3; // 70% chance Simon says
        this.targetAction = this.actions[Math.floor(Math.random() * this.actions.length)];

        let phrase = this.targetAction.text;
        if (this.isSimon) {
            phrase = "Simon says: " + phrase;
        }

        this.cmdText.textContent = "🔊 Listening...";

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(phrase, 'en-US');
        }

        // Allow input shortly after speaking
        this.inputReady = false;
        setTimeout(() => {
            if (!this.running) return;
            this.inputReady = true;
            this.cmdText.textContent = phrase;

            // If NOT Simon says, auto-pass after 3 seconds if no input
            if (!this.isSimon) {
                this.waitTimer = setTimeout(() => {
                    if (this.running && this.inputReady) {
                        this.successAction(true); // passed by doing nothing
                    }
                }, 3000);
            }
        }, 1500);
    }

    handleInput(id) {
        if (!this.inputReady) return;
        this.inputReady = false; // Block further inputs
        clearTimeout(this.waitTimer);

        if (this.isSimon && id === this.targetAction.id) {
            // Correct action
            this.animateDino(id);
            this.successAction(false);
        } else if (!this.isSimon) {
            // Should not have clicked!
            this.failAction("Simon didn't say it!");
        } else {
            // Wrong action
            this.failAction("Wrong action!");
        }
    }

    animateDino(id) {
        if (id === 'jump') {
            this.dinoEl.style.transform = 'translateY(-50px)';
            setTimeout(() => this.dinoEl.style.transform = 'translateY(0)', 300);
        } else if (id === 'run') {
            this.dinoEl.style.transform = 'translateX(50px)';
            setTimeout(() => this.dinoEl.style.transform = 'translateX(-50px)', 200);
            setTimeout(() => this.dinoEl.style.transform = 'translateX(0)', 400);
        } else if (id === 'sleep') {
            this.dinoEl.innerHTML = '😴';
            setTimeout(() => this.dinoEl.innerHTML = '🦕', 1000);
        } else if (id === 'dance') {
            this.dinoEl.style.transform = 'rotate(20deg)';
            setTimeout(() => this.dinoEl.style.transform = 'rotate(-20deg)', 200);
            setTimeout(() => this.dinoEl.style.transform = 'rotate(0)', 400);
        }
    }

    successAction(wasWait) {
        window.app.audio.playWin();
        if (wasWait) {
            this.cmdText.textContent = "Good job waiting!";
            this.cmdText.style.color = "#2ecc71";
        } else {
            this.cmdText.style.color = "#2ecc71";
        }

        this.score++;
        document.getElementById('simonScore').textContent = 'Score: ' + this.score;
        window.app.addScore(5);

        if (this.score >= 10) {
            setTimeout(() => this.endGame(true), 1500);
        } else {
            setTimeout(() => {
                this.cmdText.style.color = "#2c3e50";
                this.nextRound();
            }, 2000);
        }
    }

    failAction(reason) {
        window.app.audio.playError();
        this.cmdText.textContent = reason;
        this.cmdText.style.color = "#e74c3c";

        // Shake Dino
        this.dinoEl.animate([
            { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
        ], { duration: 300 });

        setTimeout(() => this.endGame(false), 2000);
    }

    endGame(won) {
        this.running = false;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.9); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:30;
        `;

        if (won) {
            window.app.audio.playWin();
            window.app.updateParentStats(20, 1, 'arcade');
            overlay.innerHTML = `
                <div style="font-size: 5em;">🏆</div>
                <h2 style="color:#2ecc71; font-size:2em;">¡Simon está orgulloso!</h2>
                <button id="btnReplaySimon" style="margin-top:20px; padding:15px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px;">🔄 Volver a Jugar</button>
            `;
        } else {
            overlay.innerHTML = `
                <div style="font-size: 5em;">❌</div>
                <h2 style="color:#e74c3c; font-size:2em;">Game Over</h2>
                <p style="font-size:1.5em;">Score: ${this.score}</p>
                <button id="btnReplaySimon" style="margin-top:20px; padding:15px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px;">🔄 Reintentar</button>
            `;
        }

        this.c.appendChild(overlay);

        document.getElementById('btnReplaySimon').onclick = () => {
            window.app.startGame(window.app.currentGameKey);
        };
    }

    cleanup() {
        this.running = false;
        clearTimeout(this.waitTimer);
    }
}