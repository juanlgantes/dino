const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('indexdino.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    console.log(`Checking script block ${count}...`);
    const code = match[1];
    try {
        new vm.Script(code);
        console.log(`Script block ${count} is valid.`);
    } catch (e) {
        console.error(`Syntax Error in script block ${count}:`, e);
        process.exit(1);
    }
}

if (count === 0) {
    console.error('No script blocks found!');
    process.exit(1);
}

console.log('All script blocks verified successfully.');
