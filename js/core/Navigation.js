export class Navigation {
  constructor() {
    this.views = [
      "splash",
      "kid-dash",
      "game",
      "parent",
      "cinema",
      "eval-root",
      "eval-level-3",
      "eval-term-2",
      "eval-english",
      "eval-comunicacion",
    ];
  }
  show(viewId) {
    this.views.forEach((v) => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.add("hidden");
    });
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove("hidden");
      void target.offsetWidth;
    }
  }
  goHome() {
    if (
      window.app.gameInstance &&
      typeof window.app.gameInstance.cleanup === "function"
    ) {
      window.app.gameInstance.cleanup();
    }
    this.show("splash");
  }

  goDashboard() {
    if (
      window.app.gameInstance &&
      typeof window.app.gameInstance.cleanup === "function"
    ) {
      window.app.gameInstance.cleanup();
    }
    this.show("kid-dash");
  }

  goBackFromGame() {
    if (
      window.app.gameInstance &&
      typeof window.app.gameInstance.cleanup === "function"
    ) {
      window.app.gameInstance.cleanup();
    }

    const mode = window.app.currentFolderMode;
    if (mode === "english") {
      this.show("eval-english");
    } else if (mode === "comunicacion") {
      this.show("eval-comunicacion");
    } else if (mode === "arcade") {
      window.app.renderActivities("arcade");
      this.show("kid-dash");
    } else {
      window.app.renderActivities("root");
      this.show("kid-dash");
    }
  }
}
