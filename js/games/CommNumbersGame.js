export class CommNumbersGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.c.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        this.c.style.position = 'relative';

        document.getElementById('livesContainer').style.display = 'none';

        this.currentNumber = Math.floor(Math.random() * 9); // 0 to 8
        this.init();
    }

    init() {
        this.c.innerHTML = `
            <h2 style="position:absolute; top:20px; width:100%; text-align:center; color:white; font-size:2em; text-shadow:2px 2px 4px rgba(0,0,0,0.3);">
                Traza el número ${this.currentNumber}
            </h2>
            <canvas id="numCanvas" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(255,255,255,0.9); border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2); cursor:crosshair; touch-action:none;"></canvas>
            <div id="starContainer" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10; display:flex; flex-wrap:wrap; align-content:center; justify-content:center; gap:10px;"></div>
        `;

        this.canvas = document.getElementById('numCanvas');
        this.ctx = this.canvas.getContext('2d');

        const size = Math.min(this.c.offsetWidth - 40, 400);
        this.canvas.width = size;
        this.canvas.height = size;

        this.drawTemplate();
        this.bindCanvasEvents();

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(`Traza el número ${this.currentNumber}`, 'es-ES');
        }
    }

    drawTemplate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `bold ${this.canvas.height * 0.8}px Arial`;
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.currentNumber.toString(), this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 5;
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeText(this.currentNumber.toString(), this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.setLineDash([]);

        this.isDrawing = false;
    }

    bindCanvasEvents() {
        const start = (e) => {
            if(!this.running) return;
            this.isDrawing = true;
            this.ctx.beginPath();
            this.ctx.lineWidth = 30;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.strokeStyle = '#3498db';
            const pos = this.getPos(e);
            this.ctx.moveTo(pos.x, pos.y);
        };

        const move = (e) => {
            if (!this.isDrawing || !this.running) return;
            const pos = this.getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();

            if (Math.random() < 0.1) this.checkCompletion();
        };

        const end = () => {
            this.isDrawing = false;
            this.checkCompletion();
        };

        this.canvas.addEventListener('mousedown', start);
        this.canvas.addEventListener('mousemove', move);
        this.canvas.addEventListener('mouseup', end);
        this.canvas.addEventListener('mouseleave', end);

        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e.touches[0]); }, {passive:false});
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e.touches[0]); }, {passive:false});
        this.canvas.addEventListener('touchend', end);
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    checkCompletion() {
        const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        let bluePixels = 0;
        for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i] < 100 && imgData[i+1] < 200 && imgData[i+2] > 200) {
                bluePixels++;
            }
        }

        const threshold = (this.canvas.width * this.canvas.height) * 0.08;
        if (bluePixels > threshold) {
            this.startCountingPhase();
        }
    }

    startCountingPhase() {
        if (!this.running) return;
        this.canvas.style.pointerEvents = 'none';
        window.app.audio.playWin();

        if (this.currentNumber === 0) {
            if (window.app.audio && window.app.audio.speak) {
                window.app.audio.speak("¡Cero significa nada! Muy bien.", 'es-ES');
            }
            setTimeout(() => this.endGame(), 2000);
            return;
        }

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(`¡Genial! Ahora atrapa ${this.currentNumber} estrellas.`, 'es-ES');
        }

        const sc = document.getElementById('starContainer');
        sc.style.pointerEvents = 'auto';

        this.starsCaught = 0;

        // Spawn more than needed, but only allow catching the right amount
        const totalToSpawn = this.currentNumber + 3;

        for (let i = 0; i < totalToSpawn; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                width:80px; height:80px; font-size:4em; display:flex; align-items:center; justify-content:center;
                cursor:pointer; transition:transform 0.2s; user-select:none;
            `;
            star.textContent = '⭐';

            star.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], { duration: 1000 + Math.random()*1000, iterations: Infinity });

            star.onmousedown = () => this.catchStar(star);
            star.ontouchstart = (e) => { e.preventDefault(); this.catchStar(star); };
            sc.appendChild(star);
        }
    }

    catchStar(el) {
        if (!this.running || el.style.opacity === '0') return;

        window.app.audio.playPop();
        window.app.addScore(2);
        el.style.transform = 'scale(2)';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 200);

        this.starsCaught++;

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(this.starsCaught.toString(), 'es-ES');
        }

        if (this.starsCaught === this.currentNumber) {
            // Stop others from being clicked
            const sc = document.getElementById('starContainer');
            sc.style.pointerEvents = 'none';
            setTimeout(() => this.endGame(), 1000);
        }
    }

    endGame() {
        this.running = false;
        window.app.audio.playWin();
        window.app.updateParentStats(20, 1, 'arcade');

        this.c.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
                <div style="font-size: 5em;">🏅</div>
                <h2 style="color:white; font-size:3em; margin:20px 0; text-shadow:2px 2px 4px rgba(0,0,0,0.5);">¡Número Dominado!</h2>
                <button id="btnReplayNum" style="padding:15px 30px; font-size:1.5em; background:white; color:#e74c3c; font-weight:bold; border:none; border-radius:15px; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2);">🔄 Practicar Otro</button>
            </div>
        `;

        document.getElementById('btnReplayNum').onclick = () => window.app.startGame(window.app.currentGameKey);
    }

    cleanup() {
        this.running = false;
    }
}