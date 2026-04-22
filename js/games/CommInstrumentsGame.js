export class CommInstrumentsGame {
  constructor(data, container) {
    this.data = data;
    this.c = container;
    this.running = true;
    this.score = 0;

    this.c.style.background =
      "linear-gradient(to bottom, #84fab0 0%, #8fd3f4 100%)";
    this.c.style.position = "relative";
    this.c.style.overflow = "hidden";

    document.getElementById("livesContainer").style.display = "none";

    this.baskets = [
      { id: "viento", name: "Viento", icon: "💨", color: "#f1c40f" },
      { id: "cuerda", name: "Cuerda", icon: "🎸", color: "#e74c3c" },
      { id: "percusion", name: "Percusión", icon: "🥁", color: "#9b59b6" },
    ];

    this.instruments = [
      { name: "Flauta", icon: "🪈", type: "viento" },
      { name: "Trompeta", icon: "🎺", type: "viento" },
      { name: "Guitarra", icon: "🎸", type: "cuerda" },
      { name: "Violín", icon: "🎻", type: "cuerda" },
      { name: "Tambor", icon: "🥁", type: "percusion" },
      { name: "Xilófono", icon: "🎹", type: "percusion" }, // Using keyboard as placeholder for percussion/xylophone
    ];

    this.activeItems = [];
    this.init();
  }

  init() {
    this.c.innerHTML = `
            <div id="instScore" style="position:absolute; top:10px; right:20px; font-size:2em; font-weight:bold; background:white; padding:5px 15px; border-radius:20px; z-index:10;">Score: 0</div>

            <div id="basketContainer" style="position:absolute; bottom:20px; width:100%; display:flex; justify-content:space-around; z-index:5;">
                ${this.baskets
                  .map(
                    (b) => `
                    <div class="inst-basket" data-type="${b.id}" style="width:30%; max-width:150px; background:rgba(255,255,255,0.9); border:5px solid ${b.color}; border-radius:15px 15px 50px 50px; text-align:center; padding:20px 10px; box-shadow:0 10px 20px rgba(0,0,0,0.2);">
                        <div style="font-size:3em;">${b.icon}</div>
                        <div style="font-weight:bold; font-size:1.2em; color:${b.color};">${b.name}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;

    this.width = this.c.offsetWidth || 800;
    this.height = this.c.offsetHeight || 600;

    this.spawnTimer = setTimeout(() => this.spawnInstrument(), 1000);
    this.loopTimeout = requestAnimationFrame(() => this.loop());

    this.bindDragEvents();
  }

  spawnInstrument() {
    if (!this.running) return;

    const inst =
      this.instruments[Math.floor(Math.random() * this.instruments.length)];
    const el = document.createElement("div");
    el.className = "falling-inst";
    el.style.cssText = `
            position:absolute; width:80px; height:80px; background:white; border-radius:50%;
            display:flex; align-items:center; justify-content:center; font-size:3em;
            box-shadow:0 5px 15px rgba(0,0,0,0.3); cursor:grab; z-index:10;
        `;
    el.textContent = inst.icon;

    // Setup dragging data
    el.dataset.type = inst.type;
    el.dataset.name = inst.name;

    const x = Math.random() * (this.width - 100) + 10;
    let y = -100;

    el.style.left = x + "px";
    el.style.top = y + "px";

    this.c.appendChild(el);

    const itemObj = {
      el,
      x,
      y,
      speed: 1 + Math.random(),
      type: inst.type,
      dragging: false,
    };
    this.activeItems.push(itemObj);

    // Individual item mouse down for drag
    const startDrag = (e) => {
      if (!this.running) return;
      e.preventDefault();
      if (window.app.audio && window.app.audio.speak) {
        window.app.audio.speak(inst.name, "es-ES");
      }
      itemObj.dragging = true;
      this.draggedItem = itemObj;
      el.style.cursor = "grabbing";
      el.style.zIndex = "100";
      el.style.transform = "scale(1.2)";
    };

    el.addEventListener("mousedown", startDrag);
    el.addEventListener("touchstart", startDrag, { passive: false });

    // Spawn next
    const delay = Math.max(1000, 3000 - this.score * 100);
    this.spawnTimer = setTimeout(() => this.spawnInstrument(), delay);
  }

  bindDragEvents() {
    const moveDrag = (e) => {
      if (!this.draggedItem || !this.running) return;
      e.preventDefault();
      const input = e.touches ? e.touches[0] : e;
      const rect = this.c.getBoundingClientRect();

      this.draggedItem.x = input.clientX - rect.left - 40;
      this.draggedItem.y = input.clientY - rect.top - 40;

      this.draggedItem.el.style.left = this.draggedItem.x + "px";
      this.draggedItem.el.style.top = this.draggedItem.y + "px";
    };

    const endDrag = (e) => {
      if (!this.draggedItem || !this.running) return;
      const item = this.draggedItem;
      this.draggedItem = null;

      item.el.style.cursor = "grab";
      item.el.style.zIndex = "10";
      item.el.style.transform = "scale(1)";

      this.checkDrop(item);
    };

    this.c.addEventListener("mousemove", moveDrag);
    this.c.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);

    this.endDragHandler = endDrag;
  }

  checkDrop(item) {
    const itemRect = item.el.getBoundingClientRect();
    const baskets = document.querySelectorAll(".inst-basket");

    let dropped = false;

    baskets.forEach((b) => {
      const bRect = b.getBoundingClientRect();
      // Collision detection
      if (
        itemRect.left < bRect.right &&
        itemRect.right > bRect.left &&
        itemRect.top < bRect.bottom &&
        itemRect.bottom > bRect.top
      ) {
        if (item.type === b.dataset.type) {
          // Correct!
          window.app.audio.playPop();
          this.score++;
          document.getElementById("instScore").textContent =
            "Score: " + this.score;
          window.app.addScore(5);

          // Visual feedback
          b.style.transform = "scale(1.1)";
          setTimeout(() => (b.style.transform = "scale(1)"), 200);

          this.removeItem(item);
          dropped = true;

          if (this.score >= 10) {
            this.endGame();
          }
        } else {
          // Wrong!
          window.app.audio.playError();
          b.animate(
            [
              { transform: "translateX(0)" },
              { transform: "translateX(-10px)" },
              { transform: "translateX(10px)" },
              { transform: "translateX(0)" },
            ],
            { duration: 300 },
          );
        }
      }
    });

    if (!dropped) {
      // Let it keep falling if dropped outside
      item.dragging = false;
    }
  }

  removeItem(item) {
    if (item.el.parentNode) item.el.remove();
    this.activeItems = this.activeItems.filter((i) => i !== item);
  }

  loop() {
    if (!this.running) return;

    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];
      if (!item.dragging) {
        item.y += item.speed;
        item.el.style.top = item.y + "px";

        // Missed item
        if (item.y > this.height) {
          this.removeItem(item);
        }
      }
    }

    this.loopTimeout = requestAnimationFrame(() => this.loop());
  }

  endGame() {
    this.running = false;
    clearTimeout(this.spawnTimer);

    window.app.audio.playWin();
    window.app.updateParentStats(20, 1, "arcade");

    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position:absolute; top:0; left:0; width:100%; height:100%;
            background:rgba(255,255,255,0.9); display:flex; flex-direction:column;
            align-items:center; justify-content:center; z-index:30;
        `;
    overlay.innerHTML = `
            <div style="font-size: 5em;">🎵</div>
            <h2 style="color:#2ecc71; font-size:3em; margin:20px 0;">¡Maestro Musical!</h2>
            <button id="btnReplayInst" style="padding:15px 30px; font-size:1.5em; background:#3498db; color:white; border:none; border-radius:15px; cursor:pointer;">🔄 Jugar Otra Vez</button>
        `;
    this.c.appendChild(overlay);

    document.getElementById("btnReplayInst").onclick = () =>
      window.app.startGame(window.app.currentGameKey);
  }

  cleanup() {
    this.running = false;
    clearTimeout(this.spawnTimer);
    cancelAnimationFrame(this.loopTimeout);
    window.removeEventListener("mouseup", this.endDragHandler);
    window.removeEventListener("touchend", this.endDragHandler);
  }
}
