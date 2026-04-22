export class MusicGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;

                // "Estrellita Dónde Estás" / "Twinkle Twinkle" Sequence
                // C C G G A A G - F F E E D D C
                this.song = ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'];
                this.currentStep = 0;

                this.notes = {
                    'C': { freq: 261.63, label: 'Do', color: '#ff7675' },
                    'D': { freq: 293.66, label: 'Re', color: '#fab1a0' },
                    'E': { freq: 329.63, label: 'Mi', color: '#ffeaa7' },
                    'F': { freq: 349.23, label: 'Fa', color: '#55efc4' },
                    'G': { freq: 392.00, label: 'Sol', color: '#74b9ff' },
                    'A': { freq: 440.00, label: 'La', color: '#a29bfe' },
                    'B': { freq: 493.88, label: 'Si', color: '#fd79a8' }
                };

                this.init();
            }

            init() {
                this.c.style.background = '#2d3436';
                this.c.style.overflow = 'hidden';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';
                this.c.innerHTML = '';

                // Title / Sheet Music
                this.titleEl = document.createElement('h2');
                this.titleEl.style.cssText = `color: white; font-size: 2em; margin-bottom: 20px; text-align: center;`;
                this.titleEl.textContent = '🎵 Toca: Estrellita';
                this.c.appendChild(this.titleEl);

                // Piano Container
                const piano = document.createElement('div');
                // FIX: Added width: 95%, max-width: 600px, reduced gap/padding for mobile
                piano.style.cssText = `display: flex; gap: 5px; padding: 10px; width: 95%; max-width: 600px; background: #dfe6e9; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); box-sizing: border-box;`;

                Object.keys(this.notes).forEach(key => {
                    const n = this.notes[key];
                    const keyEl = document.createElement('button');
                    keyEl.id = `key-${key}`;
                    keyEl.className = 'piano-key';
                    keyEl.style.cssText = `
                        flex: 1; height: 180px; min-width: 0;
                        background: white; border: none; border-radius: 0 0 10px 10px;
                        font-size: 1.2em; font-weight: bold; color: #636e72;
                        box-shadow: 0 5px 0 #b2bec3; cursor: pointer;
                        display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 20px;
                        transition: transform 0.1s, background 0.2s;
                    `;
                    keyEl.innerHTML = `<span>${n.label}</span>`;

                    // Interaction
                    const play = (e) => {
                        e.preventDefault();
                        this.playNote(key, keyEl);
                    };
                    keyEl.onmousedown = play;
                    keyEl.ontouchstart = play;

                    piano.appendChild(keyEl);
                });
                this.c.appendChild(piano);

                // Highlight first note
                this.highlightNext();
            }

            playNote(note, el) {
                // Audio
                window.app.audio.playTone(this.notes[note].freq, 'sine', 0.5);

                // Visual
                el.style.background = this.notes[note].color;
                el.style.transform = 'translateY(5px)';
                el.style.boxShadow = 'none';

                setTimeout(() => {
                    el.style.background = 'white';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = '0 5px 0 #b2bec3';
                }, 200);

                // Logic
                const expected = this.song[this.currentStep];
                if (note === expected) {
                    this.currentStep++;
                    if (this.currentStep >= this.song.length) {
                        this.win();
                    } else {
                        this.highlightNext();
                    }
                } else {
                    // Mistake? Shake or ignore?
                }
            }

            highlightNext() {
                // Clear previous
                document.querySelectorAll('.piano-key').forEach(k => k.style.borderTop = 'none');

                if (this.currentStep < this.song.length) {
                    const nextNote = this.song[this.currentStep];
                    const el = document.getElementById(`key-${nextNote}`);
                    if (el) {
                        el.style.borderTop = `15px solid ${this.notes[nextNote].color}`;
                        this.titleEl.innerHTML = `🎵 Siguiente: <span style="color:${this.notes[nextNote].color}">${this.notes[nextNote].label}</span>`;
                    }
                }
            }

            win() {
                this.titleEl.textContent = '¡BRAVO! 🌟';
                window.app.audio.playWin();

                // Reward: 100 Stars
                window.app.updateParentStats(100, 1, 'music');

                setTimeout(() => {
                    this.c.innerHTML = `
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 6em;">🎹✨</div>
                            <h1>¡Canción Completada!</h1>
                            <h2 style="color: #ffd700;">¡+100 Estrellas! ⭐</h2>
                            <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                            <div style="height:10px"></div>
                            <button class="mode-btn kid" style="background: #e67e22;" onclick="window.app.nav.goBackFromGame()">🏠 Volver al Menú</button>
                        </div>
                    `;
                }, 1000);
            }

            cleanup() {
                // No loops to stop
            }
        }
