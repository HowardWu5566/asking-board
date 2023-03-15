module.exports = {
  anonymousHandler: user => {
    user.name = '匿名'
    user.account = 'anonymous'
    user.avatar = 'https://imgur.com/NCBjuk5'
    delete user.email
    return user
  },
  getAccountHandler: user => {
    user.account = user.email.split('@')[0]
    delete user.email
  }
}
