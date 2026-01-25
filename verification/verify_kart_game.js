
// Mock DOM
class MockElement {
    constructor(tag) {
        this.tagName = tag;
        this.style = {};
        this.children = [];
        this.textContent = '';
        this._innerHTML = '';
    }
    appendChild(child) {
        if (typeof child === 'string') {
            // Text node simulation
            this.children.push({ textContent: child });
        } else {
            this.children.push(child);
        }
    }
    get innerHTML() {
        if (this._innerHTML) return this._innerHTML;
        return this.children.map(c => {
            if (c.tagName) {
                let s = `<${c.tagName}`;
                if (c.style.cssText) s += ` style="${c.style.cssText}"`;
                s += `>${c.innerHTML || c.textContent}</${c.tagName}>`;
                return s;
            }
            return c.textContent;
        }).join('');
    }
    set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
    }
}

const document = {
    createElement: (tag) => new MockElement(tag),
    createTextNode: (text) => ({ textContent: text }) // Simple text node
};

// Simplified KartGame
class KartGame {
    constructor() {
        this.c = new MockElement('div');
        this.timeLeft = 120;
        this.lives = 3;
        this.init();
    }

    // ORIGINAL LOGIC (SIMULATED)
    init() {
        this.uiEl = document.createElement('div');
        this.uiEl.style.cssText = `...`;
        this.c.appendChild(this.uiEl);
    }

    updateUI() {
        // Format MM:SS
        const m = Math.floor(this.timeLeft / 60);
        const s = Math.floor(this.timeLeft % 60);
        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

        this.uiEl.innerHTML = `⏱️ ${timeStr} <span style="margin-left:10px">❤️ ${this.lives}</span>`;
    }
}

// Run Test
const game = new KartGame();
game.updateUI();
console.log("Output:", game.uiEl.innerHTML);

if (game.uiEl.innerHTML.includes('⏱️ 2:00') && game.uiEl.innerHTML.includes('❤️ 3')) {
    console.log("BASELINE VERIFICATION PASSED");
} else {
    console.error("BASELINE VERIFICATION FAILED");
    process.exit(1);
}
