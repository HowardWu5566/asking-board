const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userController = {
  // 註冊
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword, role } = req.body
      const messages = []
      const userEmail = await User.findOne({ where: { email } })
      if (userEmail) messages.push({ msg: 'email已重複註冊！' })
      if (!name.trim()) messages.push({ msg: '名稱不可空白！' })
      if (!email.trim()) messages.push({ msg: '名稱不可空白！' })
      if (password !== confirmPassword)
        messages.push({ msg: '密碼與確認密碼不符！' })
      if (messages.length) {
        return res.status(422).json({
          status: 'error',
          messages,
          name,
          email,
          role
        })
      }

      // 建立資料
      const newUser = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        role
      })

      // 刪除敏感資訊、傳回客戶端
      const userData = newUser.toJSON()
      delete userData.password
      res.json({ status: 'success', user: userData })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
