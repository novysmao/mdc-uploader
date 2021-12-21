const OSS = require('ali-oss')
const path = require('path')
const readdir = require('readdir')

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ID,
  accessKeySecret: process.env.OSS_SECRET,
  bucket: 'mudustatic'
})

const upload = async function (versionPrefix) {
  const distFiles = readdir.readSync(path.resolve(__dirname, '../dist'))
  console.log('__dirname:', __dirname)
  console.log(`开始上传: ${versionPrefix}`, distFiles.length)
  for (let i = 0; i < distFiles.length; i++) {
    const name = distFiles[i]
    console.log(`正在上传: ${name}`)
    await client.put(
      `${versionPrefix}/${name}`,
      path.resolve(__dirname, '../dist', name)
    )
  }
  console.log(`上传完成: https://static.mudu.tv/${versionPrefix}`)
}

module.exports = { upload };
