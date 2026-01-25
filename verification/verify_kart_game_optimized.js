
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
                // Handle style object simplified
                if (Object.keys(c.style).length > 0) {
                     // For this test we only care about cssText if provided or style props
                     if (!c.style.cssText) {
                         const styles = Object.entries(c.style).map(([k,v]) => {
                             // camelCase to dash-case basic
                             const kDash = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                             return `${kDash}:${v}`;
                         }).join(';');
                         if (styles) s += ` style="${styles}"`;
                     }
                }
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
    createTextNode: (text) => ({ textContent: text }) // Simple text node reference
};

// Simplified KartGame
class KartGame {
    constructor() {
        this.c = new MockElement('div');
        this.timeLeft = 120;
        this.lives = 3;
        this.init();
    }

    // NEW LOGIC (SIMULATED)
    init() {
        this.uiEl = document.createElement('div');
        this.uiEl.style.cssText = `...`;

        // Optimized UI Structure (No innerHTML loop)
        this.uiEl.appendChild(document.createTextNode('⏱️ '));
        this.timeNode = document.createTextNode('');
        this.uiEl.appendChild(this.timeNode);

        const livesContainer = document.createElement('span');
        livesContainer.style.marginLeft = '10px';
        livesContainer.appendChild(document.createTextNode('❤️ '));
        this.livesNode = document.createTextNode('');
        livesContainer.appendChild(this.livesNode);
        this.uiEl.appendChild(livesContainer);

        this.c.appendChild(this.uiEl);
    }

    updateUI() {
        // Format MM:SS
        const m = Math.floor(this.timeLeft / 60);
        const s = Math.floor(this.timeLeft % 60);
        const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

        this.timeNode.textContent = timeStr;
        this.livesNode.textContent = this.lives;
    }
}

// Run Test
const game = new KartGame();
game.updateUI();
console.log("Output:", game.uiEl.innerHTML);

// Expected: ⏱️ 2:00<span style="margin-left:10px">❤️ 3</span>
// Note: Mock innerHTML impl might vary slightly on spaces but content must match
if (game.uiEl.innerHTML.includes('⏱️ 2:00') && game.uiEl.innerHTML.includes('❤️ 3')) {
    console.log("OPTIMIZED VERIFICATION PASSED");
} else {
    console.error("OPTIMIZED VERIFICATION FAILED");
    process.exit(1);
}
