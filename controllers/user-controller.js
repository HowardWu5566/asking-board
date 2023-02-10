const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User, sequelize } = require('../models')
const { Op } = require('sequelize')

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
  },

  // 查看使用者
  getUser: async (req, res, next) => {
    try {
      const userId = Number(req.params.id)
      const user = await User.findByPk(userId, {
        attributes: [
          'id',
          'name',
          'role',
          'avatar',
          'introduction',

          // 發問數
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions WHERE userId = User.id)'
            ),
            'questionCount'
          ],

          // 回覆數
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions JOIN Replies ON Questions.id = Replies.questionId WHERE Questions.userId = User.id)'
            ),
            'replyCount'
          ],

          // 收到讚數
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions JOIN Likes ON Questions.id = Likes.objectId WHERE Questions.userId = User.id) + ' +
                '(SELECT COUNT(*) FROM Replies JOIN Likes ON Replies.id = Likes.objectId WHERE Replies.userId = User.id)'
            ),
            'likedCount'
          ],

          // 多少人追蹤他
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE followingId = User.id)'
            ),
            'followerCount'
          ],

          // 他追蹤多少人
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE followerId = User.id)'
            ),
            'followingCount'
          ]
        ]
      })
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })
      return res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
