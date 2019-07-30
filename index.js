const fs = require('fs');

const express = require('express');
const app = express();
const port = 8080;

const devHack = true; // enable hacks for running faster on dev station

const Encoder = require('./encoder.js');
let encoding = false;
let encodingIndex = 0;
let encoder = null;
let currentUrl = null;

//app.get('/', (req, res) => res.send('Hello world'));

app.get('/current', (req, res) => {
    res.json(currentUrl);
});

app.post('/encode', (req, res) => {
    if (encoding) {
        res.json(null);
    } else {
        const base = `dash-stream-${encodingIndex}.mpd`;
        const main = `output/${base}`;
        const bitrate = 4000000;
        const bitrate_small = 2000000;

        //const url = `output/hls-stream-${encodingIndex}-master.m3u8`;
        const url = main;
        /*
        let master = '#EXTM3U\n' +
            '#EXT-X-VERSION:7\n' +
            `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=1920x1080,CODECS="av01.0.09M.08"\n` +
            main.replace(/^output\//, '');
        fs.writeFileSync(url, master);
        */
        let master = url;

        encoding = true;
        currentUrl = url;
        encodingIndex++;

        let options = {
            dest: main,
            base: base,
            bitrate: bitrate,
            bitrate_small: bitrate_small,
            devHack: devHack,
            threads: 0, // auto
        };
        if (devHack) {
            options.bitrate = options.bitrate / 4;
            options.bitrate_small = options.bitrate_small / 4;
            options.threads = 6;
        }
        encoder = new Encoder(options);
        encoder.start().then(() => {
            encoding = false;
        });
        res.json(url);
    }
});

app.use(express.static('dist'));

app.use('/output', express.static('output'));

app.listen(port, () => console.log(`AV1 demo running on port ${port}`));
