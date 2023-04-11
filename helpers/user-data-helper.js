const { defaultAvatar } = require('../config/dropdown-value')

module.exports = {
  anonymousHandler: user => {
    user.name = '匿名'
    user.account = 'anonymous'
    user.avatar = defaultAvatar
    delete user.email
    return user
  },
  getAccountHandler: user => {
    user.account = user.email.split('@')[0]
    delete user.email
  }
}
