const { ImgurClient } = require('imgur')
const { createReadStream } = require('fs')

module.exports = {
  // 上傳檔案並回傳 url
  imgurFileHandler: async file => {
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENT_ID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN
    })
    const response = await client.upload({
      image: createReadStream(file.path),
      type: 'stream',
      album: process.env.IMGUR_ALBUM_ID
    })
    return response.data.link
  }
}
