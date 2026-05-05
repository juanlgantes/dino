const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const swScript = `
      // UNREGISTER SERVICE WORKER (Fix missing sw.js cache issue)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          let needsReload = false;
          for(let registration of registrations) {
            registration.unregister();
            needsReload = true;
          }
          if (needsReload && !window.location.search.includes("reloaded=true")) {
             window.location.search = "?reloaded=true";
          }
        });
      }
`;

html = html.replace(/^[ \t]*\/\/\s*UNREGISTER SERVICE WORKER[\s\S]*?\}\);[\s\S]*?\}/m, swScript.trim());

fs.writeFileSync('index.html', html);
