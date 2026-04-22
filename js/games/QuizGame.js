export class QuizGame {
            constructor(activityData, app) {
                this.app = app;
                // Create a shallow copy to shuffle without affecting original order permanently if needed elsewhere
                // But mainly to allow re-shuffling on restart
                this.data = { ...activityData, games: [...activityData.games].sort(() => Math.random() - 0.5) };
                this.container = document.getElementById('gameArea');
                this.currentIndex = 0;

                // Setup UI for Quiz
                this.container.style.background = 'white';
                this.container.innerHTML = '';
                document.getElementById('livesContainer').style.display = 'none';

                this.renderQuestion();
            }

            renderQuestion() {
                // Safety check
                if (this.currentIndex < 0) this.currentIndex = 0;
                if (this.currentIndex >= this.data.games.length) {
                    this.finishQuiz();
                    return;
                }

                const game = this.data.games[this.currentIndex];

                // Clear & Build Wrapper
                this.container.innerHTML = '';
                const wrapper = document.createElement('div');
                wrapper.style.padding = '20px';
                wrapper.className = 'quiz-container';

                // Title
                const titleH2 = document.createElement('h2');
                titleH2.style.cssText = 'color: var(--text-dark); margin-bottom: 30px; font-size: 1.5em;';
                titleH2.textContent = this.data.title;
                wrapper.appendChild(titleH2);

                // Question Card
                const card = document.createElement('div');
                card.style.cssText = 'background: white; padding: 30px; border-radius: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); margin-bottom: 20px;';

                const questionH3 = document.createElement('h3');
                questionH3.style.cssText = 'color: #667eea; font-size: 1.8em; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; gap: 15px;';

                const qText = document.createElement('span');
                qText.textContent = game.question;
                questionH3.appendChild(qText);

                const btnSpeak = document.createElement('button');
                btnSpeak.innerText = '🔊';
                btnSpeak.style.cssText = 'background: #e0c3fc; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.2em; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.1s;';
                btnSpeak.onclick = (e) => {
                    e.stopPropagation();
                    this.speakCurrent();
                    btnSpeak.style.transform = 'scale(0.9)';
                    setTimeout(() => btnSpeak.style.transform = 'scale(1)', 100);
                };
                questionH3.appendChild(btnSpeak);

                const btnStop = document.createElement('button');
                btnStop.innerText = '🤫';
                btnStop.style.cssText = 'background: #ff7675; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.2em; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.1s; margin-left: 10px;';
                btnStop.onclick = (e) => {
                    e.stopPropagation();
                    window.app.audio.stop();
                    btnStop.style.transform = 'scale(0.9)';
                    setTimeout(() => btnStop.style.transform = 'scale(1)', 100);
                };
                questionH3.appendChild(btnStop);

                card.appendChild(questionH3);

                // Speak Auto
                setTimeout(() => this.speakCurrent(), 500);

                // Options
                game.options.forEach((opt, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.textContent = opt;

                    // Mark if already answered correctly? (Not tracking per question persistence yet, but logic is here)
                    if (game.answered && i === game.correct) btn.classList.add('correct');

                    btn.onclick = () => this.checkAnswer(i, btn);
                    card.appendChild(btn);
                });

                wrapper.appendChild(card);

                // Footer
                const footer = document.createElement('p');
                footer.textContent = `Pregunta ${this.currentIndex + 1} de ${this.data.games.length}`;
                footer.style.color = '#999';
                wrapper.appendChild(footer);

                this.container.appendChild(wrapper);

                // --- NAVIGATION (Prev / Next) ---
                const navContainer = document.createElement('div');
                navContainer.style.cssText = 'position:absolute; bottom:20px; width:100%; display:flex; justify-content:space-between; padding:0 20px; pointer-events:none;';

                // Prev
                const btnPrev = document.createElement('button');
                btnPrev.innerHTML = '⬅️';
                btnPrev.style.cssText = `
                    background: #3498db; color: white; border: none;
                    width: 60px; height: 60px; border-radius: 50%;
                    font-size: 2em; cursor: pointer; box-shadow: 0 4px 0 #2980b9;
                    display: flex; align-items: center; justify-content: center;
                    pointer-events: auto; visibility: ${this.currentIndex > 0 ? 'visible' : 'hidden'};
                `;
                btnPrev.onclick = () => this.prevQuestion();

                // Next
                const btnNext = document.createElement('button');
                btnNext.innerHTML = '➡️';
                btnNext.style.cssText = `
                    background: #f1c40f; color: white; border: none;
                    width: 60px; height: 60px; border-radius: 50%;
                    font-size: 2em; cursor: pointer; box-shadow: 0 4px 0 #d35400;
                    display: flex; align-items: center; justify-content: center;
                    pointer-events: auto; visibility: ${this.currentIndex < this.data.games.length - 1 ? 'visible' : 'hidden'};
                `;
                btnNext.onclick = () => this.nextQuestion();

                navContainer.appendChild(btnPrev);
                navContainer.appendChild(btnNext);

                this.container.style.position = 'relative';
                this.container.appendChild(navContainer);
            }

            speakCurrent() {
                const game = this.data.games[this.currentIndex];
                if (!game) return;
                const text = `${game.question}. ${game.options.join('. ')}`;
                window.app.audio.speak(text);
            }

            prevQuestion() {
                if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
                if (this.currentIndex > 0) {
                    this.currentIndex--;
                    this.renderQuestion();
                }
            }

            nextQuestion() {
                if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
                if (this.currentIndex < this.data.games.length - 1) {
                    this.currentIndex++;
                    this.renderQuestion();
                }
            }

            checkAnswer(selectedIndex, btnElement) {
                const game = this.data.games[this.currentIndex];

                // If already answered, don't score again
                if (game.answered) return;

                if (selectedIndex === game.correct) {
                    btnElement.classList.add('correct');
                    game.answered = true; // Mark as answered
                    window.app.addScore(10);
                    window.app.audio.playPop();
                    this.showFeedback('¡Bien hecho! ⭐', true);

                    // Auto-advance after delay
                    this.feedbackTimeout = setTimeout(() => {
                        if (this.currentIndex < this.data.games.length - 1) {
                            this.nextQuestion();
                        } else {
                            this.finishQuiz();
                        }
                    }, 2000);

                } else {
                    btnElement.classList.add('incorrect');
                    window.app.audio.playError();
                    this.showFeedback('¡Casi!', false);
                }
            }

            showFeedback(msg, isCorrect) {
                // Strict Port of Logic: Create fixed div overlay
                const el = document.createElement('div');
                el.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: ${isCorrect ? 'var(--success-color)' : 'var(--warning-color)'};
            color: white; padding: 40px; border-radius: 20px; font-size: 2em; z-index: 20000;
            animation: pop 0.3s ease-out; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            text-align: center;
        `;
                el.textContent = msg;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 1500);
            }

            finishQuiz() {
                const earned = this.data.games.length * 10;
                window.app.updateParentStats(earned, 1);
                window.app.audio.playWin();

                this.container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 8em;">🎉</div>
                <h2 style="color: var(--success-color); margin: 20px 0;">¡Completado!</h2>
                <p style="font-size: 1.5em;">Ganaste ${earned} estrellas</p>
                <button class="mode-btn kid" style="margin-top: 30px; background:#2ecc71;" onclick="window.app.startGame(window.app.currentGameKey)">🔄 Jugar Otra Vez</button>
                <div style="height:10px"></div>
                <button class="mode-btn kid" style="margin-top: 10px;" onclick="window.app.nav.goBackFromGame()">🏠 Volver al Menú</button>
            </div>
        `;
            }

            cleanup() {
                if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
            }
        }
