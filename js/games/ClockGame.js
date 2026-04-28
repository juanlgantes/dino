export class ClockGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.mode = "free"; // free, challenge
    this.difficulty = "hard"; // easy, hard
    this.hours = 12;
    this.minutes = 0;
    this.targetTime = { h: 3, m: 0 };
    this.score = 0;
    this.init();
  }

  init() {
    this.c.style.background =
      "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)";
    this.c.style.overflowY = "auto"; // Re-enable scrolling explicitly
    this.c.innerHTML = "";

    // Inject Responsive Styles for this game
    const styleId = "clock-game-style";
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();

    const s = document.createElement("style");
    s.id = styleId;
    s.innerHTML = `
                        .clock-layout {
                            display: flex; width: 100%; height: 100%;
                            flex-direction: column; /* Default: Portrait (Mobile) */
                            align-items: center; justify-content: flex-start; /* Start from top */
                            gap: 5px; padding: 10px; box-sizing: border-box;
                            overflow-y: auto; /* Allow Scroll on small phones */
                        }
                        /* Controls */
                        .clock-controls {
                            display: flex; flex-wrap: wrap;
                            justify-content: center; gap: 8px;
                            width: 100%;
                        }
                        .clock-controls .mode-btn {
                            font-size: 3.5vmin !important; /* Dynamic Font */
                            padding: 1vmin 2vmin !important;
                            margin: 0 !important;
                        }
                        /* Main Content Area */
                        .clock-content {
                            flex-grow: 1; display: flex;
                            flex-direction: column; align-items: center; justify-content: center;
                            width: 100%; position: relative;
                        }
                        /* Clock Face - Resizable */
                        .clock-face-v2 {
                            width: 50vmin; height: 50vmin; /* Reduced from 60 to fit better */
                            border-radius: 50%; border: 1vmin solid white;
                            position: relative;
                            margin: 10px 0; /* Add Breathing room */
                            box-shadow: 0 1vmin 3vmin rgba(0,0,0,0.4);
                            touch-action: none;
                            flex-shrink: 0;
                        }
                        .clock-number-v2 {
                            position: absolute; color: white;
                            font-size: 6vmin; font-weight: bold;
                            text-shadow: 0 0.2vmin 0.5vmin black;
                            transform: translate(-50%, -50%);
                        }
                        /* Hands */
                        .hand-hour-v2 {
                            position: absolute; bottom: 50%; left: 50%;
                            width: 2vmin; height: 16vmin;
                            background: #333; border-radius: 2vmin;
                            transform-origin: bottom center; z-index: 10;
                            box-shadow: 0 0 1vmin rgba(0,0,0,0.5);
                        }
                        .hand-min-v2 {
                            position: absolute; bottom: 50%; left: 50%;
                            width: 1vmin; height: 22vmin;
                            background: #e74c3c; border-radius: 1vmin;
                            transform-origin: bottom center; z-index: 10;
                            box-shadow: 0 0 1vmin rgba(0,0,0,0.5);
                        }
                        .clock-center-v2 {
                            position: absolute; top: 50%; left: 50%;
                            width: 4vmin; height: 4vmin; background: white;
                            border-radius: 50%; transform: translate(-50%, -50%);
                            z-index: 20; box-shadow: 0 0.5vmin 1vmin black;
                        }
                        .digital-box {
                            background: #2c3e50; border-radius: 2vmin;
                            border: 0.5vmin solid #95a5a6;
                            padding: 1vmin 2vmin;
                            text-align: center; margin-top: 10px;
                            /* Static Flow for Mobile */
                            position: static;
                            margin-bottom: 20px;
                        }
                        .digital-text {
                            font-family: 'Courier New', monospace; color: #0f0;
                            font-size: 6vmin; line-height: 1;
                        }

                        /* --- LANDSCAPE MOBILE (Small Screens) --- */
                        @media (min-aspect-ratio: 1/1) and (max-width: 1024px) {
                            .clock-layout {
                                flex-direction: row;
                                justify-content: center;
                                align-items: stretch; /* Ensure full height to avoid entering clipping */
                                gap: 20px;
                            }
                            .clock-controls {
                                flex-direction: column; width: auto;
                                align-items: flex-end; justify-content: center;
                                height: 100%;
                            }
                            .clock-controls .mode-btn {
                                font-size: 4vmin !important;
                            }
                            .clock-face-v2 {
                                width: 50vmin; height: 50vmin; /* Reduced further */
                            }
                            .clock-content {
                                flex-direction: column; /* Stack Title, Clock, Digital */
                                gap: 10px;
                                flex-grow: 1;
                                justify-content: flex-start; /* Start from top to avoid clipping */
                                padding-top: 10px;
                                overflow-y: auto; /* Ensure scroll if needed */
                            }
                            .clock-content h2 {
                                position: static; /* Natural flow */
                                width: auto;
                                font-size: 5vmin;
                                margin-bottom: 5px;
                            }
                        }

                        /* --- DESKTOP PC (Large Screens) --- */
                        @media (min-width: 1025px) {
                            .clock-layout {
                                flex-direction: row;
                                justify-content: center;
                                gap: 40px; /* Spacious gap for PC */
                                max-width: 1200px; /* Constrain width on huge monitors */
                                margin: 0 auto;
                            }
                            .clock-controls {
                                flex-direction: column; width: 200px; /* Fixed width sidebar */
                                align-items: center; /* Center buttons in sidebar */
                                justify-content: center;
                                gap: 20px;
                            }
                            .clock-controls .mode-btn {
                                font-size: 24px !important; /* Fixed pixel size for PC precision */
                                width: 100%;
                                cursor: pointer;
                                transition: transform 0.2s;
                            }
                            .clock-controls .mode-btn:hover {
                                transform: scale(1.05); /* Hover effect only for PC */
                            }
                            .clock-face-v2 {
                                width: 500px; height: 500px; /* Fixed large size */
                                border-width: 8px;
                            }
                            .clock-number-v2 {
                                font-size: 40px;
                            }
                            .clock-content {
                                flex-direction: row;
                                gap: 30px;
                                flex-grow: 0;
                                align-items: center;
                            }
                            .clock-content h2 {
                                position: static; /* Natural flow in PC is fine usually, or keep absolute */
                                margin-bottom: 20px;
                                width: auto;
                                font-size: 48px;
                            }
                            /* Re-structure content for PC: Title Top, Clock + Digital Row */
                            .clock-content {
                                flex-direction: column; /* Stack Title and (Clock+Digital) */
                            }
                            /* Wrap Clock and Digital in a row container?
                               Actually, let's keep it simple: layout row.
                            */
                        }
                    `;
    document.head.appendChild(s);

    // --- DOM STRUCTURE ---

    const layout = document.createElement("div");
    layout.className = "clock-layout";
    this.c.appendChild(layout);

    // 1. Controls (Sidebar/Topbar)
    const controls = document.createElement("div");
    controls.className = "clock-controls";
    controls.innerHTML = `
                    <button id="btnModeFree" class="mode-btn kid" style="background:#f1c40f;">🔓 Libre</button>
                    <button id="btnModeChal" class="mode-btn kid" style="background:#ecf0f1; color:#333;">🏆 Reto</button>
                    <button id="btnDiff" class="mode-btn kid" style="background:#3498db;">🤓 Difícil</button>
                    <button id="btnNow" class="mode-btn kid" style="background:#9b59b6;">🕒 Ahora</button>
                    <button id="btnCheck" class="mode-btn kid" style="background:#2ecc71; display:none;">✅ OK</button>
                `;
    layout.appendChild(controls);

    // 2. Main Content
    const content = document.createElement("div");
    content.className = "clock-content";
    layout.appendChild(content);

    this.msgEl = document.createElement("h2");
    this.msgEl.style.cssText =
      "width:100%; text-align:center; color:white; font-size: 5vmin; margin: 5px 0; z-index:50; text-shadow: 0 0.5vmin 1vmin black; flex-shrink: 0;";
    this.msgEl.textContent = "¡Explora!";
    content.appendChild(this.msgEl);

    // CLOCK
    const clock = document.createElement("div");
    clock.className = "clock-face-v2";
    // Cake Gradient
    clock.style.background = `conic-gradient(#f1c40f 0deg 90deg, #2ecc71 90deg 180deg, #3498db 180deg 270deg, #e74c3c 270deg 360deg)`;

    // Numbers
    for (let i = 1; i <= 12; i++) {
      const num = document.createElement("div");
      num.className = "clock-number-v2";
      num.textContent = i;
      const angle = (i * 30 - 90) * (Math.PI / 180);
      // Radius in % for CSS relative positioning
      const r = 42;
      const x = 50 + Math.cos(angle) * r;
      const y = 50 + Math.sin(angle) * r;
      num.style.left = x + "%";
      num.style.top = y + "%";
      clock.appendChild(num);
    }

    // Hands
    this.hHand = document.createElement("div");
    this.hHand.className = "hand-hour-v2";
    clock.appendChild(this.hHand);

    this.mHand = document.createElement("div");
    this.mHand.className = "hand-min-v2";
    clock.appendChild(this.mHand);

    const center = document.createElement("div");
    center.className = "clock-center-v2";
    clock.appendChild(center);

    // Overlay
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute; width:100%; height:100%; top:0; left:0; z-index: 30; cursor: pointer;";
    clock.appendChild(overlay);

    content.appendChild(clock);

    // Digital
    this.digitBox = document.createElement("div");
    this.digitBox.className = "digital-box";
    this.digitBox.innerHTML =
      '<div style="color:#bdc3c7; font-size:2vmin;">DIGITAL</div>';

    this.digitalEl = document.createElement("div");
    this.digitalEl.className = "digital-text";
    this.digitBox.appendChild(this.digitalEl);

    content.appendChild(this.digitBox);

    // 3. Logic Binding
    this.btnCheck = document.getElementById("btnCheck");

    this.bindEvents(overlay);
    document.getElementById("btnModeFree").onclick = () => this.setMode("free");
    document.getElementById("btnModeChal").onclick = () =>
      this.setMode("challenge");
    document.getElementById("btnDiff").onclick = () => this.toggleDifficulty();
    document.getElementById("btnNow").onclick = () => this.setNow();
    this.btnCheck.onclick = () => this.checkChallenge();

    this.updateVisuals();
  }

  bindEvents(el) {
    const handleMove = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - cx;
      const dy = clientY - cy;

      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle += 90;
      if (angle < 0) angle += 360;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = rect.width / 2;
      const distPercent = (dist / radius) * 100;

      if (distPercent < 60 || this.difficulty === "easy") {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        this.hours = h;
        if (this.difficulty === "easy") this.minutes = 0;
      } else {
        const snapMin = Math.round(angle / 6 / 5) * 5;
        this.minutes = snapMin % 60;
      }
      this.updateVisuals();
    };

    const stopDrag = () => {
      el.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };

    el.addEventListener("mousedown", (e) => {
      el.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", stopDrag);
      handleMove(e);
    });

    el.addEventListener("touchmove", handleMove, { passive: false });
    el.addEventListener("touchstart", handleMove, { passive: false });
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === "free") {
      this.msgEl.textContent = "¡Explora!";
      this.btnCheck.style.display = "none";
      this.digitBox.style.opacity = "1";
    } else {
      this.btnCheck.style.display = "inline-block"; // Show check in sidebar
      this.digitBox.style.opacity = "0";
      this.newChallenge();
    }
  }

  toggleDifficulty() {
    this.difficulty = this.difficulty === "hard" ? "easy" : "hard";
    const btn = document.getElementById("btnDiff");

    if (this.difficulty === "easy") {
      btn.textContent = "👶 Fácil";
      btn.style.background = "#2ecc71";
      this.mHand.style.display = "none";
      this.minutes = 0;
    } else {
      btn.textContent = "🤓 Difícil";
      btn.style.background = "#3498db";
      this.mHand.style.display = "block";
    }
    this.updateVisuals();
  }

  setNow() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    h = h % 12;
    if (h === 0) h = 12;
    this.hours = h;
    if (this.difficulty === "easy") {
      this.minutes = 0;
    } else {
      this.minutes = Math.round(m / 5) * 5;
    }
    window.app.audio.playPop();
    this.updateVisuals();
  }

  newChallenge() {
    const h = Math.floor(Math.random() * 12) + 1;
    this.targetTime = { h, m: 0 };
    this.msgEl.textContent =
      this.difficulty === "easy" ? `Pon las ${h}` : `Pon las ${h}:00`;
  }

  checkChallenge() {
    if (this.hours === this.targetTime.h && this.minutes === 0) {
      window.app.audio.playWin();
      window.app.addScore(10);
      this.msgEl.innerHTML = '<span style="color:#f1c40f">¡SÍ! 🎉</span>';
      setTimeout(() => this.newChallenge(), 2000);
    } else {
      window.app.audio.playError();
      this.msgEl.textContent = "¡No! 🦕";
    }
  }

  updateVisuals() {
    const mAngle = this.minutes * 6;
    const hAngle = (this.hours % 12) * 30 + this.minutes * 0.5;

    this.mHand.style.transform = `translateX(-50%) rotate(${mAngle}deg)`;
    this.hHand.style.transform = `translateX(-50%) rotate(${hAngle}deg)`;

    // Digital
    const h = this.hours;
    const m = this.minutes.toString().padStart(2, "0");
    this.digitalEl.textContent = `${h}:${m}`;
  }

  cleanup() {
    // Remove style if we wanted to be super clean, but ID prevents dupes.
  }
}
