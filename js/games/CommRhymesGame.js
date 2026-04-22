export class CommRhymesGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.running = true;
    this.score = 0;

    this.c.style.background =
      "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)";
    this.c.style.display = "flex";
    this.c.style.flexDirection = "column";
    this.c.style.alignItems = "center";
    this.c.style.justifyContent = "center";

    document.getElementById("livesContainer").style.display = "none";

    this.rhymes = [
      {
        text: "Un pajarito me dijo al oído...\npío, pío, pío, tengo mucho...",
        options: [
          { word: "frío", icon: "🥶", correct: true },
          { word: "hambre", icon: "🍗", correct: false },
          { word: "sueño", icon: "😴", correct: false },
        ],
      },
      {
        text: "Amarillo es el sol,\namarillo el limón,\namarillo es el...",
        options: [
          { word: "corazón", icon: "❤️", correct: false },
          { word: "girasol", icon: "🌻", correct: true },
          { word: "cielo", icon: "☁️", correct: false },
        ],
      },
      {
        text: "Salto, salto como un conejito,\ny me como un rico...",
        options: [
          { word: "helado", icon: "🍦", correct: false },
          { word: "pastel", icon: "🍰", correct: false },
          { word: "huevito", icon: "🥚", correct: true },
        ],
      },
    ];

    this.currentRhymeIndex = 0;
    this.init();
  }

  init() {
    this.c.innerHTML = `
            <div id="rhymeScore" style="position:absolute; top:20px; right:20px; font-size:2em; font-weight:bold; background:white; padding:5px 15px; border-radius:20px;">Estrellas: 0</div>

            <div style="font-size:5em; margin-bottom:20px;">🎵</div>

            <div id="rhymeText" style="font-size:2.5em; font-weight:bold; color:#2c3e50; text-align:center; margin-bottom:40px; background:white; padding:30px; border-radius:20px; box-shadow:0 10px 20px rgba(0,0,0,0.1); width:80%; max-width:600px; white-space:pre-wrap;"></div>

            <div id="rhymeOptions" style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;"></div>
        `;

    this.textEl = document.getElementById("rhymeText");
    this.optionsContainer = document.getElementById("rhymeOptions");

    this.loadRhyme();
  }

  loadRhyme() {
    if (this.currentRhymeIndex >= this.rhymes.length) {
      this.endGame();
      return;
    }

    const rhyme = this.rhymes[this.currentRhymeIndex];
    this.textEl.textContent = rhyme.text;
    this.optionsContainer.innerHTML = "";

    if (window.app.audio && window.app.audio.speak) {
      window.app.audio.speak(rhyme.text, "es-ES");
    }

    // Shuffle options
    const shuffled = [...rhyme.options].sort(() => Math.random() - 0.5);

    shuffled.forEach((opt) => {
      const btn = document.createElement("button");
      btn.style.cssText = `
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                width: 150px; height: 150px; background: white; border: none; border-radius: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;
            `;
      btn.innerHTML = `
                <span style="font-size:4em;">${opt.icon}</span>
                <span style="font-size:1.5em; font-weight:bold; margin-top:10px;">${opt.word}</span>
            `;

      btn.onclick = () => this.checkAnswer(opt, btn);
      this.optionsContainer.appendChild(btn);
    });
  }

  checkAnswer(opt, btn) {
    if (!this.running) return;

    if (opt.correct) {
      window.app.audio.playWin();
      btn.style.background = "#2ecc71";
      btn.style.color = "white";
      btn.style.transform = "scale(1.1)";

      this.textEl.textContent =
        this.rhymes[this.currentRhymeIndex].text +
        " " +
        opt.word.toUpperCase() +
        "!";
      if (window.app.audio && window.app.audio.speak) {
        window.app.audio.speak(opt.word, "es-ES");
      }

      this.score += 5;
      document.getElementById("rhymeScore").textContent =
        "Estrellas: " + this.score;
      window.app.addScore(5);

      this.currentRhymeIndex++;
      setTimeout(() => this.loadRhyme(), 2500);
    } else {
      window.app.audio.playError();
      btn.style.background = "#e74c3c";
      btn.style.color = "white";
      btn.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 300 },
      );

      setTimeout(() => {
        btn.style.background = "white";
        btn.style.color = "black";
      }, 1000);
    }
  }

  endGame() {
    this.running = false;
    window.app.audio.playWin();
    window.app.updateParentStats(15, 1, "quiz");

    this.c.innerHTML = `
            <div style="font-size: 5em;">🌟</div>
            <h2 style="color:#2c3e50; font-size:3em; margin:20px 0;">¡Poeta Experto!</h2>
            <button id="btnReplayRhymes" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:15px; cursor:pointer;">🔄 Jugar Otra Vez</button>
        `;

    document.getElementById("btnReplayRhymes").onclick = () => {
      window.app.startGame(window.app.currentGameKey);
    };
  }

  cleanup() {
    this.running = false;
  }
}
