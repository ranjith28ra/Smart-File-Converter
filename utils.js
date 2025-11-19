// lib/utils.js
const { spawn } = require('child_process');
const fs = require('fs').promises;


function getFileDurationSeconds(filePath) {
return new Promise((resolve) => {
const p = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath]);
let out = '';
p.stdout.on('data', d => out += d.toString());
p.on('close', code => {
const val = parseFloat(out);
if (isNaN(val)) return resolve(null);
resolve(val);
});
p.on('error', () => resolve(null));
});
}


async function safeUnlink(p) {
try { await fs.unlink(p); } catch (e) { /* ignore */ }
}


module.exports = { getFileDurationSeconds, safeUnlink };