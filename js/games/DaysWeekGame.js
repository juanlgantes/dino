export class DaysWeekGame {
            constructor(data, container) {
                this.data = data;
                this.c = container;
                this.lang = 'es'; // es | en
                this.isReviewing = false;
                this.isBonusRound = false;
                this.bonusQuestionsCount = 0;
                this.maxBonusQuestions = 3;
                this.isCyclePhase = false;
                this.cycleRoundCount = 0;

                this.activities = {
                    school: ['🎒', '📚', '🏫', '✏️', '🚌', '📓'],
                    home: ['⚽', '🎮', '🧸', '🌳', '🏠', '🛌']
                };

                this.daysConfig = {
                    es: [
                        { name: 'Lunes', color: '#bdc3c7', icon: '🌑', note: 261.63, type: 'school' },
                        { name: 'Martes', color: '#e74c3c', icon: '🔴', note: 293.66, type: 'school' },
                        { name: 'Miércoles', color: '#e67e22', icon: '🟠', note: 329.63, type: 'school' },
                        { name: 'Jueves', color: '#9b59b6', icon: '⚡', note: 349.23, type: 'school' },
                        { name: 'Viernes', color: '#ff9ff3', icon: '💖', note: 392.00, type: 'school' },
                        { name: 'Sábado', color: '#2ecc71', icon: '🌳', note: 440.00, type: 'home' },
                        { name: 'Domingo', color: '#f1c40f', icon: '☀️', note: 493.88, type: 'home' }
                    ],
                    en: [
                        { name: 'Monday', color: '#bdc3c7', icon: '🌑', note: 261.63, type: 'school' },
                        { name: 'Tuesday', color: '#e74c3c', icon: '🔴', note: 293.66, type: 'school' },
                        { name: 'Wednesday', color: '#e67e22', icon: '🟠', note: 329.63, type: 'school' },
                        { name: 'Thursday', color: '#9b59b6', icon: '⚡', note: 349.23, type: 'school' },
                        { name: 'Friday', color: '#ff9ff3', icon: '💖', note: 392.00, type: 'school' },
                        { name: 'Saturday', color: '#2ecc71', icon: '🌳', note: 440.00, type: 'home' },
                        { name: 'Sunday', color: '#f1c40f', icon: '☀️', note: 493.88, type: 'home' }
                    ]
                };

                this.init();
            }

            init() {
                this.c.innerHTML = '';
                this.c.style.cssText = 'background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); display:flex; flex-direction:column; align-items:center; padding:10px; font-family:"Fredoka",sans-serif; height:100%; overflow:hidden;';

                const title = document.createElement('h2');
                title.textContent = '📅 Días de la Semana';
                title.style.cssText = 'color:#d63384; font-size:3em; margin-bottom:30px; text-align:center; text-shadow:2px 2px 0 white;';
                this.c.appendChild(title);

                const btnES = document.createElement('button');
                btnES.className = 'mode-btn kid';
                btnES.innerHTML = '🇪🇸 Español';
                btnES.style.marginBottom = '20px';
                btnES.onclick = () => this.startGame('es');

                const btnEN = document.createElement('button');
                btnEN.className = 'mode-btn kid';
                btnEN.innerHTML = '🇬🇧 English';
                btnEN.style.background = '#3498db';
                btnEN.onclick = () => this.startGame('en');

                this.c.appendChild(btnES);
                this.c.appendChild(btnEN);
            }

            startGame(lang) {
                this.lang = lang;
                this.currentStep = 0;
                this.isReviewing = false;
                this.isBonusRound = false;
                this.bonusQuestionsCount = 0;
                this.isCyclePhase = false;
                this.cycleRoundCount = 0;
                // Shuffle config objects
                this.shuffled = [...this.daysConfig[lang]].sort(() => Math.random() - 0.5);
                this.renderGame();
                this.playPrompt();
            }

            playPrompt() {
                if (this.isReviewing) return;
                this.clearHint();
                const target = this.daysConfig[this.lang][this.currentStep];
                const text = this.lang === 'es' ?
                    `Busca: ${target.name}. ${target.icon}` :
                    `Find: ${target.name}. ${target.icon}`;

                window.app.audio.speak(text, this.lang === 'es' ? 'es-ES' : 'en-US');
                this.startHintTimer();
            }

            startHintTimer() {
                if (this.isReviewing) return;
                this.clearHint();
                this.hintTimeout = setTimeout(() => {
                    // Visual Hint: Pulse the correct button
                    const correctBtn = Array.from(document.querySelectorAll('.day-option-btn'))
                        .find(b => b.textContent.includes(this.daysConfig[this.lang][this.currentStep].name));

                    if (correctBtn) {
                        correctBtn.animate([
                            { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
                            { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' },
                            { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' }
                        ], { duration: 1000, iterations: Infinity });

                        // Audio Hint
                        const t = this.daysConfig[this.lang][this.currentStep];
                        const hintText = this.lang === 'es' ?
                            `Mira, es de color ${this.getColorName(t.color)}. ¡El ${t.name}!` :
                            `Look! It's ${t.name}!`;
                        window.app.audio.speak(hintText, this.lang === 'es' ? 'es-ES' : 'en-US');
                    }
                }, 8000); // 8 seconds patience
            }

            clearHint() {
                if (this.hintTimeout) clearTimeout(this.hintTimeout);
                // Stop animations if any (hard to target specific animation via JS API without ref, but re-render clears it)
            }

            getColorName(hex) {
                // Quick helper for Spanish hints
                if (hex === '#e74c3c') return 'rojo';
                if (hex === '#f1c40f') return 'amarillo';
                if (hex === '#2ecc71') return 'verde';
                if (hex === '#3498db') return 'azul';
                if (hex === '#9b59b6') return 'morado';
                if (hex === '#e67e22') return 'naranja';
                if (hex === '#bdc3c7') return 'gris';
                if (hex === '#ff9ff3') return 'rosa';
                return 'bonito';
            }

            renderGame() {
                this.c.innerHTML = '';
                this.c.style.justifyContent = 'space-between';

                // 1. Train / Timeline - Now with interactions!
                const trainContainer = document.createElement('div');
                trainContainer.id = 'days-train-container'; // ID for animation
                trainContainer.style.cssText = 'display:flex; gap:5px; padding:10px; width:100%; overflow-x:auto; background:rgba(255,255,255,0.5); border-radius:15px; margin-bottom:10px; min-height:90px; align-items:center; position:relative;';

                this.daysConfig[this.lang].forEach((dayObj, i) => {
                    const slot = document.createElement('div');
                    const isFilled = i < this.currentStep;

                    slot.style.cssText = `
                        min-width: 80px; height: 70px; border: 2px dashed #d63384;
                        border-radius: 10px; display:flex; flex-direction:column; align-items:center; justify-content:center;
                        font-weight:bold; color: #d63384; background: ${isFilled ? '#fff' : 'transparent'};
                        flex-shrink: 0; font-size: 1.1em; border-style: ${isFilled ? 'solid' : 'dashed'};
                        transition: all 0.3s;
                        cursor: ${isFilled && this.isReviewing ? 'pointer' : 'default'};
                    `;

                    // ID for review targeting
                    slot.id = `day-slot-${i}`;

                    if (isFilled) {
                        slot.innerHTML = `<span style="font-size:1.5em">${dayObj.icon}</span><span>${dayObj.name}</span>`;
                        slot.style.border = `3px solid ${dayObj.color}`;
                        slot.style.color = '#333';

                        // Interactive Piano Note when reviewing
                        if (this.isReviewing) {
                            slot.onclick = () => {
                                window.app.audio.playTone(dayObj.note, 'sine', 0.3);
                                slot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], 200);
                            };
                        }

                    } else {
                        slot.textContent = (i + 1);
                        if (i === this.currentStep) {
                            slot.style.background = 'rgba(255,255,255,0.3)';
                            slot.style.transform = 'scale(1.1)';
                            slot.style.borderColor = '#fff';
                        }
                    }
                    trainContainer.appendChild(slot);
                });
                this.c.appendChild(trainContainer);

                // 2. Instructions / Review Message
                const instr = document.createElement('div');
                if (this.isReviewing) {
                    instr.textContent = this.lang === 'es' ? '¡Repite conmigo!' : 'Repeat with me!';
                } else {
                    const target = this.daysConfig[this.lang][this.currentStep];
                    if (target) {
                        instr.innerHTML = this.lang === 'es' ?
                            `Busca: <span style="color:${target.color}; font-size:1.2em">${target.name} ${target.icon}</span>` :
                            `Find: <span style="color:${target.color}; font-size:1.2em">${target.name} ${target.icon}</span>`;
                    }
                }
                instr.style.cssText = 'font-size:1.5em; color:#fff; margin:10px; text-align:center; font-weight:bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);';
                this.c.appendChild(instr);

                // 3. Options (Hidden during review)
                if (!this.isReviewing) {
                    const optionsContainer = document.createElement('div');
                    optionsContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:15px; justify-content:center; padding:20px; flex-grow:1; align-content:flex-start;';

                    this.shuffled.forEach(dayObj => {
                        const correctSeq = this.daysConfig[this.lang];
                        const idxCorrect = correctSeq.findIndex(d => d.name === dayObj.name);
                        if (idxCorrect < this.currentStep) return;

                        const btn = document.createElement('button');
                        btn.className = 'mode-btn kid day-option-btn';
                        btn.innerHTML = `<div style="font-size:1.5em; margin-bottom:5px;">${dayObj.icon}</div>${dayObj.name}`;
                        btn.style.cssText = `
                            font-size:1.1em; padding:10px 15px;
                            background: white; color: #333;
                            box-shadow: 0 5px 0 ${dayObj.color};
                            border-bottom: 5px solid ${dayObj.color};
                            margin:0; width:auto; min-width: 100px;
                        `;

                        btn.onclick = () => {
                            const langCode = this.lang === 'es' ? 'es-ES' : 'en-US';
                            window.app.audio.speak(dayObj.name, langCode);
                            this.check(dayObj, btn);
                        };
                        optionsContainer.appendChild(btn);
                    });
                    this.c.appendChild(optionsContainer);
                }

                // Controls
                this.addControls();
            }

            addControls() {
                const exit = document.createElement('button');
                exit.textContent = '🏠';
                exit.className = 'nav-btn';
                exit.style.position = 'absolute';
                exit.style.bottom = '10px';
                exit.style.left = '10px';
                exit.onclick = () => { this.clearHint(); window.app.nav.goBackFromGame(); };
                this.c.appendChild(exit);

                const stopBtn = document.createElement('button');
                stopBtn.textContent = '🤫';
                stopBtn.className = 'nav-btn';
                stopBtn.style.position = 'absolute';
                stopBtn.style.bottom = '10px';
                stopBtn.style.right = '10px';
                stopBtn.onclick = () => window.app.audio.stop();
                this.c.appendChild(stopBtn);
            }

            check(selectedObj, btnEl) {
                this.clearHint();
                const correctObj = this.daysConfig[this.lang][this.currentStep];

                if (selectedObj.name === correctObj.name) {
                    window.app.audio.playPop();
                    this.playConfetti(btnEl);
                    this.currentStep++;

                    if (this.currentStep >= 7) {
                        this.startReviewPhase(); // TRIGGER REVIEW INSTEAD OF WIN
                    } else {
                        setTimeout(() => {
                            this.renderGame();
                            this.playPrompt();
                        }, 500);
                    }
                } else {
                    window.app.audio.playError();
                    btnEl.animate([
                        { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
                    ], 300);

                    const feedback = this.lang === 'es' ?
                        `Ese es ${selectedObj.name}. Busca ${correctObj.name}.` :
                        `That is ${selectedObj.name}. Find ${correctObj.name}.`;
                    window.app.audio.speak(feedback, this.lang === 'es' ? 'es-ES' : 'en-US');
                    this.startHintTimer();
                }
            }

            startReviewPhase() {
                this.isReviewing = true;
                this.renderGame(); // Re-render to show simplified view (no options)

                const intro = this.lang === 'es' ?
                    '¡Tren completo! Ahora, repite conmigo para ganar tu premio.' :
                    'Train complete! Now, repeat with me to win your prize.';

                window.app.audio.speak(intro, this.lang === 'es' ? 'es-ES' : 'en-US');

                // Sequence the review
                let delay = 4000; // Wait for intro
                const days = this.daysConfig[this.lang];

                days.forEach((day, index) => {
                    setTimeout(() => {
                        // 1. Highlight Slot
                        const slot = document.getElementById(`day-slot-${index}`);
                        if (slot) {
                            slot.style.transform = 'scale(1.3)';
                            slot.style.zIndex = '10';
                            slot.style.boxShadow = '0 0 20px white';
                        }

                        // 2. Play Note & Speak
                        window.app.audio.playTone(day.note, 'sine', 0.5);
                        window.app.audio.speak(day.name, this.lang === 'es' ? 'es-ES' : 'en-US');

                        // 3. Reset after a bit
                        setTimeout(() => {
                            if (slot) {
                                slot.style.transform = 'scale(1)';
                                slot.style.zIndex = '1';
                                slot.style.boxShadow = 'none';
                            }
                        }, 1500);

                    }, delay);
                    delay += 2500; // Gap for child to repeat
                });

                // Trigger Animation instead of immediate win
                setTimeout(() => {
                    this.animateTrainJourney();
                }, delay + 500);
            }

            animateTrainJourney() {
                const train = document.getElementById('days-train-container');
                if (!train) { this.winGame(); return; }

                // Sound Effect: "Choo Choo" (Two quick notes interactively)
                window.app.audio.playTone(523.25, 'square', 0.1); // C5
                setTimeout(() => window.app.audio.playTone(698.46, 'square', 0.2), 150); // F5

                // 1. Depart to Right
                const departAnim = train.animate([
                    { transform: 'translateX(0)', easing: 'ease-in-out' },
                    { transform: 'translateX(-30px)', easing: 'ease-out' }, // Anticipation
                    { transform: 'translateX(150%)', easing: 'ease-in' }   // Fly off
                ], { duration: 1200 });

                departAnim.onfinish = () => {
                    // 2. Return from Left
                    train.style.transform = 'translateX(-150%)'; // Move to left side instantly

                    const returnAnim = train.animate([
                        { transform: 'translateX(-150%)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 1000, easing: 'ease-out' });
                    // Whoosh sound
                    window.app.audio.playTone(100, 'sawtooth', 0.5);

                    returnAnim.onfinish = () => {
                        // 3. Arrived! Start Bonus Round!
                        setTimeout(() => this.startBonusRound(), 500);
                    };
                };
            }

            startBonusRound() {
                this.isBonusRound = true;
                this.renderBonusRound();
            }

            renderBonusRound() {
                this.c.innerHTML = '';
                this.c.style.justifyContent = 'center';

                if (this.bonusQuestionsCount >= this.maxBonusQuestions) {
                    this.startCyclePhase(); // Go to Wheel
                    return;
                }

                // Pick random day
                const randomDay = this.daysConfig[this.lang][Math.floor(Math.random() * 7)];
                const isSchool = randomDay.type === 'school';

                // Question
                const question = document.createElement('div');
                question.innerHTML = this.lang === 'es' ?
                    `¿Qué hacemos el <br><span style="font-size:1.5em; color:${randomDay.color}">${randomDay.name} ${randomDay.icon}</span>?` :
                    `What do we do on <br><span style="font-size:1.5em; color:${randomDay.color}">${randomDay.name} ${randomDay.icon}</span>?`;
                question.style.cssText = 'font-size:2em; color:#fff; text-align:center; font-weight:bold; margin-bottom:40px; text-shadow:2px 2px 4px rgba(0,0,0,0.2);';
                this.c.appendChild(question);

                window.app.audio.speak(question.textContent, this.lang === 'es' ? 'es-ES' : 'en-US');

                // Options
                const optionsDiv = document.createElement('div');
                optionsDiv.style.cssText = 'display:flex; gap:30px; justify-content:center;';

                // Prepare Correct and Wrong options
                const correctPool = isSchool ? this.activities.school : this.activities.home;
                const wrongPool = isSchool ? this.activities.home : this.activities.school;

                const correctIcon = correctPool[Math.floor(Math.random() * correctPool.length)];
                const wrongIcon = wrongPool[Math.floor(Math.random() * wrongPool.length)];

                // Shuffle placement
                const opts = [
                    { icon: correctIcon, isCorrect: true },
                    { icon: wrongIcon, isCorrect: false }
                ].sort(() => Math.random() - 0.5);

                opts.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.textContent = opt.icon;
                    btn.className = 'mode-btn kid';
                    btn.style.cssText = 'font-size:4em; padding:20px 40px; border-radius:30px; background:white; box-shadow:0 10px 0 rgba(0,0,0,0.1); transition:transform 0.2s;';

                    btn.onclick = () => {
                        if (opt.isCorrect) {
                            window.app.audio.playPop();
                            this.playConfetti(btn);
                            btn.style.background = '#2ecc71';

                            const praise = this.lang === 'es' ? '¡Sí! ¡Correcto!' : 'Yes! Correct!';
                            window.app.audio.speak(praise, this.lang === 'es' ? 'es-ES' : 'en-US');

                            setTimeout(() => {
                                this.bonusQuestionsCount++;
                                this.renderBonusRound();
                            }, 1500);
                        } else {
                            window.app.audio.playError();
                            btn.animate([
                                { transform: 'rotate(0)' }, { transform: 'rotate(-10deg)' },
                                { transform: 'rotate(10deg)' }, { transform: 'rotate(0)' }
                            ], 300);

                            const correction = this.lang === 'es' ?
                                (isSchool ? `No, el ${randomDay.name} vamos a la escuela.` : `No, el ${randomDay.name} estamos en casa.`) :
                                (isSchool ? `No, on ${randomDay.name} we go to school.` : `No, on ${randomDay.name} we are at home.`);
                            window.app.audio.speak(correction, this.lang === 'es' ? 'es-ES' : 'en-US');
                        }
                    };
                    optionsDiv.appendChild(btn);
                });

                this.c.appendChild(optionsDiv);

                // Controls
                this.addControls();
            }

            startCyclePhase() {
                this.isCyclePhase = true;
                this.cycleRoundCount = 0;

                const intro = this.lang === 'es' ?
                    '¡Ya casi! Ahora la Rueda del Tiempo.' :
                    'Almost there! Now the Wheel of Time.';
                window.app.audio.speak(intro, this.lang === 'es' ? 'es-ES' : 'en-US');

                setTimeout(() => this.renderCycleRound(), 2000);
            }

            renderCycleRound() {
                this.c.innerHTML = '';
                this.c.style.justifyContent = 'center';
                this.c.style.position = 'relative'; // For absolute positioning of wheel items

                if (this.cycleRoundCount >= 3) {
                    this.winGame();
                    return;
                }

                // Logic: Pick a start day. Ensure specific rounds cover Sat/Sun
                let seedIndex;
                if (this.cycleRoundCount === 2) {
                    seedIndex = 6; // Force Sunday -> Monday check on last round
                } else {
                    seedIndex = Math.floor(Math.random() * 6); // 0-5
                }

                const currentDay = this.daysConfig[this.lang][seedIndex];
                const nextIndex = (seedIndex + 1) % 7;
                const nextDay = this.daysConfig[this.lang][nextIndex];

                // Title
                const title = document.createElement('h2');
                title.textContent = this.lang === 'es' ? '¿Qué va después?' : 'What comes next?';
                title.style.cssText = 'position:absolute; top:20px; color:#d63384; font-size:2em; width:100%; text-align:center;';
                this.c.appendChild(title);

                // Wheel Container
                const wheelSize = 300;
                const wheel = document.createElement('div');
                wheel.style.cssText = `
                    width:${wheelSize}px; height:${wheelSize}px; border: 5px dashed rgba(255,255,255,0.5);
                    border-radius:50%; position:relative; display:flex; justify-content:center; align-items:center;
                    margin-top: 40px;
                `;

                // Center Prompt
                const center = document.createElement('div');
                center.style.cssText = 'text-align:center; z-index:10; background:white; padding:20px; border-radius:50%; box-shadow:0 10px 20px rgba(0,0,0,0.1); width:120px; height:120px; display:flex; flex-direction:column; justify-content:center; align-items:center;';
                center.innerHTML = `<div style="font-size:2.5em;">${currentDay.icon}</div><div style="font-weight:bold; color:${currentDay.color}">${currentDay.name}</div><div style="font-size:2em; color:#333; margin-top:-5px;">⤵️</div>`;
                wheel.appendChild(center);

                // Orbiting Days
                this.daysConfig[this.lang].forEach((day, i) => {
                    const angle = (i * 2 * Math.PI) / 7 - (Math.PI / 2); // Start at top (-90deg)
                    const r = wheelSize / 2;
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);

                    const planet = document.createElement('button');
                    planet.className = 'mode-btn kid';
                    planet.innerHTML = day.icon; // Just icon to keep clean
                    planet.style.cssText = `
                        position:absolute; left:50%; top:50%; width:60px; height:60px;
                        margin-left:-30px; margin-top:-30px; border-radius:50%; padding:0;
                        transform: translate(${x}px, ${y}px); background: white; font-size:2em;
                        box-shadow: 0 4px 0 ${day.color}; border: 2px solid ${day.color};
                    `;

                    planet.onclick = () => {
                        if (day.name === nextDay.name) {
                            window.app.audio.playPop();
                            planet.style.background = '#2ecc71';
                            planet.style.transform += ' scale(1.3)';

                            const phrase = this.lang === 'es' ?
                                `¡Sí! Después del ${currentDay.name} va el ${nextDay.name}.` :
                                `Yes! After ${currentDay.name} comes ${nextDay.name}.`;
                            window.app.audio.speak(phrase, this.lang === 'es' ? 'es-ES' : 'en-US');

                            setTimeout(() => {
                                this.cycleRoundCount++;
                                this.renderCycleRound();
                            }, 2000);
                        } else {
                            window.app.audio.playError();
                            planet.animate([
                                { transform: `translate(${x}px, ${y}px) scale(1)` },
                                { transform: `translate(${x}px, ${y}px) scale(0.9)` },
                                { transform: `translate(${x}px, ${y}px) scale(1)` }
                            ], 200);
                        }
                    };
                    wheel.appendChild(planet);
                });

                this.c.appendChild(wheel);

                const instruction = this.lang === 'es' ?
                    `Después del ${currentDay.name} va...` :
                    `After ${currentDay.name} comes...`;
                window.app.audio.speak(instruction, this.lang === 'es' ? 'es-ES' : 'en-US');

                this.addControls();
            }

            playConfetti(element) {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                for (let i = 0; i < 20; i++) {
                    const p = document.createElement('div');
                    const color = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][Math.floor(Math.random() * 5)];
                    p.style.cssText = `
                        position:fixed; top:${centerY}px; left:${centerX}px; width:10px; height:10px;
                        background:${color}; pointer-events:none; border-radius:50%; z-index:9999;
                    `;
                    document.body.appendChild(p);
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 50 + Math.random() * 100;
                    const tx = Math.cos(angle) * velocity;
                    const ty = Math.sin(angle) * velocity;
                    p.animate([
                        { transform: 'translate(0,0) scale(1)', opacity: 1 },
                        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                    ], { duration: 600, easing: 'ease-out' }).onfinish = () => p.remove();
                }
            }

            winGame() {
                this.c.innerHTML = '';
                this.c.style.justifyContent = 'center';
                this.clearHint();
                window.app.audio.playWin();
                this.playConfetti(this.c);
                setTimeout(() => this.playConfetti(this.c), 300);
                setTimeout(() => this.playConfetti(this.c), 600);

                const msg = this.lang === 'es' ? '¡Súper Bien!' : 'Awesome!';
                // Only speak if not already spoken in review (or to reinforce)
                window.app.audio.speak(msg, this.lang === 'es' ? 'es-ES' : 'en-US');
                window.app.updateParentStats(20, 1, 'days_week');

                this.c.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px; animation: pop 0.5s;">
                        <div style="font-size: 6em;">🌟🏆🌟</div>
                        <h2 style="color: #2ecc71; font-size:3em;">${msg}</h2>
                        <button class="mode-btn kid" style="margin-top:20px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar</button>
                        <div style="height:10px"></div>
                        <button class="mode-btn kid" onclick="window.app.nav.goBackFromGame()">🏠 Salir</button>
                    </div>
                `;
            }

            cleanup() { this.clearHint(); }
        }
