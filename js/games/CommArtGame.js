export class CommArtGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.color = '#3498db';
        this.brushSize = 10;
        this.mode = 'draw'; // 'draw' or 'sticker'
        this.currentSticker = '⭐';

        this.c.style.background = '#ecf0f1';
        this.c.style.position = 'relative';
        document.getElementById('livesContainer').style.display = 'none';

        this.init();
    }

    init() {
        this.c.innerHTML = `
            <div id="artToolbar" style="position:absolute; top:10px; left:50%; transform:translateX(-50%); display:flex; gap:10px; background:white; padding:10px; border-radius:20px; box-shadow:0 5px 15px rgba(0,0,0,0.1); z-index:10;">
                <input type="color" id="artColor" value="#3498db" style="width:40px; height:40px; border:none; border-radius:50%; cursor:pointer;">
                <input type="range" id="artSize" min="5" max="50" value="10" style="width:100px;">
                <button id="btnDraw" style="padding:10px; font-size:1.2em; border:none; border-radius:10px; background:#e74c3c; color:white; cursor:pointer;">✏️</button>
                <button id="btnStickerMenu" style="padding:10px; font-size:1.2em; border:none; border-radius:10px; background:#f1c40f; color:white; cursor:pointer;">⭐</button>
                <button id="btnClearArt" style="padding:10px; font-size:1.2em; border:none; border-radius:10px; background:#95a5a6; color:white; cursor:pointer;">🗑️</button>
                <button id="btnFinishArt" style="padding:10px; font-size:1.2em; border:none; border-radius:10px; background:#2ecc71; color:white; cursor:pointer;">✅ Listo</button>
            </div>

            <div id="stickerPalette" style="position:absolute; top:70px; left:50%; transform:translateX(-50%); display:none; gap:10px; background:white; padding:10px; border-radius:20px; box-shadow:0 5px 15px rgba(0,0,0,0.1); z-index:10;">
                ${['⭐','❤️','🌸','🚗','🐶','🎈'].map(s => `<button class="sticker-btn" data-s="${s}" style="font-size:2em; border:none; background:transparent; cursor:pointer;">${s}</button>`).join('')}
            </div>

            <canvas id="artCanvas" style="width:100%; height:100%; cursor:crosshair; touch-action:none;"></canvas>
        `;

        this.canvas = document.getElementById('artCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Sizing
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.bindEvents();

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak("¡Dibuja algo bonito!", "es-ES");
        }
    }

    resize() {
        if (!this.running) return;
        // Save current content
        const data = this.canvas.toDataURL();
        this.canvas.width = this.c.offsetWidth;
        this.canvas.height = this.c.offsetHeight;

        // Fill white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore
        const img = new Image();
        img.src = data;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
    }

    bindEvents() {
        // Toolbar
        document.getElementById('artColor').onchange = (e) => this.color = e.target.value;
        document.getElementById('artSize').oninput = (e) => this.brushSize = e.target.value;

        document.getElementById('btnDraw').onclick = () => { this.mode = 'draw'; document.getElementById('stickerPalette').style.display='none'; };
        document.getElementById('btnStickerMenu').onclick = () => {
            const pal = document.getElementById('stickerPalette');
            pal.style.display = pal.style.display === 'none' ? 'flex' : 'none';
        };

        document.getElementById('btnClearArt').onclick = () => {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            window.app.audio.playPop();
        };

        document.getElementById('btnFinishArt').onclick = () => this.endGame();

        // Stickers
        document.querySelectorAll('.sticker-btn').forEach(b => {
            b.onclick = () => {
                this.mode = 'sticker';
                this.currentSticker = b.dataset.s;
                document.getElementById('stickerPalette').style.display = 'none';
            };
        });

        // Drawing
        const start = (e) => {
            if(!this.running) return;
            const pos = this.getPos(e);
            if (this.mode === 'draw') {
                this.isDrawing = true;
                this.ctx.beginPath();
                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.strokeStyle = this.color;
                this.ctx.moveTo(pos.x, pos.y);
                this.ctx.lineTo(pos.x, pos.y); // Draw dot if just clicked
                this.ctx.stroke();
            } else if (this.mode === 'sticker') {
                this.ctx.font = `${this.brushSize * 3}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.currentSticker, pos.x, pos.y);
                window.app.audio.playPop();
            }
        };

        const move = (e) => {
            if (!this.isDrawing || !this.running || this.mode !== 'draw') return;
            const pos = this.getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        };

        const end = () => this.isDrawing = false;

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

    endGame() {
        this.running = false;
        window.app.audio.playWin();
        window.app.addScore(10);
        window.app.updateParentStats(10, 1, 'arcade');

        // Hide toolbar
        document.getElementById('artToolbar').style.display = 'none';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.8); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:20;
        `;
        overlay.innerHTML = `
            <div style="font-size: 5em;">🖼️</div>
            <h2 style="color:#2c3e50; font-size:3em; margin:20px 0;">¡Qué obra de arte!</h2>
            <button id="btnReplayArt" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:15px; cursor:pointer;">🔄 Crear Otro</button>
            <button id="btnExitArt" style="margin-top:10px; padding:15px 30px; font-size:1.5em; background:#e74c3c; color:white; border:none; border-radius:15px; cursor:pointer;">🏠 Volver</button>
        `;
        this.c.appendChild(overlay);

        document.getElementById('btnReplayArt').onclick = () => window.app.startGame(window.app.currentGameKey);
        document.getElementById('btnExitArt').onclick = () => window.app.nav.goDashboard();
    }

    cleanup() {
        this.running = false;
    }
}