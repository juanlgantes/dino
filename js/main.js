import { App } from "./core/App.js?v=3";

window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.app.updateUI();
});
