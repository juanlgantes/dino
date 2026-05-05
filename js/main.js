import { App } from "./core/App.js?v=2";

window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.app.updateUI();
});
