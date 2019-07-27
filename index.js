const fs = require('fs');

const express = require('express');
const app = express();
const port = 8080;

const Encoder = require('./encoder.js');
let encoding = false;
let encodingIndex = 0;
let encoder = null;

//app.get('/', (req, res) => res.send('Hello world'));

app.get('/encoding', (req, res) => {
    res.json(encoding);
});

app.post('/encode', (req, res) => {
    if (encoding) {
        res.json(null);
    } else {
        const main = `output/hls-stream-${encodingIndex}.m3u8`
        const bitrate = 8000000;

        const url = `output/hls-stream-${encodingIndex}-master.m3u8`;
        let master = '#EXTM3U\n' +
            '#EXT-X-VERSION:7\n' +
            `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=1920x1080,CODECS="av01.0.09M.08"\n` +
            main.replace(/^output\//, '');
        fs.writeFileSync(url, master);

        encoding = true;
        encodingIndex++;
        encoder = new Encoder({
            dest: main,
            bitrate: bitrate
        });
        encoder.start().then(() => {
            encoding = false;
        });
        res.json(url);
    }
});

app.use(express.static('dist'));

app.use('/output', express.static('output'));

app.listen(port, () => console.log(`AV1 demo running on port ${port}`));
