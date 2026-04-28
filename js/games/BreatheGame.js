export class BreatheGame {
  constructor(data, container) {
    this.container = container;
    this.isRunning = false;
    this.phase = "inhale"; // 'inhale', 'hold', 'exhale'
    this.timer = null;
    this.cycles = 0;
    this.maxCycles = 3;
  }

  init() {
    this.container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px;">
                <h2 style="color: #3498db; font-size: 2em; text-align: center; margin-bottom: 30px;">Respira con Dino</h2>

                <div style="position: relative; width: 250px; height: 250px; display: flex; align-items: center; justify-content: center;">
                    <!-- Circle Animation -->
                    <div id="breatheCircle" style="
                        position: absolute;
                        width: 100px;
                        height: 100px;
                        background: radial-gradient(circle, #89f7fe 0%, #66a6ff 100%);
                        border-radius: 50%;
                        opacity: 0.6;
                        transition: all 4s ease-in-out;
                    "></div>

                    <!-- Dino Center -->
                    <div style="font-size: 4em; z-index: 10;">🦕</div>
                </div>

                <div id="breatheText" style="font-size: 2.5em; font-weight: bold; color: #2c3e50; margin-top: 40px; transition: color 1s;">
                    ¡Prepárate!
                </div>

                <button id="btnStartBreathe" style="
                    margin-top: 40px;
                    padding: 15px 40px;
                    font-size: 1.5em;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">▶️ Empezar</button>
            </div>
        `;

    document.getElementById("btnStartBreathe").onclick = () => {
      document.getElementById("btnStartBreathe").style.display = "none";
      this.startBreathing();
    };
  }

  startBreathing() {
    this.isRunning = true;
    this.cycles = 0;
    if (window.app && window.app.audio) {
      window.app.audio.speak("Vamos a respirar profundamente.");
    }

    setTimeout(() => this.inhale(), 2000);
  }

  inhale() {
    if (!this.isRunning) return;

    const circle = document.getElementById("breatheCircle");
    const text = document.getElementById("breatheText");

    if (circle) {
      circle.style.width = "250px";
      circle.style.height = "250px";
      circle.style.background =
        "radial-gradient(circle, #a8edea 0%, #fed6e3 100%)";
    }

    if (text) {
      text.textContent = "Respira...";
      text.style.color = "#3498db";
    }

    if (window.app && window.app.audio)
      window.app.audio.speak("Toma aire por la nariz");

    this.timer = setTimeout(() => this.hold(), 4000);
  }

  hold() {
    if (!this.isRunning) return;

    const text = document.getElementById("breatheText");
    if (text) {
      text.textContent = "Mantén...";
      text.style.color = "#f39c12";
    }

    this.timer = setTimeout(() => this.exhale(), 2000);
  }

  exhale() {
    if (!this.isRunning) return;

    const circle = document.getElementById("breatheCircle");
    const text = document.getElementById("breatheText");

    if (circle) {
      circle.style.width = "100px";
      circle.style.height = "100px";
      circle.style.background =
        "radial-gradient(circle, #89f7fe 0%, #66a6ff 100%)";
    }

    if (text) {
      text.textContent = "Suelta...";
      text.style.color = "#2ecc71";
    }

    if (window.app && window.app.audio)
      window.app.audio.speak("Suelta el aire por la boca");

    this.cycles++;

    this.timer = setTimeout(() => {
      if (this.cycles < this.maxCycles) {
        this.inhale();
      } else {
        this.finish();
      }
    }, 4000);
  }

  finish() {
    const text = document.getElementById("breatheText");
    if (text) {
      text.textContent = "¡Muy bien! Estás relajado.";
      text.style.color = "#8e44ad";
    }

    const btn = document.getElementById("btnStartBreathe");
    if (btn) {
      btn.style.display = "block";
      btn.textContent = "🔄 Repetir";
    }

    if (window.app) {
      if (window.app.audio)
        window.app.audio.speak("¡Lo hiciste genial! Estás muy relajado.");
      window.app.addScore(10); // Reward for relaxing!
      const rect = this.container.getBoundingClientRect();
      window.app.playConfetti(rect.width / 2, rect.height / 2);
    }
  }

  startGame() {
    this.init();
  }

  cleanup() {
    this.isRunning = false;
    if (this.timer) clearTimeout(this.timer);
    this.container.innerHTML = "";
  }
}
