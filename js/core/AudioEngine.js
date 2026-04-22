export class AudioEngine {
  constructor() {
    this._ctx = null;
    this.muted = false;
    this.unlocked = false;
    this._lastUtterance = null;
    this._voices = [];
    this.initVoices();
  }

  initVoices() {
    if (!window.speechSynthesis) return;

    const load = () => {
      this._voices = window.speechSynthesis.getVoices();
      // console.log('Voces cargadas:', this._voices.length);
    };

    // Chrome loads async
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    // Try now anyway
    load();

    // Aggressive Retry for Samsung/Android
    if (this._voices.length === 0) {
      let attempts = 0;
      const interval = setInterval(() => {
        load();
        attempts++;
        if (this._voices.length > 0 || attempts > 10) clearInterval(interval);
      }, 500);
    }
  }

  get ctx() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  unlock() {
    if (this.unlocked) return Promise.resolve();

    // 1. Unlock Web Audio
    if (this.ctx.state !== "running") {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);
      this.ctx.resume();
    }

    // 2. Unlock Speech Synthesis (Mobile Wake-up)
    if (window.speechSynthesis) {
      // Clear queue first
      window.speechSynthesis.cancel();

      // Speak silence to initialize the engine on user gesture
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; // Silent
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }

    this.unlocked = true;
    return Promise.resolve();
  }

  playTone(freq, type, duration) {
    if (this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  playPop() {
    this.playTone(600, "sine", 0.1);
  }
  playError() {
    this.playTone(150, "sawtooth", 0.3);
  }
  playWin() {
    this.playTone(500, "sine", 0.2);
    setTimeout(() => this.playTone(800, "sine", 0.4), 200);
  }

  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  speak(text, lang = "es-ES") {
    if (this.muted || !window.speechSynthesis || !text) return;

    // 0. Resume
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    // 1. Cancel
    window.speechSynthesis.cancel();

    // 2. Create
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // 3. Legacy Voice Mode for Android/Samsung
    // If specific voice object causes issues, rely on lang only.
    // We use User Agent detection to infer potential trouble environment (Android)
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // LEGACY MODE: Just Lang
      utterance.lang = lang;
    } else {
      // STANDARD MODE: Explicit Voice
      if (this._voices.length === 0)
        this._voices = window.speechSynthesis.getVoices();

      // Match requested lang
      let voice = null;

      if (lang.startsWith("en")) {
        voice = this._voices.find((v) => v.lang.startsWith("en"));
      } else {
        voice =
          this._voices.find((v) => v.lang === "es-ES" || v.lang === "es_ES") ||
          this._voices.find((v) => v.lang.startsWith("es"));
      }

      // Fallback to default if not found
      if (!voice) voice = this._voices.find((v) => v.default);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = lang;
      }
    }

    // 4. GC Fix
    this._lastUtterance = utterance;
    utterance.onend = () => {
      this._lastUtterance = null;
    };
    utterance.onerror = (e) => {
      console.error("Speech Error:", e);
    };

    // 5. Speak
    window.speechSynthesis.speak(utterance);
  }
}
