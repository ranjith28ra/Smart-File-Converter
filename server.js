// server.js
const maxWidth = parseInt(req.body.maxWidth || '1600');
const out = path.join(TMP_ROOT, `${uuidv4()}.jpg`);
try {
let pipeline = sharp(input).rotate();
const meta = await pipeline.metadata();
if (meta.width && meta.width > maxWidth) pipeline = pipeline.resize({ width: maxWidth });
await pipeline.jpeg({ quality }).toFile(out);
sendFileStream(res, out, path.basename(out));
} catch (e) {
console.error(e);
res.status(500).json({ error: 'Image compression failed', details: e.message });
} finally {
await safeUnlink(input);
}
});


// 6) Compress Video
app.post('/api/compress-video', upload.single('file'), async (req, res) => {
if (!req.file) return res.status(400).json({ error: 'No file' });
const input = req.file.path;
const targetMB = parseFloat(req.body.targetMB || '2');
const maxWidth = parseInt(req.body.maxWidth || '1280');
if (!(targetMB > 0)) return res.status(400).json({ error: 'Invalid targetMB' });
const out = path.join(TMP_ROOT, `${uuidv4()}.mp4`);
try {
const duration = await getFileDurationSeconds(input);
if (!duration || duration <= 0) throw new Error('Could not determine duration');
const targetBytes = targetMB * 1024 * 1024;
let bitrateKbps = Math.max(64, Math.floor((targetBytes * 8) / duration / 1000));
if (bitrateKbps > 100) bitrateKbps = Math.floor(bitrateKbps * 0.95);


await new Promise((resolve, reject) => {
ffmpeg(input)
.videoCodec('libx264')
.size(`?x${maxWidth}`)
.outputOptions([
'-preset', 'fast',
'-b:v', `${bitrateKbps}k`,
'-maxrate', `${bitrateKbps}k`,
'-bufsize', `${Math.max(2 * bitrateKbps, 1000)}k`,
'-movflags', '+faststart',
'-c:a', 'aac',
'-b:a', '64k'
])
.on('end', resolve)
.on('error', reject)
.save(out);
});


sendFileStream(res, out, path.basename(out));
} catch (e) {
console.error(e);
res.status(500).json({ error: 'Video compression failed', details: e.message });
} finally {
await safeUnlink(input);
}
});


// global error handler
app.use((err, req, res, next) => {
console.error('Unhandled:', err);
res.status(500).json({ error: 'Server error' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening ${PORT}`));