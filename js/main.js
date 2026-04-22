import { App } from "./core/App.js";

window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.app.updateUI();
});
