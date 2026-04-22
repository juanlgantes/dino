import { ACTIVITIES_DATA, ARCADE_KEYS, ENGLISH_KEYS, COMUNICACION_KEYS } from './activities.js';
import { Navigation } from './Navigation.js';
import { AudioEngine } from './AudioEngine.js';
import { ParentalGate } from './ParentalGate.js';
import { VIDEOS_DATA } from './constants.js';

export class App {
            constructor() {
                this.nav = new Navigation();
                this.audio = new AudioEngine();
                this.security = new ParentalGate();

                // PERSISTENCE: Load state
                const savedStateRaw = localStorage.getItem('dinoState');
                let savedState = null;
                try { savedState = savedStateRaw ? JSON.parse(savedStateRaw) : null; } catch (e) { console.error('State corrupt', e); }

                this.state = {
                    score: 0,
                    completedActivities: 28,
                    totalStars: 124,
                    movementStars: 0,
                    cinemaLocked: false,
                    magicWord: null,
                    cinemaUrls: VIDEOS_DATA.map(v => v.url), // Default age
                    ...(savedState || {})
                };

                // Fallback if cinemaUrls missing in savedState
                if (!this.state.cinemaUrls || this.state.cinemaUrls.length === 0) {
                    this.state.cinemaUrls = VIDEOS_DATA.map(v => v.url);
                }

                this.gameInstance = null;
                this.initDOM();
            }

            persistState() {
                localStorage.setItem('dinoState', JSON.stringify(this.state));
            }

            initDOM() {
                document.getElementById('btnGlobalHome').onclick = () => this.nav.goHome();
                document.getElementById('btnGlobalMute').onclick = (e) => {
                    this.audio.muted = !this.audio.muted;
                    if (this.audio.muted) this.audio.stop();
                    e.currentTarget.textContent = this.audio.muted ? '🔇' : '🔊';
                };
                document.getElementById('btnStartKid').onclick = () => {
                    this.checkKidAccess();
                };
                document.getElementById('btnStartParent').onclick = () => {
                    this.security.open(() => {
                        this.nav.show('parent');
                        this.renderCinemaConfig(); // Render inputs when entering parent zone
                    });
                    this.updateParentUI(); // Update toggles when opening
                };
                const m = document.getElementById('mascotDino');
                m.onclick = () => {
                    this.audio.playPop();
                    m.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 200);
                };

                // Parent Control Bindings
                document.getElementById('btnToggleCinema').onclick = () => this.toggleCinemaLock();
                document.getElementById('btnResetProgress').onclick = () => this.resetProgress();

