const { ImgurClient } = require('imgur')

module.exports = {
  imgurFileHandler: async files => {
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENT_ID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN
    })
    const response = await client.upload({
      image: files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM_ID
    })
    return response.data.link
  }
}
