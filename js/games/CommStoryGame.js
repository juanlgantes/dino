export class CommStoryGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.score = 0;

        this.c.style.background = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
        this.c.style.display = 'flex';
        this.c.style.flexDirection = 'column';
        this.c.style.alignItems = 'center';
        this.c.style.justifyContent = 'center';
        this.c.style.padding = '20px';
        this.c.style.boxSizing = 'border-box';

        document.getElementById('livesContainer').style.display = 'none';

        this.story = [
            { text: "Había una vez un Dino 🦕 muy despistado...", bg: "#8ec5fc" },
            { text: "Un día, fue al bosque 🌳 a pasear...", bg: "#a1c4fd" },
            { text: "Y sin darse cuenta, perdió su huevo dorado 🥚.", bg: "#fbc2eb" },
            { text: "Un amigable pajarito 🐦 lo encontró y se lo devolvió.", bg: "#a8edea" },
            { text: "Dino se puso muy feliz 😄 y le dio las gracias.", bg: "#f6d365" }
        ];

        this.questions = [
            {
                q: "¿Quién es el protagonista del cuento?",
                options: [
                    { icon: '🦕', correct: true },
                    { icon: '🦁', correct: false },
                    { icon: '🐱', correct: false }
                ]
            },
            {
                q: "¿Qué perdió Dino en el bosque?",
                options: [
                    { icon: '🍎', correct: false },
                    { icon: '🥚', correct: true },
                    { icon: '⚽', correct: false }
                ]
            },
            {
                q: "¿Quién encontró el huevo?",
                options: [
                    { icon: '🐦', correct: true },
                    { icon: '🐶', correct: false },
                    { icon: '🐸', correct: false }
                ]
            }
        ];

        this.currentSlide = 0;
        this.currentQuestion = 0;

        this.initStory();
    }

    initStory() {
        this.c.innerHTML = `
            <div id="storyContainer" style="width:100%; max-width:600px; background:white; padding:40px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1); text-align:center; transition: background 0.5s;">
                <div id="storyText" style="font-size:2.5em; font-weight:bold; color:#2c3e50; margin-bottom:40px; min-height:150px; display:flex; align-items:center; justify-content:center;"></div>
                <div style="display:flex; justify-content:space-between;">
                    <button id="btnPrev" style="padding:15px 30px; font-size:1.5em; background:#95a5a6; color:white; border:none; border-radius:10px; cursor:pointer; visibility:hidden;">⬅️</button>
                    <button id="btnNext" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px; cursor:pointer;">➡️ Continuar</button>
                </div>
            </div>
        `;

        this.textEl = document.getElementById('storyText');
        this.btnPrev = document.getElementById('btnPrev');
        this.btnNext = document.getElementById('btnNext');

        this.btnPrev.onclick = () => {
            if (this.currentSlide > 0) {
                this.currentSlide--;
                this.renderSlide();
            }
        };

        this.btnNext.onclick = () => {
            this.currentSlide++;
            if (this.currentSlide < this.story.length) {
                this.renderSlide();
            } else {
                this.startQuestions();
            }
        };

        this.renderSlide();
    }

    renderSlide() {
        if (!this.running) return;
        const s = this.story[this.currentSlide];
        this.textEl.textContent = s.text;
        document.getElementById('storyContainer').style.background = s.bg;

        this.btnPrev.style.visibility = this.currentSlide > 0 ? 'visible' : 'hidden';
        this.btnNext.innerHTML = this.currentSlide === this.story.length - 1 ? '❓ ¡A las preguntas!' : '➡️ Continuar';

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(s.text, 'es-ES');
        }
    }

    startQuestions() {
        this.c.innerHTML = `
            <div id="qScore" style="position:absolute; top:20px; right:20px; font-size:2em; font-weight:bold; background:white; padding:5px 15px; border-radius:20px;">Score: 0</div>
            <div id="qContainer" style="width:100%; max-width:600px; text-align:center;">
                <div id="qText" style="font-size:2.5em; font-weight:bold; color:white; text-shadow:2px 2px 4px rgba(0,0,0,0.5); margin-bottom:40px;"></div>
                <div id="qOptions" style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;"></div>
            </div>
        `;

        this.qTextEl = document.getElementById('qText');
        this.qOptionsEl = document.getElementById('qOptions');

        this.renderQuestion();
    }

    renderQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        const q = this.questions[this.currentQuestion];
        this.qTextEl.textContent = q.q;
        this.qOptionsEl.innerHTML = '';

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(q.q, 'es-ES');
        }

        const shuffled = [...q.options].sort(() => Math.random() - 0.5);

        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.style.cssText = `
                width: 150px; height: 150px; background: white; border: none; border-radius: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: pointer; font-size: 5em;
                display: flex; align-items: center; justify-content: center; transition: transform 0.2s;
            `;
            btn.innerHTML = opt.icon;

            btn.onclick = () => {
                if (!this.running) return;
                if (opt.correct) {
                    window.app.audio.playWin();
                    btn.style.background = '#2ecc71';
                    btn.style.transform = 'scale(1.1)';
                    this.score++;
                    document.getElementById('qScore').textContent = 'Score: ' + this.score;
                    window.app.addScore(5);

                    this.currentQuestion++;
                    setTimeout(() => this.renderQuestion(), 1500);
                } else {
                    window.app.audio.playError();
                    btn.style.background = '#e74c3c';
                    btn.animate([
                        { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
                    ], { duration: 300 });
                    setTimeout(() => btn.style.background = 'white', 1000);
                }
            };

            this.qOptionsEl.appendChild(btn);
        });
    }

    endGame() {
        this.running = false;
        window.app.audio.playWin();
        window.app.updateParentStats(20, 1, 'quiz');

        this.c.innerHTML = `
            <div style="font-size: 5em;">🎓</div>
            <h2 style="color:white; font-size:3em; margin:20px 0; text-shadow:2px 2px 4px rgba(0,0,0,0.5);">¡Comprensión Perfecta!</h2>
            <button id="btnReplayStory" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:15px; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2);">🔄 Leer de Nuevo</button>
        `;

        document.getElementById('btnReplayStory').onclick = () => window.app.startGame(window.app.currentGameKey);
    }

    cleanup() {
        this.running = false;
    }
}