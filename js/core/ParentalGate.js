export class ParentalGate {
            constructor() {
                this.el = document.getElementById('parentalGate');
                this.qEl = document.getElementById('gateQuestion');
                this.optEl = document.getElementById('gateOptions');
                this.callback = null;
            }
            open(onSuccess) {
                this.callback = onSuccess;
                this.generateChallenge();
                this.el.classList.remove('hidden');
            }
            closeGate() { this.el.classList.add('hidden'); }
            generateChallenge() {
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                const sum = a + b;
                this.qEl.textContent = `¿Cuánto es ${a} + ${b}?`;
                const opts = [sum, sum + 1, sum - 1].sort(() => Math.random() - 0.5);
                this.optEl.innerHTML = '';
                opts.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'gate-btn';
                    btn.textContent = opt;
                    btn.onclick = () => this.check(opt, sum);
                    this.optEl.appendChild(btn);
                });
            }
            check(val, expected) {
                if (val === expected) {
                    this.closeGate();
                    if (this.callback) this.callback();
                } else {
                    window.app.audio.playError();
                    this.frameShake();
                }
            }
            frameShake() {
                this.el.querySelector('.gate-box').animate([
                    { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
                ], 300);
            }
        }
