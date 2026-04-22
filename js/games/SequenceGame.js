import { SVG_ASSETS } from '../core/constants.js';

export class SequenceGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.mode = null; // 'numbers', 'shapes', 'colors'
                this.level = 0;

                this.DATA = {
                    numbers: [
                        { seq: [1, 2, 3, '?'], ans: 4, opts: [2, 4, 5] },
                        { seq: [2, 4, 6, '?'], ans: 8, opts: [7, 8, 9] },
                        { seq: [1, 2, 1, 2, '?'], ans: 1, opts: [1, 2, 3] }
                    ],
                    shapes: [
                        { seq: ['shape_triangle', 'shape_square', 'shape_triangle', '?'], ans: 'shape_square', opts: ['shape_triangle', 'shape_square', 'shape_star'] },
                        { seq: ['shape_star', 'shape_moon', 'shape_star', 'shape_moon', '?'], ans: 'shape_star', opts: ['shape_moon', 'shape_star', 'shape_sun'] },
                        { seq: ['shape_square', 'shape_square', 'shape_circle', 'shape_circle', '?'], ans: 'shape_square', opts: ['shape_square', 'shape_circle', 'shape_triangle'] }
                    ],
                    colors: [
                        { seq: ['🔴', '🔵', '🔴', '?'], ans: '🔵', opts: ['🔴', '🔵', '🟢'] },
                        { seq: ['🟡', '🟢', '🟡', '🟢', '?'], ans: '🟡', opts: ['🟡', '🟢', '🟣'] },
                        { seq: ['⚫', '⚪', '⚫', '⚪', '?'], ans: '⚫', opts: ['⚫', '⚪', '🟤'] }
                    ]
                };

                this.init();
            }

            init() {
                this.showMenu();
            }

            showMenu() {
                this.c.innerHTML = '';
                this.c.style.background = '#f0f3f4';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';

                const h = document.createElement('h2');
                h.textContent = '🔢 Secuencias';
                h.style.color = '#2c3e50';
                h.style.fontSize = '3em';
                h.style.marginBottom = '30px';
                this.c.appendChild(h);

                const grid = document.createElement('div');
                grid.style.display = 'flex';
                grid.style.gap = '20px';
                grid.style.flexWrap = 'wrap';
                grid.style.justifyContent = 'center';

                const modes = [
                    { id: 'numbers', label: 'Números 123', color: '#ff7675' },
                    { id: 'shapes', label: 'Figuras 🔺', color: '#74b9ff' },
                    { id: 'colors', label: 'Colores 🎨', color: '#55efc4' }
                ];

                modes.forEach(m => {
                    const btn = document.createElement('button');
                    btn.textContent = m.label;
                    btn.className = 'mode-btn kid';
                    btn.style.background = m.color;
                    btn.onclick = () => this.startCategory(m.id);
                    grid.appendChild(btn);
                });

                this.c.appendChild(grid);

                // Exit
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.marginTop = '40px';
                exit.onclick = () => window.app.nav.goBackFromGame();
                this.c.appendChild(exit);
            }

            startCategory(cat) {
                this.mode = cat;
                this.level = 0;
                this.playLevel();
            }

            renderItem(item) {
                if (SVG_ASSETS[item]) return SVG_ASSETS[item];
                return item;
            }

            playLevel() {
                this.c.innerHTML = '';
                const levelData = this.DATA[this.mode][this.level];

                // Header
                const header = document.createElement('div');
                header.innerHTML = `
                    <button id="btnBack" style="font-size:1.5em; background:none; border:none; cursor:pointer;">🔙</button>
                    <h2 style="display:inline; margin-left:20px; color:#2c3e50;">Nivel ${this.level + 1}</h2>
                `;
                header.style.width = '90%';
                header.style.textAlign = 'left';
                header.style.padding = '10px';
                this.c.appendChild(header);

                document.getElementById('btnBack').onclick = () => this.showMenu();

                // Sequence Container
                const seqDiv = document.createElement('div');
                seqDiv.style.cssText = `
                    display: flex; gap: 10px; margin-top: 50px; justify-content: center;
                    background: white; padding: 20px; border-radius: 20px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1); width: 90%; max-width: 600px; position: relative;
                `;

                // Speaker Button
                const speakBtn = document.createElement('button');
                speakBtn.innerHTML = '🔊';
                speakBtn.style.cssText = `
                    position: absolute; top: -20px; right: -20px; background: #f1c40f;
                    border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5em;
                    cursor: pointer; box-shadow: 0 4px 0 rgba(0,0,0,0.2);
                `;
                speakBtn.onclick = () => this.speakSequence();
                seqDiv.appendChild(speakBtn);

                // Stop Button
                const stopBtn = document.createElement('button');
                stopBtn.innerHTML = '🤫';
                stopBtn.style.cssText = `
                    position: absolute; top: -20px; left: -20px; background: #ff7675;
                    border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5em;
                    cursor: pointer; box-shadow: 0 4px 0 rgba(0,0,0,0.2);
                `;
                stopBtn.onclick = () => window.app.audio.stop();
                seqDiv.appendChild(stopBtn);

                levelData.seq.forEach(item => {
                    const el = document.createElement('div');
                    el.style.cssText = `
                        width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
                        font-size: 2em; border: 2px solid #bdc3c7; border-radius: 10px;
                        background: ${item === '?' ? '#ecf0f1' : 'white'};
                        color: ${item === '?' ? '#e74c3c' : '#2c3e50'};
                        font-weight: bold; overflow: hidden;
                    `;
                    el.innerHTML = this.renderItem(item);
                    el.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 300);
                    seqDiv.appendChild(el);
                });
                this.c.appendChild(seqDiv);

                // Options Container
                const optDiv = document.createElement('div');
                optDiv.style.cssText = `
                    display: flex; gap: 20px; margin-top: 50px; justify-content: center; flex-wrap: wrap;
                `;

                levelData.opts.forEach(opt => {
                    const btn = document.createElement('button');
                    // Check if opt is an SVG key
                    if (SVG_ASSETS[opt]) {
                        btn.innerHTML = SVG_ASSETS[opt];
                        const svgEl = btn.querySelector('svg');
                        if (svgEl) {
                            svgEl.style.width = '100%';
                            svgEl.style.height = '100%';
                        }
                    } else {
                        btn.textContent = opt;
                    }

                    btn.className = 'mode-btn kid';
                    btn.style.width = '80px';
                    btn.style.height = '80px';
                    btn.style.flexShrink = '0'; // Prevent deformation
                    btn.style.padding = '5px';
                    btn.style.minWidth = '80px';
                    btn.style.background = '#a29bfe';
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';

                    btn.onclick = () => this.check(opt, levelData.ans);
                    optDiv.appendChild(btn);
                });
                this.c.appendChild(optDiv);

                // Auto Speak
                setTimeout(() => this.speakSequence(), 500);
            }

            speakSequence() {
                const levelData = this.DATA[this.mode][this.level];
                // Map special chars to words
                const map = {
                    'shape_triangle': 'Triángulo', 'shape_square': 'Cuadrado', 'shape_star': 'Estrella',
                    'shape_moon': 'Luna', 'shape_sun': 'Sol', 'shape_circle': 'Círculo',
                    '🔺': 'Triángulo', '🟦': 'Cuadrado', '⭐': 'Estrella', '🌙': 'Luna', '☀️': 'Sol',
                    '🟥': 'Cuadrado Rojo', '🔵': 'Círculo Azul', '🔴': 'Rojo', '🟢': 'Verde',
                    '🟡': 'Amarillo', '🟣': 'Morado', '⚫': 'Negro', '⚪': 'Blanco', '🟤': 'Marrón'
                };

                const text = levelData.seq.map(i => {
                    if (i === '?') return '¿Qué sigue?';
                    return map[i] || (i.toString().startsWith('shape_') ? 'Figura' : i);
                }).join(', ');

                window.app.audio.speak(text);
            }

            check(val, ans) {
                if (val === ans) {
                    window.app.audio.playWin();
                    window.app.addScore(10);
                    window.app.audio.speak('¡Correcto!');

                    const f = document.createElement('div');
                    f.textContent = 'Correcto! 🎉';
                    f.style.cssText = `
                        position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                        font-size:3em; color: #2ecc71; font-weight:bold; text-shadow: 2px 2px white;
                        animation: pop 0.5s;
                    `;
                    this.c.appendChild(f);

                    setTimeout(() => {
                        this.level++;
                        if (this.level >= this.DATA[this.mode].length) {
                            this.winCategory();
                        } else {
                            this.playLevel();
                        }
                    }, 1500);
                } else {
                    window.app.audio.playError();
                    window.app.audio.speak('Inténtalo de nuevo');
                }
            }

            winCategory() {
                this.c.innerHTML = `
                    <div style="text-align:center;">
                        <div style="font-size:5em;">🏆</div>
                        <h2>¡Serie Completada!</h2>
                        <button class="mode-btn kid" style="background:#2ecc71; margin-top:20px;" onclick="window.app.gameInstance.showMenu()">Menú Secuencias</button>
                    </div>
                `;
            }

            cleanup() { }
        }
