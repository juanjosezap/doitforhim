const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MEDIA_DIR = path.join(__dirname, 'media');
const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|avif|bmp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|avi)$/i;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(MEDIA_DIR));

app.get('/api/media', (req, res) => {
  try {
    const files = fs.readdirSync(MEDIA_DIR)
      .filter(f => IMAGE_EXT.test(f) || VIDEO_EXT.test(f))
      .sort()
      .map(f => ({
        url: `/media/${encodeURIComponent(f)}`,
        type: VIDEO_EXT.test(f) ? 'video' : 'image',
      }));
    res.json(files);
  } catch {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Do It For Her → http://localhost:${PORT}`);
});
