const { upload } = require('./upload');
const { version, name } = require('../package.json');

// 指定版本 - 同package.json里version
upload(`${name}/alpha/v${version}`)
// latest版本
upload(`${name}/alpha/latest`)