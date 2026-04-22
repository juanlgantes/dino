export class EnglishPathGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.running = true;
    this.dino = { x: 50, y: 50, el: null };
    this.items = [];
    this.currentIndex = 0;
    this.sequence = [];

    // Setup UI
    this.c.style.background =
      "linear-gradient(to bottom, #84fab0 0%, #8fd3f4 100%)";
    this.c.style.position = "relative";
    this.c.style.overflow = "hidden";

    document.getElementById("livesContainer").style.display = "none";

    this.initMenu();
  }

  initMenu() {
    this.c.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
                <h2 style="font-size:2em; color:white; text-shadow:2px 2px 4px rgba(0,0,0,0.5);">Elige el camino</h2>
                <button id="btnNums" style="margin:10px; padding:20px; font-size:1.5em; background:#f1c40f; border:none; border-radius:15px;">🔢 Numbers (1-25)</button>
                <button id="btnMonths" style="margin:10px; padding:20px; font-size:1.5em; background:#e74c3c; color:white; border:none; border-radius:15px;">📅 Months of the Year</button>
            </div>
        `;

    document.getElementById("btnNums").onclick = () =>
      this.startGame("numbers");
    document.getElementById("btnMonths").onclick = () =>
      this.startGame("months");
  }

  startGame(mode) {
    if (mode === "numbers") {
      for (let i = 1; i <= 25; i++)
        this.sequence.push({ label: i.toString(), spoken: i.toString() });
    } else {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const icons = [
        "❄️",
        "💘",
        "🌱",
        "🌧️",
        "🌸",
        "☀️",
        "🏖️",
        "🍉",
        "🍂",
        "🎃",
        "🦃",
        "🎄",
      ];
      months.forEach((m, i) =>
        this.sequence.push({ label: m, icon: icons[i], spoken: m }),
      );
    }

    this.c.innerHTML = `
            <div id="dinoPlayer" class="dino-player" style="position:absolute; font-size:3em; z-index:10; cursor:pointer;">🦕</div>
            <div id="targetDisplay" style="position:absolute; top:20px; left:50%; transform:translateX(-50%); font-size:2em; background:white; padding:10px 20px; border-radius:20px; border:3px solid #3498db; z-index:5;">
                Next: <span id="nextLabel" style="font-weight:bold; color:#e74c3c;"></span>
            </div>
        `;

    this.dino.el = document.getElementById("dinoPlayer");
    this.width = this.c.offsetWidth || 800;
    this.height = this.c.offsetHeight || 600;

    this.dino.x = this.width / 2;
    this.dino.y = this.height - 100;
    this.updatePos();

    this.updateTargetUI();
    this.spawnItems();
    this.bindEvents();
  }

  updateTargetUI() {
    if (this.currentIndex < this.sequence.length) {
      document.getElementById("nextLabel").textContent =
        this.sequence[this.currentIndex].label;
      if (window.app.audio && window.app.audio.speak) {
        window.app.audio.speak(
          this.sequence[this.currentIndex].spoken,
          "en-US",
        );
      }
    }
  }

  spawnItems() {
    // We don't want to spawn all 25 at once if it's too crowded. Let's spawn 5 at a time.
    this.spawnBatch();
  }

  spawnBatch() {
    // Clear old uncollected items? No, just spawn next few that aren't spawned.
    const itemsNeeded = 5;
    let spawned = 0;
    for (
      let i = this.currentIndex;
      i < this.sequence.length && spawned < itemsNeeded;
      i++
    ) {
      // Check if already spawned
      if (!this.items.find((item) => item.index === i)) {
        this.spawnSingleItem(i);
        spawned++;
      }
    }
  }

  spawnSingleItem(index) {
    const itemData = this.sequence[index];
    const el = document.createElement("div");
    el.className = "game-item";
    el.style.position = "absolute";

    // Random position, avoid edges
    const x = Math.random() * (this.width - 100) + 50;
    const y = Math.random() * (this.height - 150) + 100;

    el.style.left = x + "px";
    el.style.top = y + "px";

    if (itemData.icon) {
      el.innerHTML = `<div style="font-size:2em;">${itemData.icon}</div><div style="font-size:0.8em; font-weight:bold; background:rgba(255,255,255,0.8); padding:2px; border-radius:5px;">${itemData.label}</div>`;
    } else {
      el.innerHTML = `<div style="font-size:2em; font-weight:bold; background:white; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:3px solid #f1c40f;">${itemData.label}</div>`;
    }

    this.c.appendChild(el);
    this.items.push({ index, x, y, el, active: true });
  }

  bindEvents() {
    this.dragHandler = (e) => {
      if (!this.dragging || !this.running) return;
      e.preventDefault();
      const input = e.touches ? e.touches[0] : e;
      const rect = this.c.getBoundingClientRect();

      let x = input.clientX - rect.left;
      let y = input.clientY - rect.top;

      x = Math.max(20, Math.min(this.width - 20, x));
      y = Math.max(20, Math.min(this.height - 20, y));

      this.dino.x = x;
      this.dino.y = y;
      this.updatePos();
      this.checkCollisions();
    };

    this.upHandler = () => {
      this.dragging = false;
    };

    const startDrag = (e) => {
      if (!this.running) return;
      e.preventDefault();
      this.dragging = true;
    };

    this.dino.el.addEventListener("mousedown", startDrag);
    this.dino.el.addEventListener("touchstart", startDrag);
    window.addEventListener("mousemove", this.dragHandler);
    window.addEventListener("touchmove", this.dragHandler, { passive: false });
    window.addEventListener("mouseup", this.upHandler);
    window.addEventListener("touchend", this.upHandler);
  }

  updatePos() {
    // Center the dino on the pointer
    this.dino.el.style.left = this.dino.x - 24 + "px";
    this.dino.el.style.top = this.dino.y - 24 + "px";
  }

  checkCollisions() {
    const HIT_RAD = 40;
    this.items.forEach((item) => {
      if (!item.active) return;
      const dx = Math.abs(this.dino.x - item.x);
      const dy = Math.abs(this.dino.y - item.y);

      if (dx < HIT_RAD && dy < HIT_RAD) {
        this.hitItem(item);
      }
    });
  }

  hitItem(item) {
    if (item.index === this.currentIndex) {
      // Correct
      item.active = false;
      item.el.style.transition = "all 0.3s";
      item.el.style.transform = "scale(1.5)";
      item.el.style.opacity = "0";
      window.app.audio.playPop();

      setTimeout(() => item.el.remove(), 300);

      this.currentIndex++;
      if (this.currentIndex >= this.sequence.length) {
        this.endGame(true);
      } else {
        this.updateTargetUI();
        this.spawnBatch(); // Keep spawning
      }
    } else if (item.index > this.currentIndex) {
      // Wrong item
      if (!this.errorCooldown) {
        this.errorCooldown = true;
        window.app.audio.playError();
        const nextLabel = this.sequence[this.currentIndex].label;
        window.app.showToast(`¡Debes recoger: ${nextLabel}!`);

        // Shake the wrong item
        item.el.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-10px)" },
            { transform: "translateX(10px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 300 },
        );

        setTimeout(() => {
          this.errorCooldown = false;
        }, 1000);
      }
    }
  }

  endGame(won) {
    this.running = false;
    if (won) {
      window.app.audio.playWin();
      window.app.addScore(20);
      window.app.updateParentStats(20, 1, "arcade");
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.9); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:30;
        `;
    overlay.innerHTML = `
            <div style="font-size: 5em;">🎉</div>
            <h2 style="color:#2ecc71; font-size:2em;">¡Completado!</h2>
            <button id="btnReplayPath" style="margin-top:20px; padding:15px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:10px;">🔄 Volver a Jugar</button>
        `;
    this.c.appendChild(overlay);

    document.getElementById("btnReplayPath").onclick = () => {
      window.app.startGame(window.app.currentGameKey);
    };
  }

  cleanup() {
    this.running = false;
    window.removeEventListener("mousemove", this.dragHandler);
    window.removeEventListener("touchmove", this.dragHandler);
    window.removeEventListener("mouseup", this.upHandler);
    window.removeEventListener("touchend", this.upHandler);
  }
}
