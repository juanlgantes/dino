export class EnglishWeatherGame {
    constructor(data, container) {
        this.data = data;
        this.c = container;
        this.running = true;
        this.currentWeather = 'sunny'; // default

        // Setup UI
        this.c.style.transition = 'background 1s';
        this.c.style.position = 'relative';
        this.c.style.overflow = 'hidden';

        document.getElementById('livesContainer').style.display = 'none';

        this.weathers = [
            { id: 'sunny', label: 'It\'s sunny', bg: '#f1c40f', icon: '☀️' },
            { id: 'rainy', label: 'It\'s rainy', bg: '#34495e', icon: '🌧️', effect: 'rain' },
            { id: 'snowy', label: 'It\'s snowy', bg: '#ecf0f1', icon: '❄️', effect: 'snow' },
            { id: 'windy', label: 'It\'s windy', bg: '#95a5a6', icon: '💨' }
        ];

        this.init();
    }

    init() {
        this.c.innerHTML = `
            <div id="weatherBg" style="position:absolute; width:100%; height:100%; top:0; left:0; z-index:0; transition: background 1s;"></div>
            <div id="effectLayer" style="position:absolute; width:100%; height:100%; top:0; left:0; z-index:1; pointer-events:none;"></div>

            <div id="dinoWeather" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); font-size:6em; z-index:5; transition: transform 0.5s;">🦕</div>

            <div id="questionModal" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:20; display:none; backdrop-filter: blur(2px);">
                <h1 style="color:white; font-size:3em; margin-bottom:20px;">What's the weather?</h1>
                <div id="weatherOptions" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;"></div>
                <div style="margin-top:30px; display:flex; flex-direction:column; align-items:center;">
                    <button id="btnMicWeather" style="padding:15px; border-radius:50%; font-size:2em; background:#e74c3c; color:white; border:none; box-shadow:0 0 15px #e74c3c;">🎤</button>
                    <span id="micStatus" style="color:white; margin-top:10px;">Tap to speak</span>
                </div>
            </div>

            <div id="colorBonus" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:10px; z-index:10;"></div>
        `;

        this.bgEl = document.getElementById('weatherBg');
        this.effectEl = document.getElementById('effectLayer');
        this.dinoEl = document.getElementById('dinoWeather');
        this.modal = document.getElementById('questionModal');
        this.optionsContainer = document.getElementById('weatherOptions');

        this.setWeather('sunny');

        // Start event cycle
        this.eventTimer = setTimeout(() => this.triggerEvent(), 3000);

        this.setupMic();
    }

    setWeather(id) {
        const w = this.weathers.find(x => x.id === id);
        this.currentWeather = id;
        this.bgEl.style.background = w.bg;

        // Clear effects
        this.effectEl.innerHTML = '';

        if (w.effect === 'rain') {
            this.createParticles('💧', 20, '#3498db');
            this.dinoEl.innerHTML = '🦕☔';
        } else if (w.effect === 'snow') {
            this.createParticles('❄️', 20, 'white');
            this.dinoEl.innerHTML = '🦕🧣';
        } else if (w.id === 'windy') {
            this.createParticles('🍃', 10, '#2ecc71', true);
            this.dinoEl.innerHTML = '🦕💨';
            this.dinoEl.style.transform = 'translate(-50%, -50%) rotate(-15deg)';
        } else {
            this.dinoEl.innerHTML = '🦕🕶️';
            this.dinoEl.style.transform = 'translate(-50%, -50%)';
        }
    }

    createParticles(char, count, color, horizontal = false) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.textContent = char;
            p.style.position = 'absolute';
            p.style.color = color;
            p.style.fontSize = (Math.random() * 1.5 + 0.5) + 'em';

            if (horizontal) {
                p.style.top = (Math.random() * 100) + '%';
                p.style.left = '-10%';
                p.style.animation = `windAnim ${Math.random() * 2 + 2}s linear infinite`;
            } else {
                p.style.left = (Math.random() * 100) + '%';
                p.style.top = '-10%';
                p.style.animation = `fallAnim ${Math.random() * 2 + 1}s linear infinite`;
            }
            this.effectEl.appendChild(p);
        }

        // Add styles if not exists
        if (!document.getElementById('weatherStyles')) {
            const style = document.createElement('style');
            style.id = 'weatherStyles';
            style.innerHTML = `
                @keyframes fallAnim { to { top: 110%; } }
                @keyframes windAnim { to { left: 110%; } }
            `;
            document.head.appendChild(style);
        }
    }

    triggerEvent() {
        if (!this.running) return;

        // Pick random weather different from current
        let next;
        do {
            next = this.weathers[Math.floor(Math.random() * this.weathers.length)];
        } while (next.id === this.currentWeather);

        this.targetWeather = next;

        // VISUAL FIX: Change the weather visually FIRST so the player knows what to answer.
        this.setWeather(next.id);

        this.modal.style.display = 'flex';

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak("What's the weather?", 'en-US');
        }

        // Populate options
        this.optionsContainer.innerHTML = '';
        this.weathers.forEach(w => {
            const btn = document.createElement('button');
            btn.innerHTML = `${w.icon} ${w.label}`;
            btn.style.cssText = `padding:15px; font-size:1.5em; border-radius:10px; border:none; background:white; cursor:pointer; font-weight:bold;`;
            btn.onclick = () => this.checkAnswer(w.id);
            this.optionsContainer.appendChild(btn);
        });
    }

    setupMic() {
        const btn = document.getElementById('btnMicWeather');
        const status = document.getElementById('micStatus');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            status.textContent = 'Voice not supported, use buttons';
            btn.style.opacity = '0.5';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            status.textContent = 'You said: ' + transcript;

            // Fuzzy match
            if (transcript.includes(this.targetWeather.id)) {
                this.checkAnswer(this.targetWeather.id);
            } else {
                window.app.audio.playError();
                status.textContent = 'Try again! (' + transcript + ')';
            }
        };

        this.recognition.onerror = (e) => {
            status.textContent = 'Error: ' + e.error;
        };

        btn.onclick = () => {
            try {
                this.recognition.start();
                status.textContent = 'Listening...';
            } catch (e) {
                // Ignore if already started
            }
        };
    }

    checkAnswer(id) {
        if (id === this.targetWeather.id) {
            window.app.audio.playWin();
            window.app.addScore(5);
            this.modal.style.display = 'none';

            // Pop animation on Dino to celebrate
            this.dinoEl.animate([
                { transform: 'translate(-50%, -50%) scale(1)' },
                { transform: 'translate(-50%, -50%) scale(1.3)' },
                { transform: 'translate(-50%, -50%) scale(1)' }
            ], { duration: 300 });

            // Queue next event
            this.eventTimer = setTimeout(() => this.triggerEvent(), 6000 + Math.random() * 4000);

            // Sometimes trigger a Color Bonus
            if (Math.random() > 0.5) {
                setTimeout(() => this.triggerColorBonus(), 3000);
            }
        } else {
            window.app.audio.playError();
            // Shake modal
            this.modal.animate([
                { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    }

    triggerColorBonus() {
        if (!this.running || this.modal.style.display === 'flex') return;

        const colors = [
            { name: 'red', hex: '#e74c3c' },
            { name: 'blue', hex: '#3498db' },
            { name: 'green', hex: '#2ecc71' },
            { name: 'yellow', hex: '#f1c40f' }
        ];

        const target = colors[Math.floor(Math.random() * colors.length)];

        const banner = document.createElement('div');
        banner.style.cssText = `
            position:absolute; top:20px; left:50%; transform:translateX(-50%);
            background:white; padding:10px 20px; border-radius:20px; border:4px solid ${target.hex};
            font-size:1.5em; font-weight:bold; z-index:15;
        `;
        banner.innerHTML = `Say or click: <span style="color:${target.hex}">${target.name.toUpperCase()}</span> for shield!`;
        this.c.appendChild(banner);

        if (window.app.audio && window.app.audio.speak) {
            window.app.audio.speak(`Say ${target.name}`, 'en-US');
        }

        const container = document.getElementById('colorBonus');
        container.innerHTML = '';
        colors.forEach(c => {
            const btn = document.createElement('button');
            btn.style.cssText = `width:50px; height:50px; border-radius:50%; background:${c.hex}; border:none; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);`;
            btn.onclick = () => {
                if (c.name === target.name) {
                    this.activateShield(target.hex);
                    banner.remove();
                    container.innerHTML = '';
                } else {
                    window.app.audio.playError();
                }
            };
            container.appendChild(btn);
        });

        setTimeout(() => {
            if (banner.parentNode) banner.remove();
            container.innerHTML = '';
        }, 5000);
    }

    activateShield(color) {
        window.app.audio.playPop();
        window.app.addScore(5);
        this.dinoEl.style.boxShadow = `0 0 30px 10px ${color}`;
        this.dinoEl.style.borderRadius = '50%';
        this.dinoEl.style.background = 'rgba(255,255,255,0.5)';

        setTimeout(() => {
            if (!this.running) return;
            this.dinoEl.style.boxShadow = 'none';
            this.dinoEl.style.background = 'transparent';
        }, 4000);
    }

    cleanup() {
        this.running = false;
        clearTimeout(this.eventTimer);
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e){}
        }
    }
}