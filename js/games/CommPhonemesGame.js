export class CommPhonemesGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.running = true;
    this.c.style.background =
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)";
    this.c.style.position = "relative";

    document.getElementById("livesContainer").style.display = "none";

    this.phonemes = [
      {
        letter: "M",
        bubbles: [
          { word: "Manzana", icon: "🍎", correct: true },
          { word: "Mono", icon: "🐒", correct: true },
          { word: "Perro", icon: "🐶", correct: false },
          { word: "Mesa", icon: "🪑", correct: true },
        ],
      },
      {
        letter: "P",
        bubbles: [
          { word: "Pato", icon: "🦆", correct: true },
          { word: "Pelota", icon: "⚽", correct: true },
          { word: "Gato", icon: "🐱", correct: false },
          { word: "Peine", icon: "🪮", correct: true },
        ],
      },
    ];

    this.currentIndex = 0;
    this.init();
  }

  init() {
    if (this.currentIndex >= this.phonemes.length) {
      this.endGame();
      return;
    }

    this.currentData = this.phonemes[this.currentIndex];

    this.c.innerHTML = `
            <h2 style="position:absolute; top:20px; width:100%; text-align:center; color:white; font-size:2em; text-shadow:2px 2px 4px rgba(0,0,0,0.3);">
                Traza la letra ${this.currentData.letter}
            </h2>
            <canvas id="traceCanvas" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(255,255,255,0.8); border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); cursor:crosshair; touch-action:none;"></canvas>
            <div id="bubbleContainer" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;"></div>
        `;

    this.canvas = document.getElementById("traceCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Setup Canvas
    const size = Math.min(this.c.offsetWidth - 40, 400);
    this.canvas.width = size;
    this.canvas.height = size;

    this.drawTemplate();
    this.bindCanvasEvents();

    if (window.app.audio && window.app.audio.speak) {
      window.app.audio.speak(
        `Traza la letra ${this.currentData.letter}`,
        "es-ES",
      );
    }
  }

  drawTemplate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `bold ${this.canvas.height * 0.8}px Arial`;
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.currentData.letter,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );

    // Dashed outline
    this.ctx.strokeStyle = "#bdc3c7";
    this.ctx.lineWidth = 5;
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeText(
      this.currentData.letter,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );
    this.ctx.setLineDash([]);

    this.filledPixels = 0;
    this.isDrawing = false;
  }

  bindCanvasEvents() {
    const start = (e) => {
      if (!this.running) return;
      this.isDrawing = true;
      this.ctx.beginPath();
      this.ctx.lineWidth = 30;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = "#e74c3c"; // Red paint
      const pos = this.getPos(e);
      this.ctx.moveTo(pos.x, pos.y);
    };

    const move = (e) => {
      if (!this.isDrawing || !this.running) return;
      const pos = this.getPos(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();

      // Randomly check completion to save performance
      if (Math.random() < 0.1) this.checkCompletion();
    };

    const end = () => {
      this.isDrawing = false;
      this.checkCompletion();
    };

    this.canvas.addEventListener("mousedown", start);
    this.canvas.addEventListener("mousemove", move);
    this.canvas.addEventListener("mouseup", end);
    this.canvas.addEventListener("mouseleave", end);

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        start(e.touches[0]);
      },
      { passive: false },
    );
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        move(e.touches[0]);
      },
      { passive: false },
    );
    this.canvas.addEventListener("touchend", end);
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  checkCompletion() {
    // Simple heuristic: If they drew enough red pixels over the gray area.
    // Actually, for kids, just drawing *enough* red pixels is usually fine.
    const imgData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    ).data;
    let redPixels = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i] > 200 && imgData[i + 1] < 100 && imgData[i + 2] < 100) {
        redPixels++;
      }
    }

    // Threshold: 10% of canvas area
    const threshold = this.canvas.width * this.canvas.height * 0.1;
    if (redPixels > threshold) {
      this.startBubblePhase();
    }
  }

  startBubblePhase() {
    if (!this.running) return;
    this.canvas.style.pointerEvents = "none";
    window.app.audio.playWin();

    if (window.app.audio && window.app.audio.speak) {
      window.app.audio.speak(
        `¡Muy bien! Ahora explota lo que empieza por ${this.currentData.letter}`,
        "es-ES",
      );
    }

    const bc = document.getElementById("bubbleContainer");
    bc.style.pointerEvents = "auto";

    this.currentData.bubbles.forEach((b, i) => {
      const bub = document.createElement("div");
      bub.style.cssText = `
                position:absolute; width:80px; height:80px; background:rgba(255,255,255,0.9);
                border-radius:50%; border:3px solid #3498db; display:flex; flex-direction:column;
                align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.2);
                cursor:pointer; transition:transform 0.2s;
            `;
      bub.innerHTML = `<span style="font-size:2em;">${b.icon}</span>`;

      // Random pos
      bub.style.left = Math.random() * (this.c.offsetWidth - 100) + 10 + "px";
      bub.style.top = Math.random() * (this.c.offsetHeight - 100) + 10 + "px";

      // Float animation
      bub.animate(
        [
          { transform: "translateY(0px)" },
          { transform: `translateY(${Math.random() > 0.5 ? "-" : ""}20px)` },
          { transform: "translateY(0px)" },
        ],
        { duration: 2000 + Math.random() * 1000, iterations: Infinity },
      );

      bub.onclick = () => this.popBubble(b, bub);
      bc.appendChild(bub);
    });

    this.correctToPop = this.currentData.bubbles.filter(
      (b) => b.correct,
    ).length;
  }

  popBubble(bData, el) {
    if (bData.correct) {
      window.app.audio.playPop();
      window.app.addScore(5);
      el.style.transform = "scale(1.5)";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);

      this.correctToPop--;
      if (this.correctToPop <= 0) {
        setTimeout(() => {
          this.currentIndex++;
          this.init();
        }, 1000);
      }
    } else {
      window.app.audio.playError();
      el.style.background = "#e74c3c";
      setTimeout(() => (el.style.background = "rgba(255,255,255,0.9)"), 500);
    }
  }

  endGame() {
    this.running = false;
    window.app.audio.playWin();
    window.app.updateParentStats(20, 1, "arcade");

    this.c.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
                <div style="font-size: 5em;">🎉</div>
                <h2 style="color:white; font-size:3em; margin:20px 0;">¡Fonemas Completados!</h2>
                <button id="btnReplayPhonemes" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:15px; cursor:pointer;">🔄 Jugar Otra Vez</button>
            </div>
        `;

    document.getElementById("btnReplayPhonemes").onclick = () => {
      window.app.startGame(window.app.currentGameKey);
    };
  }

  cleanup() {
    this.running = false;
  }
}