                // Android Audio Fix: Unlock context on ANY first interaction
                const unlockAudio = () => {
                    this.audio.unlock().then(() => {
                        // Remove listeners only after successful unlock promise resolution
                        document.removeEventListener('touchend', unlockAudio);
                        document.removeEventListener('click', unlockAudio);
                        document.removeEventListener('keydown', unlockAudio);
                    });
                };
                // Use touchend for better mobile compatibility (gesture finish)
                document.addEventListener('touchend', unlockAudio);
                document.addEventListener('click', unlockAudio);
                document.addEventListener('keydown', unlockAudio);
            }



            renderActivities(mode = 'root') {
                let gridId = 'activitiesGrid';
                if (mode === 'english') {
                    gridId = 'englishActivitiesGrid';
                } else if (mode === 'comunicacion') {
                    gridId = 'comunicacionActivitiesGrid';
                }
                const grid = document.getElementById(gridId);
                if (!grid) return;
                grid.innerHTML = '';



                // 1. Render Specific Folder Header/Back Button?
                if (mode === 'arcade') {
                    // Back Button Card
                    const backCard = document.createElement('div');
                    backCard.className = 'area-card';
                    backCard.style.background = '#f1c40f'; // Yellow
                    backCard.innerHTML = `
                        <div style="font-size: 4em;">⬅️</div>
                        <h3>Volver</h3>
                    `;
                    backCard.onclick = () => this.renderActivities('root');
                    grid.appendChild(backCard);
                }

                // 2. Render "Games Folder" in Root (PREPENDED)
                if (mode === 'root') {
                    const gamesCard = document.createElement('div');
                    gamesCard.className = 'area-card';
                    gamesCard.style.cssText = `
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: 4px solid #FFD700;
                    `;
                    gamesCard.innerHTML = `
                        <div style="font-size: 4em;">🎮</div>
                        <h3>ZONA DE JUEGOS</h3>
                        <div class="stars" style="color:#FFD700">DIVERSIÓN</div>
                    `;
                    gamesCard.onclick = () => {
                        this.audio.playPop();
                        this.renderActivities('arcade');
                    };
                    grid.appendChild(gamesCard);
                }

                // 3. Render Cards based on Mode
                Object.keys(ACTIVITIES_DATA).forEach(key => {
                    const data = ACTIVITIES_DATA[key];
                    const isArcade = ARCADE_KEYS.includes(key);
                    const isEnglish = ENGLISH_KEYS.includes(key);
                    const isComunicacion = COMUNICACION_KEYS.includes(key);

                    // Filter Logic
                    if (mode === 'root' && (isArcade || isEnglish || isComunicacion)) return;
                    if (mode === 'arcade' && !isArcade) return;
                    if (mode === 'english' && !isEnglish) return;
                    if (mode === 'comunicacion' && !isComunicacion) return;
                    if ((mode === 'root' || mode === 'arcade') && (isEnglish || isComunicacion)) return;

                    const hasCost = data.cost && data.cost > 0;
                    const isLocked = hasCost && this.state.totalStars < data.cost;

                    const div = document.createElement('div');
                    div.className = 'area-card';
                    if (isLocked) div.classList.add('locked');

                    div.style.background = data.theme;
                    div.dataset.key = key;

                    let costUI = '<div class="stars">⭐⭐⭐</div>'; // Default
                    if (hasCost) {
                        costUI = `<div class="cost-badge">⭐ ${data.cost}</div>`;
                    }

                    div.innerHTML = `
                <div style="font-size: 4em;">${data.icon}</div>
                <h3>${data.title}</h3>
                ${costUI}
            `;
                    div.onclick = () => this.startGame(key);
                    grid.appendChild(div);
                });
            }

            showToast(msg) {
                const el = document.createElement('div');
                el.style.cssText = `
            position: fixed; bottom: 20%; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.8); color: white; padding: 15px 30px;
            border-radius: 30px; font-size: 1.2em; z-index: 3000;
            animation: pop 0.3s;
        `;
                el.textContent = msg;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }

            saveGame(gameKey, state) {
                try {
                    localStorage.setItem(`savedGame_${gameKey}`, JSON.stringify(state));
                    this.showToast('💾 Partida Guardada');
                } catch (e) {
                    console.error('Save failed', e);
                    this.showToast('❌ Error al guardar');
                }
            }

            getSavedGame(gameKey) {
                try {
                    const raw = localStorage.getItem(`savedGame_${gameKey}`);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) {
                    return null;
                }
            }

            startGame(key) {
                const data = ACTIVITIES_DATA[key];

                // Cost Logic (Spend Stars)
                if (data.cost && data.cost > 0) {
                    if (this.state.totalStars < data.cost) {
                        this.audio.playError();
                        this.showToast(`Necesitas ${data.cost} Estrellas ⭐`);
                        return; // Block start
                    }
                    // Deduct
                    this.state.totalStars -= data.cost;
                    this.updateUI();
                    this.persistState();
                }

                this.currentGameKey = key; // Save for Replay
                this.nav.show('game');
                const canvas = document.getElementById('gameArea');

                document.getElementById('gameTitle').textContent = data.title;

                if (this.gameInstance && typeof this.gameInstance.cleanup === 'function') {
                    this.gameInstance.cleanup();
                }

                // DEFENSIVE CLEANUP: Reset container completely to prevent CSS/Style leaks
                canvas.className = 'game-canvas-container'; // Restore base layout class
                canvas.removeAttribute('style'); // Remove backgrounds/borders
                canvas.innerHTML = '';

                // Check for save
                const savedState = this.getSavedGame(key);

                if (data.class) {
                    if (['connect_four', 'checkers', 'parchis', 'chess', 'goose'].includes(data.type)) {
                        this.gameInstance = new data.class(data, canvas, savedState);
                    } else if (data.type === 'quiz') {
                        this.gameInstance = new data.class(data, this);
                    } else {
                        this.gameInstance = new data.class(data, canvas);
                    }
                }
            }

            addScore(pts, source = 'quiz') {
                // Movement Cap Logic
                if (source === 'movement') {
                    if (this.state.movementStars >= 200) return; // Cap reached
                    this.state.movementStars += pts;
                }

                this.state.score += pts;
                const el = document.getElementById('gameScore');
                if (el) {
                    el.textContent = this.state.score;
                    el.classList.remove('pop-anim');
                    void el.offsetWidth;
                    el.classList.add('pop-anim');
                }
            }

            updateParentStats(starsToAdd = 0, activitiesToAdd = 0, source = 'quiz') {
                // FIX: Cleanup Saved Game on Win
                if (starsToAdd > 0 && this.currentGameKey) {
                    localStorage.removeItem('savedGame_' + this.currentGameKey);
                }

                // Double check cap for persistent stats
                if (source === 'movement' && this.state.movementStars >= 200) {
                    starsToAdd = 0;
                }

                const oldStars = this.state.totalStars;
                this.state.totalStars += starsToAdd;
                this.state.completedActivities += activitiesToAdd;

                // Check if we crossed a 100-star threshold
                // e.g., 90 -> 140 (crosses 100), 190 -> 210 (crosses 200)
                const oldHundreds = Math.floor(oldStars / 100);
                const newHundreds = Math.floor(this.state.totalStars / 100);

                if (newHundreds > oldHundreds) {
                    this.showVideoUnlockModal();
                }

                this.updateUI();
            }

            showVideoUnlockModal() {
                this.audio.playWin();

                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9); z-index: 10000;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    animation: fadeIn 0.5s;
                `;

                modal.innerHTML = `
                    <div style="font-size: 8em; animation: bounce 1s infinite;">🎬</div>
                    <h1 style="color: #FFD700; font-size: 4em; text-align: center; text-shadow: 0 0 20px orange;">
                        ¡VIDEO DESBLOQUEADO!
                    </h1>
                    <p style="color: white; font-size: 2em; margin: 20px;">
                        ¡Has conseguido 100 Estrellas!
                    </p>
                    <div style="font-size: 3em; color: white;">👇 TOCA PARA CONTINUAR 👇</div>
                `;

                modal.onclick = () => {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 500);
                };

                document.body.appendChild(modal);
            }

            // --- Cinema Config Methods (v12) ---

            renderCinemaConfig() {
                const container = document.getElementById('cinemaConfigInputs');
                if (!container) return;

                container.innerHTML = '';

                // Use VIDEOS_DATA for labels/colors, but state.cinemaUrls for values
                VIDEOS_DATA.forEach((video, index) => {
                    const currentUrl = this.state.cinemaUrls[index] || video.url;

                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '10px';

                    row.innerHTML = `
                        <div style="width: 30px; height: 30px; background: ${video.color}; border-radius: 5px; display:flex; align-items:center; justify-content:center;">${index + 1}</div>
                        <input type="url" inputmode="url" autocomplete="off" class="cinema-url-input" data-index="${index}" value="${currentUrl}"
                            placeholder="Enlace Video ${index + 1}"
                            style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
                    `;
                    container.appendChild(row);
                });
            }

            saveCinemaConfig() {
                const inputs = document.querySelectorAll('.cinema-url-input');
                const newUrls = [];

                inputs.forEach(input => {
                    let url = input.value.trim();
                    // Basic validation/fallback
                    try {
                        const u = new URL(url);
                        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
                    } catch {
                        url = VIDEOS_DATA[input.dataset.index].url;
                    }
                    newUrls.push(url);
                });

                this.state.cinemaUrls = newUrls;
                this.persistState();

                const msg = document.getElementById('cinemaMsg');
                msg.textContent = '✅ ¡Videos actualizados correctamente!';
                setTimeout(() => msg.textContent = '', 3000);
            }

            // --- Magic Word Methods (v11) ---

            saveMagicWord() {
                const val = document.getElementById('parentMagicInput').value.trim();
                if (val) {
                    this.state.magicWord = val;
                    document.getElementById('magicMsg').textContent = '✅ Guardado: ' + val;
                } else {
                    this.state.magicWord = null;
                    document.getElementById('magicMsg').textContent = '🔓 Acceso libre activado';
                }
                this.persistState();
            }

            checkKidAccess() {
                if (!this.state.magicWord) {
                    // No PIN set, enter directly
                    this.renderActivities('root');
                    this.nav.show('kid-dash');
                    return;
                }

                // Show Custom Magic Modal
                document.getElementById('magicGate').classList.remove('hidden');
                document.getElementById('magicInputDisplay').value = '';
                document.getElementById('magicInputDisplay').focus();
            }

            closeMagicGate() {
                document.getElementById('magicGate').classList.add('hidden');
            }

            checkMagicWord() {
                const input = document.getElementById('magicInputDisplay').value.trim();

                if (input && input.toUpperCase() === this.state.magicWord.toUpperCase()) {
                    this.audio.playWin();
                    this.closeMagicGate();
                    this.renderActivities('root');
                    this.nav.show('kid-dash');
                } else {
                    this.audio.playError();
                    const inp = document.getElementById('magicInputDisplay');
                    inp.style.borderColor = 'red';
                    // Simple shake animation using Web Animations API
                    inp.animate([
                        { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
                    ], { duration: 300 });
                    setTimeout(() => inp.style.borderColor = '#8ec5fc', 1000);
                }
            }

            // --- Parental Control Methods ---

            toggleCinemaLock() {
                this.state.cinemaLocked = !this.state.cinemaLocked;
                this.updateParentUI();
                this.updateUI(); // To refresh any active views
                this.persistState();
            }

            resetProgress() {
                if (confirm('¿Seguro que quieres borrar TODO el progreso? (Estrellas a 0)')) {
                    this.state = {
                        ...this.state,
                        score: 0,
                        totalStars: 0,
                        movementStars: 0,
                        completedActivities: 0
                    };
                    this.updateUI();
                    this.updateParentUI();
                    this.persistState();
                    this.showToast('✅ Progreso reiniciado correctamente');
                }
            }

            updateParentUI() {
                const btn = document.getElementById('btnToggleCinema');
                if (btn) {
                    btn.textContent = this.state.cinemaLocked ? '🔓 Desbloquear Cine' : '🔒 Bloquear Cine';
                    btn.style.background = this.state.cinemaLocked ? '#e74c3c' : '#2ecc71'; // Red/Green
                }
            }

            updateUI() {
                const totalStarsEl = document.getElementById('parentTotalStars');
                const totalActsEl = document.getElementById('parentTotalActivities');
                const kidStarsEl = document.getElementById('kidDashScore'); // Logic Added

                if (totalStarsEl) totalStarsEl.textContent = this.state.totalStars;
                if (totalActsEl) totalActsEl.textContent = this.state.completedActivities;
                if (kidStarsEl) kidStarsEl.textContent = this.state.totalStars; // Logic Added

                // Update Cinema Score too if visible
                const cineScore = document.getElementById('cinemaScore');
                if (cineScore) cineScore.textContent = this.state.totalStars;

                // Update Game Global Score (Wallet)
                const gameGlobalStars = document.getElementById('gameGlobalStars');
                if (gameGlobalStars) gameGlobalStars.textContent = this.state.totalStars;
            }

            openCinema() {
                this.nav.show('cinema');
                this.renderCinema();
            }

            renderCinema() {
                const grid = document.getElementById('cinemaGrid');
                grid.innerHTML = '';

                // Unlock Logic: Stars / 100 AND Not Locked by Parent
                const unlockedCount = this.state.cinemaLocked ? 0 : Math.floor(this.state.totalStars / 100);

                VIDEOS_DATA.forEach((video, index) => {
                    const isUnlocked = (index + 1) <= unlockedCount;
                    const card = document.createElement('div');
                    card.className = `video-card ${isUnlocked ? 'unlocked' : 'locked'}`;

                    card.innerHTML = `
                        <div class="video-thumbnail" style="background: ${video.color};">
                            📺
                        </div>
                        <div class="lock-overlay">
                            ${this.state.cinemaLocked ? '🚫' : (isUnlocked ? '' : '🔒')}
                        </div>
                        <div class="play-icon">▶️</div>
                    `;

                    if (isUnlocked) {
                        card.onclick = () => {
                            this.audio.playPop();
                            // Use Dynamic URL from State
                            const videoUrl = this.state.cinemaUrls[index] || video.url;
                            window.open(videoUrl, '_blank', 'noopener,noreferrer');
                        };
                    } else {
                        card.onclick = () => {
                            this.audio.playError();
                            if (this.state.cinemaLocked) {
                                this.showToast('⛔ El cine está cerrado por los padres');
                            } else {
                                this.showToast(`¡Necesitas ${(index + 1) * 100} estrellas!`);
                            }
                        };
                    }

                    grid.appendChild(card);
                });
            }

            showToast(msg) {
                const el = document.createElement('div');
                el.style.cssText = `
                    position: fixed; bottom: 20%; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.8); color: white; padding: 15px 30px;
                    border-radius: 30px; font-size: 1.2em; z-index: 3000;
                    animation: pop 0.3s;
                `;
                el.textContent = msg;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }
        }
