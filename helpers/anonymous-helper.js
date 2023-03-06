module.exports = {
  anonymousHandler: user => {
    user.name = '匿名'
    user.avatar = 'https://i.imgur.com/YOTISNv.jpg'
    return user
  }
}
