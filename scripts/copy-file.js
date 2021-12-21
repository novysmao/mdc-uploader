var fs = require('fs');

function copyFile(src, dist) {
  fs.writeFileSync(dist, fs.readFileSync(src));
}

copyFile('node_modules/mediainfo.js/dist/MediaInfoModule.wasm', 'dist/MediaInfoModule.wasm')