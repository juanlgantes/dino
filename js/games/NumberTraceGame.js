export class NumberTraceGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.numbers = this.generateNumberPaths();
        this.currentNumber = null;
        this.completedNumbers = new Set();
        this.lives = 3;

        // Tracing state
        this.points = [];
        this.isTracing = false;
        this.traceWidth = 20; // thick brush
        this.boundWidth = 40; // width of allowed trace path
        this.lastValidPoint = null;
        this.traceLines = []; // Store drawn lines

        // Bind events once in constructor to prevent memory leaks
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);

        this.init();
    }

    generateNumberPaths() {
        // Normalised paths for 0 to 9.
        // The points array defines the thick path the player has to trace.
        // It's a sequence of {x, y} from 0.0 to 1.0.
        const basePaths = {
            0: [{x:0.5, y:0.1}, {x:0.3, y:0.2}, {x:0.2, y:0.5}, {x:0.3, y:0.8}, {x:0.5, y:0.9}, {x:0.7, y:0.8}, {x:0.8, y:0.5}, {x:0.7, y:0.2}, {x:0.5, y:0.1}],
            1: [{x:0.4, y:0.3}, {x:0.5, y:0.1}, {x:0.5, y:0.9}],
            2: [{x:0.3, y:0.3}, {x:0.5, y:0.1}, {x:0.7, y:0.3}, {x:0.7, y:0.5}, {x:0.3, y:0.9}, {x:0.7, y:0.9}],
            3: [{x:0.3, y:0.2}, {x:0.5, y:0.1}, {x:0.7, y:0.2}, {x:0.7, y:0.4}, {x:0.5, y:0.5}, {x:0.7, y:0.6}, {x:0.7, y:0.8}, {x:0.5, y:0.9}, {x:0.3, y:0.8}],
            4: [{x:0.6, y:0.9}, {x:0.6, y:0.1}, {x:0.2, y:0.6}, {x:0.8, y:0.6}],
            5: [{x:0.7, y:0.1}, {x:0.3, y:0.1}, {x:0.3, y:0.5}, {x:0.5, y:0.4}, {x:0.7, y:0.5}, {x:0.7, y:0.8}, {x:0.5, y:0.9}, {x:0.3, y:0.8}],
            6: [{x:0.7, y:0.1}, {x:0.4, y:0.3}, {x:0.3, y:0.6}, {x:0.5, y:0.9}, {x:0.7, y:0.7}, {x:0.5, y:0.5}, {x:0.3, y:0.6}],
            7: [{x:0.2, y:0.1}, {x:0.8, y:0.1}, {x:0.4, y:0.9}],
            8: [{x:0.5, y:0.5}, {x:0.3, y:0.3}, {x:0.5, y:0.1}, {x:0.7, y:0.3}, {x:0.5, y:0.5}, {x:0.3, y:0.7}, {x:0.5, y:0.9}, {x:0.7, y:0.7}, {x:0.5, y:0.5}],
            9: [{x:0.7, y:0.4}, {x:0.5, y:0.5}, {x:0.3, y:0.3}, {x:0.5, y:0.1}, {x:0.7, y:0.4}, {x:0.6, y:0.7}, {x:0.3, y:0.9}],
        };

        const paths = {};
        for(let i=0; i<=9; i++) {
            paths[i] = basePaths[i];
        }

        // Generate 10-20 based on combining digits
        for(let i=10; i<=20; i++) {
            const str = i.toString();
            const p1 = basePaths[parseInt(str[0])].map(p => ({x: p.x * 0.45, y: p.y}));
            const p2 = basePaths[parseInt(str[1])].map(p => ({x: p.x * 0.45 + 0.55, y: p.y}));

            // For numbers with two digits, we'll split the tracing into two parts using a null divider
            paths[i] = [...p1, null, ...p2];
        }

        return paths;
    }

    init() {
        this.c.innerHTML = "";
        this.c.style.background = "#fff8e7"; // Lighter style matching app
        this.c.style.display = "flex";
        this.c.style.flexDirection = "column";
        this.c.style.alignItems = "center";

        if (this.currentNumber === null) {
            this.showMenu();
        } else {
            this.showGame();
        }
    }

    showMenu() {
        this.c.innerHTML = "";

        const header = document.createElement("div");
        header.style.textAlign = "center";
        header.style.margin = "20px 0";
        header.innerHTML = `<h2 style="color:#2980b9; margin:0">✍️ Trazar Números</h2>
                            <p style="color:#7f8c8d; margin-top:5px;">¡Elige un número para practicar!</p>`;
        this.c.appendChild(header);

        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(60px, 1fr))";
        grid.style.gap = "10px";
        grid.style.width = "90%";
        grid.style.maxWidth = "500px";

        for (let i = 0; i <= 20; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.style.fontSize = "1.5em";
            btn.style.padding = "10px";
            btn.style.borderRadius = "15px";
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            btn.style.transition = "transform 0.1s";

            if (this.completedNumbers.has(i)) {
                btn.style.background = "#2ecc71";
                btn.style.color = "white";
            } else {
                btn.style.background = "#3498db";
                btn.style.color = "white";
            }

            btn.onmousedown = () => btn.style.transform = "scale(0.95)";
            btn.onmouseup = () => btn.style.transform = "scale(1)";
            btn.onmouseleave = () => btn.style.transform = "scale(1)";

            btn.onclick = () => {
                this.currentNumber = i;
                this.startGame();
            };

            grid.appendChild(btn);
        }

        this.c.appendChild(grid);

        const exit = document.createElement("button");
        exit.textContent = "🏠 Salir";
        exit.className = "mode-btn kid";
        exit.style.marginTop = "30px";
        exit.onclick = () => window.app.nav.goBackFromGame();
        this.c.appendChild(exit);
    }

    startGame() {
        this.lives = 3;
        this.points = [];
        this.traceLines = [];
        this.isTracing = false;
        this.lastValidPoint = null;
        this.showGame();
    }

    showGame() {
        this.c.innerHTML = "";

        // UI Header
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.width = "90%";
        header.style.maxWidth = "500px";
        header.style.marginTop = "10px";

        const backBtn = document.createElement("button");
        backBtn.textContent = "⬅️ Menú";
        backBtn.style.fontSize = "1.2em";
        backBtn.style.background = "none";
        backBtn.style.border = "none";
        backBtn.style.cursor = "pointer";
        backBtn.onclick = () => {
            this.currentNumber = null;
            this.showMenu();
        };

        const title = document.createElement("h2");
        title.style.color = "#2c3e50";
        title.style.margin = "0";
        title.textContent = `Número ${this.currentNumber}`;

        this.livesContainer = document.createElement("div");
        this.livesContainer.style.fontSize = "1.5em";
        this.updateLivesDisplay();

        header.appendChild(backBtn);
        header.appendChild(title);
        header.appendChild(this.livesContainer);
        this.c.appendChild(header);

        // Canvas Setup
        const canvasContainer = document.createElement("div");
        canvasContainer.style.position = "relative";
        canvasContainer.style.margin = "20px";
        this.c.appendChild(canvasContainer);

        this.canvas = document.createElement("canvas");
        this.canvas.style.background = "white";
        this.canvas.style.borderRadius = "20px";
        this.canvas.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";

        const size = Math.min(this.c.clientWidth - 40, 500);
        this.canvas.width = size;
        this.canvas.height = size;
        // Improve resolution for retina
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = `${size}px`;
        this.canvas.style.height = `${size}px`;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;

        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(dpr, dpr);
        this.canvasSize = size;

        canvasContainer.appendChild(this.canvas);

        // Generate actual path coordinates based on canvas size
        this.generateLevelPath();

        // Bind events
        this.canvas.addEventListener("mousedown", this.handleStart);
        this.canvas.addEventListener("mousemove", this.handleMove);
        window.addEventListener("mouseup", this.handleEnd);

        this.canvas.addEventListener("touchstart", this.handleStart, {passive: false});
        this.canvas.addEventListener("touchmove", this.handleMove, {passive: false});
        window.addEventListener("touchend", this.handleEnd);

        this.draw();
    }

    updateLivesDisplay() {
        if(this.livesContainer) {
            this.livesContainer.textContent = "❤️".repeat(this.lives) + "🤍".repeat(3 - this.lives);
        }
    }

    generateLevelPath() {
        const rawPath = this.numbers[this.currentNumber];
        this.levelPaths = []; // Array of strokes
        this.completedStrokes = 0;
        let currentStroke = [];

        for (const p of rawPath) {
            if (p === null) {
                if (currentStroke.length > 0) {
                    this.levelPaths.push(currentStroke);
                    currentStroke = [];
                }
            } else {
                // Pad inwards a bit
                currentStroke.push({
                    x: p.x * (this.canvasSize * 0.8) + (this.canvasSize * 0.1),
                    y: p.y * (this.canvasSize * 0.8) + (this.canvasSize * 0.1)
                });
            }
        }
        if (currentStroke.length > 0) {
            this.levelPaths.push(currentStroke);
        }

        // Determine start points and end points for all strokes
        this.startPoints = this.levelPaths.map(stroke => stroke[0]);
        this.goalPoints = this.levelPaths.map(stroke => stroke[stroke.length - 1]);
    }

    getPointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let cx, cy;
        if (e.touches && e.touches.length > 0) {
            cx = e.touches[0].clientX - rect.left;
            cy = e.touches[0].clientY - rect.top;
        } else {
            cx = e.clientX - rect.left;
            cy = e.clientY - rect.top;
        }
        return { x: cx, y: cy, time: Date.now() };
    }

    handleStart(e) {
        e.preventDefault();
        const pos = this.getPointerPos(e);

        // If we lost a life and are continuing, we check if they clicked near the last valid point
        let canStart = false;

        if (this.lastValidPoint) {
            const dist = this.distance(pos, this.lastValidPoint);
            if (dist < 50) canStart = true;
        } else {
            // If they are just starting, allow starting from first point of CURRENT stroke
            if (this.completedStrokes < this.levelPaths.length) {
                 if (this.distance(pos, this.startPoints[this.completedStrokes]) < 50) canStart = true;
            }
        }

        if (canStart) {
            this.isTracing = true;
            this.points = [pos];
            this.draw();
        }
    }

    handleMove(e) {
        if (!this.isTracing) return;
        e.preventDefault();

        const pos = this.getPointerPos(e);

        // Boundary Check
        // We find the closest distance to the CURRENT stroke's path
        const currentStrokePath = this.levelPaths[this.completedStrokes];
        const distToPath = this.distanceToStroke(pos, currentStrokePath);

        if (distToPath > this.boundWidth / 2) {
            // Out of bounds!
            this.loseLife();
            return;
        }

        // Add point
        this.points.push(pos);
        this.lastValidPoint = pos;

        // Draw the trace segment (bezier smooth)
        this.draw();

        // Check win condition for current stroke
        if (this.distance(pos, this.goalPoints[this.completedStrokes]) < 40) {
            this.finishStroke();
        }
    }

    finishStroke() {
        this.isTracing = false;
        if (this.points.length > 0) {
            this.traceLines.push([...this.points]);
            this.points = [];
        }

        this.completedStrokes++;
        this.lastValidPoint = null; // Clear so they have to start at the next start point

        if (this.completedStrokes >= this.levelPaths.length) {
            this.winNumber();
        } else {
            window.app.audio.playPop(); // Small feedback for finishing part of the number
            this.draw();
        }
    }

    handleEnd(e) {
        if (this.isTracing) {
            this.isTracing = false;
            if (this.points.length > 0) {
                this.traceLines.push([...this.points]);
                this.points = [];
            }
            this.draw();
        }
    }

    loseLife() {
        // Do not stop tracing entirely, just flush the current valid line so far,
        // and let them keep holding the pointer to continue.
        if (this.points.length > 0) {
            this.traceLines.push([...this.points]);
            this.points = [];
        }

        this.lives--;
        this.updateLivesDisplay();
        window.app.audio.playError();

        // Visual indicator of error
        this.ctx.fillStyle = "rgba(231, 76, 60, 0.5)";
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        setTimeout(() => this.draw(), 200);

        if (this.lives <= 0) {
            // Reset this number
            setTimeout(() => {
                this.startGame();
            }, 500);
        }
    }

    winNumber() {
        this.isTracing = false;
        if (this.points.length > 0) {
            this.traceLines.push([...this.points]);
            this.points = [];
        }
        this.draw();

        window.app.audio.playWin();
        this.completedNumbers.add(this.currentNumber);

        if (this.completedNumbers.size >= 21) {
            setTimeout(() => this.winGame(), 1000);
        } else {
            setTimeout(() => {
                this.currentNumber = null; // back to menu
                this.showMenu();
            }, 1500);
        }
    }

    distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Distance from a point to a line segment
    distanceToSegment(p, v, w) {
        const l2 = (v.x - w.x)*(v.x - w.x) + (v.y - w.y)*(v.y - w.y);
        if (l2 == 0) return this.distance(p, v);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.distance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    }

    distanceToStroke(point, stroke) {
        let minDist = Infinity;
        for (let i = 0; i < stroke.length - 1; i++) {
            const dist = this.distanceToSegment(point, stroke[i], stroke[i+1]);
            if (dist < minDist) minDist = dist;
        }
        return minDist;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

        // Draw the background thick path
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        for (const stroke of this.levelPaths) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#ecf0f1"; // Light gray track
            this.ctx.lineWidth = this.boundWidth;
            for (let i = 0; i < stroke.length; i++) {
                if (i === 0) this.ctx.moveTo(stroke[i].x, stroke[i].y);
                else this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            this.ctx.stroke();

            // Draw inner dash line
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#bdc3c7";
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([10, 10]);
            for (let i = 0; i < stroke.length; i++) {
                if (i === 0) this.ctx.moveTo(stroke[i].x, stroke[i].y);
                else this.ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Start and End indicators for CURRENT stroke
        if (this.completedStrokes < this.levelPaths.length) {
            const currentStart = this.startPoints[this.completedStrokes];
            this.ctx.beginPath();
            this.ctx.arc(currentStart.x, currentStart.y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = "#2ecc71"; // Green start
            this.ctx.fill();

            const currentGoal = this.goalPoints[this.completedStrokes];
            this.ctx.beginPath();
            this.ctx.arc(currentGoal.x, currentGoal.y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = "#e74c3c"; // Red end
            this.ctx.fill();
        }

        // Draw last valid point if tracing paused
        if (!this.isTracing && this.lastValidPoint && this.points.length === 0) {
            this.ctx.beginPath();
            this.ctx.arc(this.lastValidPoint.x, this.lastValidPoint.y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = "#f1c40f"; // Yellow continue point
            this.ctx.fill();
            this.ctx.strokeStyle = "#d35400";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw Player Trace Lines
        this.ctx.strokeStyle = "#3498db"; // Blue ink
        this.ctx.lineWidth = this.traceWidth;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        // Render previous strokes
        for (const line of this.traceLines) {
            this.drawSmoothCurve(line);
        }

        // Render current stroke
        if (this.points.length > 0) {
            this.drawSmoothCurve(this.points);
        }
    }

    drawSmoothCurve(pts) {
        if (pts.length === 0) return;
        if (pts.length < 3) {
            this.ctx.beginPath();
            this.ctx.moveTo(pts[0].x, pts[0].y);
            for(let i=1; i<pts.length; i++) {
                this.ctx.lineTo(pts[i].x, pts[i].y);
            }
            this.ctx.stroke();
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);

        // Quadratic bezier interpolation for smooth signature_pad like strokes
        for (let i = 1; i < pts.length - 2; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2;
            const yc = (pts[i].y + pts[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }

        // curve through the last two points
        const last = pts.length - 1;
        this.ctx.quadraticCurveTo(
            pts[last - 1].x,
            pts[last - 1].y,
            pts[last].x,
            pts[last].y
        );

        this.ctx.stroke();
    }

    winGame() {
        this.c.innerHTML = "";
        const winDiv = document.createElement("div");
        winDiv.style.textAlign = "center";

        winDiv.innerHTML = `
            <div style="font-size: 6em;">🏆</div>
            <h1 style="color:#2c3e50">¡Has completado todos!</h1>
            <p style="font-size:1.5em; color:#7f8c8d">¡Eres un experto escribiendo números!</p>
            <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
            <div style="height:10px"></div>
            <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Volver</button>
        `;
        this.c.appendChild(winDiv);

        window.app.audio.playWin();
        // Award stars
        window.app.updateParentStats(20, 1, "number_trace");
    }

    cleanup() {
        if (this.canvas) {
            this.canvas.removeEventListener("mousedown", this.handleStart);
            this.canvas.removeEventListener("mousemove", this.handleMove);
            this.canvas.removeEventListener("touchstart", this.handleStart);
            this.canvas.removeEventListener("touchmove", this.handleMove);
        }
        window.removeEventListener("mouseup", this.handleEnd);
        window.removeEventListener("touchend", this.handleEnd);
    }
}
