const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
  User,
  Question,
  Reply,
  Like,
  Followship,
  sequelize
} = require('../models')
const { Op } = require('sequelize')
const { imgurFileHandler } = require('../helpers/file-helper')
const { relativeTime } = require('../helpers/date-helper')
const ACTIVE_USER_COUNT = 10
const { anonymousHandler } = require('../helpers/anonymous-helper')

const userController = {
  // 註冊
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body
      const userEmail = await User.findOne({ where: { email } })
      if (userEmail)
        return res.status(422).json({
          status: 'error',
          messages: 'email 已重複註冊！',
          name,
          email,
          role
        })

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
        where: { email, role: { [Op.ne]: 'admin' } },
        attributes: ['id', 'name', 'email', 'password', 'role', 'avatar']
      })
      if (!userData)
        return res
          .status(401)
          .json({ status: 'error', message: 'email or password incorrect' })
      const isPassordCorrect = await bcrypt.compare(password, userData.password)
      if (!isPassordCorrect)
        return res
          .status(401)
          .json({ status: 'error', message: 'email or password incorrect' })

      // 製作 token
      const user = userData.toJSON()
      delete user.password
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.status(200).json({ status: 'success', token, user })
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
              '(SELECT COUNT(*) FROM Questions JOIN Replies ON Questions.id = Replies.questionId WHERE Replies.userId = User.id)'
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
  },

  // 查看使用者發問的問題
  getUserQuestions: async (req, res, next) => {
    try {
      const userId = req.params.id

      // 確認使用者存在
      const user = await User.findByPk(userId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })

      const questions = await Question.findAll({
        attributes: [
          'id',
          'userId',
          'title',
          'description',
          'grade',
          'subject',
          'createdAt'
        ],
        order: [['id', 'DESC']],
        where: { userId, isAnonymous: false } // 不顯示匿名發問
      })

      // 調整時間格式
      questions.forEach(
        question =>
          (question.dataValues.createdAt = relativeTime(
            question.dataValues.createdAt
          ))
      )

      return res.status(200).json(questions)
    } catch (error) {
      next(error)
    }
  },

  getUserReplies: async (req, res, next) => {
    try {
      const userId = req.params.id

      // 確認使用者存在
      const user = await User.findByPk(userId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })

      const replies = await Reply.findAll({
        attributes: ['id', 'questionId', 'comment', 'createdAt'],
        include: {
          model: Question,
          attributes: [
            'id',
            'title',
            'description',
            'isAnonymous',
            'grade',
            'subject',
            'createdAt'
          ],
          include: { model: User, attributes: ['id', 'name', 'role', 'avatar'] }
        },
        order: [['id', 'DESC']],
        where: { userId }
      })

      replies.forEach(reply => {
        // 匿名發問
        if (reply.Question.isAnonymous) {
          anonymousHandler(reply.Question.User)
        }

        // 時間格式
        reply.dataValues.createdAt = relativeTime(reply.createdAt)
        reply.Question.dataValues.createdAt = relativeTime(
          reply.Question.createdAt
        )

        // 問題過長
        reply.Question.description =
          reply.Question.description.slice(0, 20) + '...'

        // 刪除不必要資料
        delete reply.Question.dataValues.isAnonymous
      })

      return res.status(200).json(replies)
    } catch (error) {
      next(error)
    }
  },

  // 查看使用者按讚的問題及回覆
  getUserLikes: async (req, res, next) => {
    try {
      const userId = Number(req.params.id)

      // 確認使用者存在
      const user = await User.findByPk(userId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })

      const likes = await Like.findAll({
        attributes: ['id', 'object', 'objectId'],
        include: {
          model: Question,
          attributes: [
            'id',
            'title',
            'description',
            'isAnonymous',
            'grade',
            'subject',
            'createdAt'
          ],
          include: {
            model: User,
            attributes: ['id', 'name', 'role', 'avatar']
          }
        },
        order: [['id', 'DESC']],
        where: { userId, object: 'question' }
      })

      likes.forEach(like => {
        // 匿名處理
        if (like.Question.isAnonymous) {
          anonymousHandler(like.Question.User)
        }

        // 時間格式
        like.Question.dataValues.createdAt = relativeTime(
          like.Question.createdAt
        )

        // 刪除不必要資料
        delete like.Question.dataValues.isAnonymous
      })

      return res.status(200).json(likes)
    } catch (error) {
      next(error)
    }
  },

  // 查看誰追蹤他
  getUserFollowers: async (req, res, next) => {
    try {
      const userId = Number(req.params.id)

      // 確認使用者存在
      const user = await User.findByPk(userId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })

      const followers = await Followship.findAll({
        attributes: [],
        include: {
          model: User,
          as: 'followers',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        where: { followingId: userId }
      })

      // 改變回傳資料結構，方便前端串接
      const followerData = followers.map(
        follower => follower.followers.dataValues
      )

      return res.status(200).json(followerData)
    } catch (error) {
      next(error)
    }
  },

  // 查看他追蹤誰
  getUserFollowings: async (req, res, next) => {
    try {
      const userId = Number(req.params.id)

      // 確認使用者存在
      const user = await User.findByPk(userId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 404, message: "user doesn't exist!" })

      const followings = await Followship.findAll({
        attributes: [],
        include: {
          model: User,
          as: 'followings',
          attributes: ['id', 'name', 'role', 'avatar']
        },
        order: [['id', 'DESC']],
        where: { followerId: userId }
      })

      // 改變回傳資料結構，方便前端串接
      const followingData = followings.map(
        following => following.followings.dataValues
      )

      return res.status(200).json(followingData)
    } catch (error) {
      next(error)
    }
  },

  // 查看回覆數最多的使用者
  getMostRepliesUsers: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const users = await User.findAll({
        attributes: [
          'id',
          'name',
          'role',
          'avatar',
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Replies WHERE Replies.userId = User.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              `EXISTS(SELECT id FROM Followships WHERE Followships.followerId = ${sequelize.escape(
                currentUserId
              )} AND Followships.followingId = User.id)`
            ),
            'isFollowed'
          ]
        ],
        order: [['replyCount', 'DESC']],
        limit: ACTIVE_USER_COUNT,
        where: { role: { [Op.ne]: 'admin' } }
      })

      // 如果自己在名單上，刪除自己的 isFollowed 屬性
      users.forEach(user => {
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
      })

      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },

  // 查看追蹤數最多的使用者
  getMostFollowersUsers: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const users = await User.findAll({
        attributes: [
          'id',
          'name',
          'role',
          'avatar',
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Followships WHERE followingId = User.id)'
            ),
            'followerCount'
          ],
          [
            sequelize.literal(
              `EXISTS(SELECT id FROM Followships WHERE Followships.followerId = ${sequelize.escape(
                currentUserId
              )} AND Followships.followingId = User.id)`
            ),
            'isFollowed'
          ]
        ],
        order: [['followerCount', 'DESC']],
        limit: ACTIVE_USER_COUNT,
        where: { role: { [Op.ne]: 'admin' } }
      })

      // 如果自己在名單上，刪除自己的 isFollowed 屬性
      users.forEach(user => {
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
      })

      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },

  // 查看得到最多讚的使用者
  getMostLikedUsers: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const users = await User.findAll({
        attributes: [
          'id',
          'name',
          'role',
          'avatar',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions JOIN Likes ON Questions.id = Likes.objectId WHERE Questions.userId = User.id AND Likes.object = "question") + ' + // 所發 question 得到的 like 數量
                '(SELECT COUNT(*) FROM Replies JOIN Likes ON Replies.id = Likes.objectId WHERE Replies.userId = User.id AND Likes.object = "reply")' // 所發 reply 得到的 like 數量
            ),
            'likedCount'
          ],
          [
            sequelize.literal(
              `EXISTS(SELECT id FROM Followships WHERE Followships.followerId = ${sequelize.escape(
                currentUserId
              )} AND Followships.followingId = User.id)`
            ),
            'isFollowed'
          ]
        ],
        order: [['likedCount', 'DESC']],
        limit: ACTIVE_USER_COUNT,
        where: { role: { [Op.ne]: 'admin' } }
      })

      // 如果自己在名單上，刪除自己的 isFollowed 屬性
      users.forEach(user => {
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
      })

      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },

  // 修改個人資料
  putUser: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { name, introduction } = req.body
      const { file } = req
      const updatedData = {
        name,
        introduction
      }
      if (file) updatedData.avatar = await imgurFileHandler(file)
      const user = await User.findByPk(currentUserId)
      user.update(updatedData)
      return res.status(200).json({ status: 'success', user: updatedData })
    } catch (error) {
      next(error)
    }
  },

  // 修改帳戶設定
  putUserAccount: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { role, password, confirmPassword, newPassword } = req.body

      // 修改密碼的驗證
      // 表單驗證
      if (newPassword) {
        const messages = {}
        if (!password) messages.password = 'enter original password!'
        if (!confirmPassword)
          messages.confirmPassword = 'enter original password!'
        if (password !== confirmPassword)
          messages.match = "passwords don't match"
        if (Object.keys(messages).length !== 0) {
          return res.status(422).json({
            status: 'error',
            messages,
            role
          })
        }
      }

      const user = await User.findByPk(req.user.id)
      if (newPassword) {
        // 密碼正確性驗證及更新資料
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect)
          return res
            .status(401)
            .json({ status: 'error', message: 'password incorrect' })
        user.update({ role, password: bcrypt.hashSync(newPassword, 10) })
      } else {
        // 未修改密碼更新資料
        if (role !== user.role) user.update({ role })
      }

      return res.status(200).json({ status: 'success', role })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
