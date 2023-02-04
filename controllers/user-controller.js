const jwt = require('jsonwebtoken')
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
      delete newUser.dataValues.password
      return res.json({ status: 'success', user: newUser.dataValues })
    } catch (error) {
      next(error)
    }
  },

  // 登入
  login: async (req, res, next) => {
    try {
      // 檢查信箱及密碼
      const { email, password } = req.body
      const userData = await User.findOne({
        where: { email },
        attributes: ['id', 'name', 'email', 'password', 'role', 'avatar']
      })
      const isPassordCorrect = await bcrypt.compare(password, userData.password)
      if (!userData || !isPassordCorrect)
        return res
          .status(401)
          .json({ status: 'error', message: 'email or password incorrect' })

      // 製作 token
      const user = userData.toJSON()
      delete user.password
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.status(200).json({ token, user })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
