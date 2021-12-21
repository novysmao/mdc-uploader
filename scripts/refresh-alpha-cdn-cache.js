const aliCdnUrl = require('ali-cdn-url');
const request = require('request');
const { name } = require('../package.json');

const pubArgs = {
  Format: 'JSON',
  AccessKeyId: process.env.OSS_ID,
  AccessKeySecret: process.env.OSS_SECRET,
};

const otherArgs = {
  ObjectPath: `static.mudu.tv/${name}/alpha/latest/`,
  Action: 'RefreshObjectCaches',
  ObjectType: 'Directory'
};

const url = aliCdnUrl(pubArgs, otherArgs);
request(url, function (error, response, body) {
  console.error('error:', error);
  console.log('statusCode:', response && response.statusCode);
  console.log('body:', body);
});
