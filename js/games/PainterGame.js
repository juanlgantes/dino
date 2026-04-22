export class PainterGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.ctx = null;
                this.painting = false;
                this.color = '#FF0000'; // Default Red
                this.brushSize = 10;
                this.mode = 'menu'; // menu, canvas

                this.init();
            }

            init() {
                this.showMenu();
            }

            showMenu() {
                this.mode = 'menu';
                this.c.innerHTML = '';
                this.c.style.background = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.alignItems = 'center';
                this.c.style.justifyContent = 'center';

                const title = document.createElement('h2');
                title.textContent = '🎨 Dino Pintor';
                title.style.cssText = 'font-size: 3em; color: #333; margin-bottom: 40px;';
                this.c.appendChild(title);

                const grid = document.createElement('div');
                grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';

                const options = [
                    { id: 'blank', icon: '⚪', label: 'Lienzo Libre', color: '#ecf0f1' },
                    { id: 'shapes', icon: '🔺', label: 'Formas', color: '#fad390' },
                    { id: 'numbers', icon: '1️⃣', label: 'Números', color: '#82ccdd' },
                    { id: 'letters', icon: '🅰️', label: 'Letras', color: '#f8c291' }
                ];

                options.forEach(opt => {
                    const btn = document.createElement('div');
                    btn.className = 'mode-btn kid';
                    btn.style.cssText = `
                        background: ${opt.color}; width: 200px; height: 200px;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        font-size: 1.5em; color: #333; margin: 0;
                    `;
                    btn.innerHTML = `<div style="font-size: 4em; margin-bottom: 10px;">${opt.icon}</div>${opt.label}`;
                    btn.onclick = () => this.startCanvas(opt.id);
                    grid.appendChild(btn);
                });
                this.c.appendChild(grid);

                // Exit Button
                const exit = document.createElement('button');
                exit.textContent = '🏠 Salir';
                exit.className = 'mode-btn kid';
                exit.style.marginTop = '40px';
                exit.onclick = () => window.app.nav.goDashboard();
                this.c.appendChild(exit);
            }

            startCanvas(templateMode) {
                this.mode = 'canvas';
                this.c.innerHTML = '';
                // FIX: Use flex column for responsive layout (Canvas takes remaining space, Toolbar adapts)
                this.c.style.display = 'flex';
                this.c.style.flexDirection = 'column';
                this.c.style.background = '#f0f0f0';

                // Canvas Container (Flex Item 1)
                const canvasContainer = document.createElement('div');
                canvasContainer.style.cssText = `
                    flex: 1; width: 95%; margin: 10px auto;
                    background: white; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    overflow: hidden; touch-action: none; position: relative;
                `;
                this.c.appendChild(canvasContainer);

                this.canvas = document.createElement('canvas');
                // Use 100% to fill container, but set internal resolution match client size
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                // We need to set internal width/height after append to get correct client dimensions
                // Appending first
                canvasContainer.appendChild(this.canvas);

                // Now set resolution
                this.canvas.width = canvasContainer.clientWidth;
                this.canvas.height = canvasContainer.clientHeight;

                this.ctx = this.canvas.getContext('2d');
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';

                // Events
                this.canvas.addEventListener('mousedown', (e) => this.startPosition(e));
                this.canvas.addEventListener('mouseup', () => this.endPosition());
                this.canvas.addEventListener('mousemove', (e) => this.draw(e));
                this.canvas.addEventListener('touchstart', (e) => this.startPosition(e));
                this.canvas.addEventListener('touchend', () => this.endPosition());
                this.canvas.addEventListener('touchmove', (e) => this.draw(e));

                // Draw Template
                this.drawTemplate(templateMode);

                // Toolbar (Flex Item 2)
                this.createToolbar();
            }

            drawTemplate(mode) {
                this.ctx.save();
                this.ctx.strokeStyle = '#ddd';
                this.ctx.lineWidth = 10;
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); // Clear white first

                if (mode === 'shapes') {
                    // Circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.canvas.width * 0.3, this.canvas.height / 2, 80, 0, Math.PI * 2);
                    this.ctx.stroke();
                    // Square
                    this.ctx.beginPath();
                    this.ctx.rect(this.canvas.width * 0.6, this.canvas.height / 2 - 80, 160, 160);
                    this.ctx.stroke();
                } else if (mode === 'numbers') {
                    this.ctx.font = '200px Arial';
                    this.ctx.fillStyle = '#eee';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('1 2 3', this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.strokeText('1 2 3', this.canvas.width / 2, this.canvas.height / 2);
                } else if (mode === 'letters') {
                    this.ctx.font = '200px Arial';
                    this.ctx.fillStyle = '#eee';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('A B C', this.canvas.width / 2, this.canvas.height / 2);
                    this.ctx.strokeText('A B C', this.canvas.width / 2, this.canvas.height / 2);
                }
                this.ctx.restore();
            }

            createToolbar() {
                const bar = document.createElement('div');
                // FIX: Relative/Static positioning, flex wrap for small screens
                bar.style.cssText = `
                    width: 95%; min-height: 80px; margin: 0 auto 10px auto;
                    background: white; border-radius: 20px;
                    display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1); padding: 10px; box-sizing: border-box; flex-shrink: 0;
                `;

                // Back Button
                const btnBack = document.createElement('button');
                btnBack.textContent = '🔙';
                btnBack.onclick = () => this.showMenu();
                btnBack.style.fontSize = '2em';
                btnBack.style.background = 'none';
                btnBack.style.border = 'none';
                bar.appendChild(btnBack);

                // Colors
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#FFA500', '#000000'];
                colors.forEach(c => {
                    const ch = document.createElement('div');
                    ch.style.cssText = `
                        width: 40px; height: 40px; background: ${c}; border-radius: 50%;
                        border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor: pointer; flex-shrink: 0;
                    `;
                    ch.onclick = () => {
                        this.color = c;
                        this.brushSize = 10; // Restore size
                    };
                    bar.appendChild(ch);
                });

                // Eraser
                const btnEraser = document.createElement('button');
                btnEraser.textContent = '🧽';
                btnEraser.onclick = () => {
                    this.color = '#FFFFFF';
                    this.brushSize = 30; // Bigger eraser
                };
                btnEraser.style.fontSize = '2em';
                btnEraser.style.background = 'none';
                btnEraser.style.border = 'none';
                bar.appendChild(btnEraser);

                // Trash
                const btnTrash = document.createElement('button');
                btnTrash.textContent = '🗑️';
                btnTrash.onclick = () => {
                    // Confirmation? Nah, just clear.
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    // Re-draw template? simpler to just clear for now, or reload
                    // If we clear, we lose template. Let's restart canvas logic for simplicity to keep template?
                    // Actually, let's just fill white. If kid wants template back, go back and forth.
                };
                btnTrash.style.fontSize = '2em';
                btnTrash.style.background = 'none';
                btnTrash.style.border = 'none';
                bar.appendChild(btnTrash);

                this.c.appendChild(bar);
            }

            // Drawing Logic
            startPosition(e) {
                this.painting = true;
                this.draw(e);
            }

            endPosition() {
                this.painting = false;
                this.ctx.beginPath();
            }

            draw(e) {
                if (!this.painting) return;
                e.preventDefault();

                let x, y;
                if (e.touches) {
                    const rect = this.canvas.getBoundingClientRect();
                    x = e.touches[0].clientX - rect.left;
                    y = e.touches[0].clientY - rect.top;
                } else {
                    const rect = this.canvas.getBoundingClientRect();
                    x = e.clientX - rect.left;
                    y = e.clientY - rect.top;
                }

                this.ctx.lineWidth = this.brushSize;
                this.ctx.lineCap = 'round';
                this.ctx.strokeStyle = this.color;

                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
            }

            cleanup() {
                // Remove listeners if needed, mostly handled by DOM removal
                this.painting = false;
            }
        }
