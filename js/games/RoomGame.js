export class RoomGame {
  constructor(data, container) {
    this.container = container;
    this.items = [
      {
        id: "toys",
        icon: "🧸",
        name: "Juguetes",
        targetBox: "box-toys",
        color: "#ffb8b8",
      },
      {
        id: "clothes",
        icon: "👕",
        name: "Ropa",
        targetBox: "box-clothes",
        color: "#b8e9ff",
      },
      {
        id: "books",
        icon: "📚",
        name: "Libros",
        targetBox: "box-books",
        color: "#ffdfba",
      },
    ];
    this.placedItems = 0;

    // Caching references
    this.draggedItem = null;
  }

  init() {
    this.container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-around; height: 100%; padding: 20px;">
                <h2 style="color: #2c3e50; font-size: 2em; text-align: center; margin-top: 20px;">¡Ordena la Habitación!</h2>
                <p style="color: #666; text-align: center;">Arrastra cada objeto a su lugar.</p>

                <!-- Target Boxes -->
                <div style="display: flex; gap: 20px; width: 100%; justify-content: center; margin-top: 20px;">
                    <div id="box-toys" class="room-box" style="width: 100px; height: 100px; border: 4px dashed #ffb8b8; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2em; background: #fff;">🧸📦</div>
                    <div id="box-clothes" class="room-box" style="width: 100px; height: 100px; border: 4px dashed #b8e9ff; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2em; background: #fff;">👕🧺</div>
                    <div id="box-books" class="room-box" style="width: 100px; height: 100px; border: 4px dashed #ffdfba; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 2em; background: #fff;">📚📖</div>
                </div>

                <!-- Items to drag -->
                <div id="itemsContainer" style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; margin-top: 50px;">
                    <!-- JS will inject items -->
                </div>
            </div>
        `;

    this.setupItems();
    this.setupDragAndDrop();

    if (window.app && window.app.audio) {
      window.app.audio.speak("¡Vamos a ordenar la habitación!");
    }
  }

  setupItems() {
    const container = document.getElementById("itemsContainer");
    // Shuffle items to make it random
    const shuffledItems = [...this.items].sort(() => Math.random() - 0.5);

    shuffledItems.forEach((item) => {
      const el = document.createElement("div");
      el.className = "room-item";
      el.innerHTML = item.icon;
      el.dataset.id = item.id;
      el.dataset.target = item.targetBox;
      el.style.cssText = `
                font-size: 3em;
                cursor: grab;
                background: ${item.color};
                border-radius: 50%;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                user-select: none;
                touch-action: none;
            `;
      container.appendChild(el);
    });
  }

  setupDragAndDrop() {
    const items = document.querySelectorAll(".room-item");
    const boxes = document.querySelectorAll(".room-box");

    items.forEach((item) => {
      item.addEventListener("mousedown", (e) => this.startDrag(e, item));
      item.addEventListener("touchstart", (e) => this.startDrag(e, item), {
        passive: false,
      });
    });

    // Add mousemove/mouseup to the document so dragging works if mouse leaves item
    this.onMove = (e) => this.drag(e);
    this.onEnd = (e) => this.endDrag(e, boxes);

    document.addEventListener("mousemove", this.onMove);
    document.addEventListener("touchmove", this.onMove, { passive: false });
    document.addEventListener("mouseup", this.onEnd);
    document.addEventListener("touchend", this.onEnd);
  }

  startDrag(e, item) {
    if (e.type === "touchstart") e.preventDefault();
    if (item.classList.contains("placed")) return;

    this.draggedItem = item;
    item.style.cursor = "grabbing";
    item.style.zIndex = "1000";
    item.style.position = "absolute";

    this.updateItemPosition(e);
    if (window.app && window.app.audio) window.app.audio.playPop();
  }

  drag(e) {
    if (!this.draggedItem) return;
    if (e.type === "touchmove") e.preventDefault();
    this.updateItemPosition(e);
  }

  updateItemPosition(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = this.container.getBoundingClientRect();

    // Bound to container
    let x = clientX - rect.left - 40; // 40 is half the width
    let y = clientY - rect.top - 40;

    this.draggedItem.style.left = `${x}px`;
    this.draggedItem.style.top = `${y}px`;
  }

  endDrag(e, boxes) {
    if (!this.draggedItem) return;

    const item = this.draggedItem;
    this.draggedItem = null;
    item.style.cursor = "grab";

    const itemRect = item.getBoundingClientRect();
    const itemCenter = {
      x: itemRect.left + itemRect.width / 2,
      y: itemRect.top + itemRect.height / 2,
    };

    let placed = false;

    boxes.forEach((box) => {
      const boxRect = box.getBoundingClientRect();
      if (
        itemCenter.x >= boxRect.left &&
        itemCenter.x <= boxRect.right &&
        itemCenter.y >= boxRect.top &&
        itemCenter.y <= boxRect.bottom
      ) {
        if (item.dataset.target === box.id) {
          // Correct!
          this.placeItemInBox(item, box);
          placed = true;
        }
      }
    });

    if (!placed) {
      // Snap back to start or let it just drop? Let's just snap back visually
      item.style.position = "static";
      if (window.app && window.app.audio) window.app.audio.playError();
    }
  }

  placeItemInBox(item, box) {
    item.classList.add("placed");
    item.style.position = "static";

    // Visual feedback
    box.style.borderStyle = "solid";
    box.style.background = "#e8f5e9"; // Light green

    // Remove icon from box, replace with item
    box.innerHTML = "";
    box.appendChild(item);

    item.style.width = "60px"; // shrink a bit
    item.style.height = "60px";
    item.style.fontSize = "2.5em";
    item.style.boxShadow = "none";

    if (window.app && window.app.audio) {
      window.app.audio.playPop();
      window.app.audio.playWin();
    }

    this.placedItems++;
    if (this.placedItems >= this.items.length) {
      this.winGame();
    }
  }

  winGame() {
    setTimeout(() => {
      if (window.app) {
        window.app.audio.speak("¡Muy bien! ¡Todo está ordenado!");
        window.app.addScore(10); // Reward for organizing!
        const rect = this.container.getBoundingClientRect();
        window.app.playConfetti(rect.width / 2, rect.height / 2);

        setTimeout(() => {
          // Simple reset for replayability
          this.placedItems = 0;
          this.init();
        }, 4000);
      }
    }, 500);
  }

  startGame() {
    this.init();
  }

  cleanup() {
    if (this.onMove) {
      document.removeEventListener("mousemove", this.onMove);
      document.removeEventListener("touchmove", this.onMove);
    }
    if (this.onEnd) {
      document.removeEventListener("mouseup", this.onEnd);
      document.removeEventListener("touchend", this.onEnd);
    }
    this.container.innerHTML = "";
  }
}
