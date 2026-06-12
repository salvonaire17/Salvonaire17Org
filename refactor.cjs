const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    // Colors
    [/bg-blue-(500|600)/g, 'bg-cyan-600'],
    [/bg-indigo-(500|600)/g, 'bg-cyan-600'],
    [/text-blue-(500|600)/g, 'text-cyan-700'],
    [/text-indigo-(500|600)/g, 'text-cyan-700'],
    [/bg-blue-50(?!0)/g, 'bg-cyan-50'],
    [/bg-indigo-50(?!0)/g, 'bg-cyan-50'],
    [/border-blue-100/g, 'border-cyan-100'],
    [/border-indigo-100/g, 'border-cyan-100'],
    
    // Radii
    [/rounded-3xl/g, 'rounded-[2.5rem]'],
    [/rounded-\[2rem\]/g, 'rounded-[2.5rem]'],
    [/rounded-\[3rem\]/g, 'rounded-[2.5rem]'],
    
    // Interaction
    [/active:scale-95(?!\s+duration-200)/g, 'active:scale-95 duration-200'],

    // Depth
    // This could be tricky, maybe doing border border-slate-100 is easier
    [/shadow-(md|lg|xl|2xl)/g, 'shadow-sm'],
    
    // Micro-Typography
    [/(text-xs|text-sm|text-\[9px\]|text-\[11px\]) font-(semibold|bold|black) uppercase/g, 'text-[10px] font-black uppercase tracking-widest text-slate-400'],
    [/tracking-wider(?!\w|s)/g, 'tracking-widest'],
    
    // Macro-Typography
    [/text-2xl font-(bold|black)/g, 'text-xl md:text-2xl font-black text-slate-900 tracking-tight'],
    [/text-xl font-(bold|black)/g, 'text-xl md:text-2xl font-black text-slate-900 tracking-tight']
];

walkDir('.', (filePath) => {
    if (filePath.includes('node_modules')) return;
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        for (let [pattern, replacement] of replacements) {
            content = content.replace(pattern, replacement);
        }
        
        // Abstract Geometric Splashes - very basic insertion if not present
        if (content.includes('bg-white') && content.includes('rounded-[2.5rem]')) {
            // we will let specific file edits handle this to avoid breaking JSX structure.
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated', filePath);
        }
    }
});
