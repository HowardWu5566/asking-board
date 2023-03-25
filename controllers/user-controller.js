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

const { ACTIVE_USER_AMOUNT } = process.env
const {
  anonymousHandler,
  getAccountHandler
} = require('../helpers/user-data-helper')

const userController = {
  // 註冊
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body
      const userEmail = await User.findOne({ where: { email } })
      if (userEmail)
        return res.status(422).json({
          status: 'error',
          message: { email: 'email 已註冊' },
          name,
          email,
          role
        })

      // 建立資料
      const newUser = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        role,
        isLocalAccount: true
      })

      // 刪除敏感資訊、傳回客戶端
      delete newUser.dataValues.password
      delete newUser.dataValues.createdAt
      delete newUser.dataValues.updatedAt
      return res
        .status(200)
        .json({ status: 'success', user: newUser.dataValues })
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
          .json({ status: 'error', message: 'email 或密碼錯誤' })
      const isPassordCorrect = await bcrypt.compare(password, userData.password)
      if (!isPassordCorrect)
        return res
          .status(401)
          .json({ status: 'error', message: 'email 或密碼錯誤' })

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
          'email',
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

          // 回覆問題數
          [
            sequelize.literal(
              '(SELECT COUNT(DISTINCT Replies.questionId) FROM Questions JOIN Replies ON Questions.id = Replies.questionId WHERE Replies.userId = User.id)'
            ),
            'replyCount'
          ],

          // 收藏問題數
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM Likes WHERE Likes.object = "question" AND Likes.userId = User.id
              )`
            ),
            'likeQuestionCount'
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
          .json({ status: 'error', message: '使用者不存在' })

      // 取得 account 欄位
      getAccountHandler(user.dataValues)

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
          .json({ status: 'error', message: '使用者不存在' })

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
          .json({ status: 'error', message: '使用者不存在' })

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
          include: {
            model: User,
            attributes: ['id', 'name', 'email', 'role', 'avatar']
          }
        },
        order: [['id', 'DESC']],
        where: { userId }
      })

      replies.forEach(reply => {
        if (reply.Question.isAnonymous) {
          // 匿名發問
          anonymousHandler(reply.Question.User.dataValues)
        } else {
          // 取得 account 欄位
          getAccountHandler(reply.Question.User.dataValues)
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
          .json({ status: 'error', message: '使用者不存在' })

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
            attributes: ['id', 'name', 'email', 'role', 'avatar']
          }
        },
        order: [['id', 'DESC']],
        where: { userId, object: 'question' }
      })

      likes.forEach(like => {
        if (like.Question.isAnonymous) {
          // 匿名處理
          anonymousHandler(like.Question.User.dataValues)
        } else {
          // 取得 account 欄位
          getAccountHandler(like.Question.User.dataValues)
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
          .json({ status: 'error', message: '使用者不存在' })

      const followers = await Followship.findAll({
        attributes: [],
        include: {
          model: User,
          as: 'followers',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        where: { followingId: userId }
      })

      // 改變回傳資料結構，方便前端串接
      const followerData = followers.map(follower => {
        getAccountHandler(follower.followers.dataValues)
        return follower.followers.dataValues
      })

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
          .json({ status: 'error', message: '使用者不存在' })

      const followings = await Followship.findAll({
        attributes: [],
        include: {
          model: User,
          as: 'followings',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        order: [['id', 'DESC']],
        where: { followerId: userId }
      })

      // 改變回傳資料結構，方便前端串接
      const followingData = followings.map(following => {
        getAccountHandler(following.followings.dataValues)
        return following.followings.dataValues
      })

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
          'email',
          'introduction',
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
        limit: Number(ACTIVE_USER_AMOUNT),
        where: { role: { [Op.ne]: 'admin' } }
      })

      users.forEach(user => {
        // 如果自己在名單上，刪除自己的 isFollowed 屬性
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
        getAccountHandler(user.dataValues)
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
          'email',
          'introduction',
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
        limit: Number(ACTIVE_USER_AMOUNT),
        where: { role: { [Op.ne]: 'admin' } }
      })

      users.forEach(user => {
        // 如果自己在名單上，刪除自己的 isFollowed 屬性
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
        getAccountHandler(user.dataValues)
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
          'email',
          'introduction',
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
        limit: Number(ACTIVE_USER_AMOUNT),
        where: { role: { [Op.ne]: 'admin' } }
      })

      users.forEach(user => {
        // 如果自己在名單上，刪除自己的 isFollowed 屬性
        if (user.dataValues.id === currentUserId) {
          delete user.dataValues.isFollowed
        }
        getAccountHandler(user.dataValues)
      })

      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },

  // 取得登入者資料
  getCurrentUser: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const currentUser = await User.findByPk(currentUserId, {
        attributes: ['id', 'name', 'email', 'introduction', 'avatar']
      })
      if (!currentUser || currentUser.role === 'admin')
        return res
          .status(404)
          .json({ status: 'error', message: '使用者不存在' })

      // 取得 account 欄位
      getAccountHandler(currentUser.dataValues)

      return res.status(200).json({ status: 'success', currentUser })
    } catch (error) {
      next(error)
    }
  },
  // 修改個人資料
  putUser: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { name, introduction, avatar } = req.body
      const { file } = req
      const updatedData = {
        name,
        introduction
      }

      // 若刪除頭貼，還原預設頭貼
      if (avatar === '') {
        updatedData.avatar = 'https://i.imgur.com/a5KIQyC.png'
      }

      if (file) updatedData.avatar = await imgurFileHandler(file)
      const user = await User.findByPk(currentUserId)
      user.update(updatedData)
      return res.status(200).json({ status: 'success', user: updatedData })
    } catch (error) {
      next(error)
    }
  },

  // 取得登入者帳戶設定
  getUserAccount: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const currentUser = await User.findByPk(currentUserId, {
        attributes: ['id', 'role', 'email', 'isLocalAccount']
      })
      if (!currentUser || currentUser.role === 'admin')
        return res
          .status(404)
          .json({ status: 'error', message: '使用者不存在' })
      return res.status(200).json({ status: 'success', currentUser })
    } catch (error) {
      next(error)
    }
  },

  // 修改帳戶設定
  putUserAccount: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { role, email, password, newPassword } = req.body

      const currentUser = await User.findByPk(currentUserId)
      const updatedData = {}
      // 本站帳號才能修改信箱與密碼
      if (currentUser.isLocalAccount) {
        if (email !== currentUser.email) {
          // 信箱不能與其他使用者重複
          const user = await User.findOne({ where: { email } })
          if (user) {
            return res
              .status(422)
              .json({ status: 'error', message: { email: 'email 已重複註冊' } })
          } else {
            updatedData.email = email
          }
        }

        // 舊密碼驗證
        if (password) {
          const isPasswordCorrect = await bcrypt.compare(
            password,
            currentUser.password
          )
          if (!isPasswordCorrect) {
            return res
              .status(401)
              .json({ status: 'error', message: { password: '密碼錯誤' } })
          } else {
            updatedData.password = await bcrypt.hashSync(newPassword, 10)
          }
        }
      }

      // 本站與第三方登入都能修改 role
      if (role !== currentUser.role) {
        updatedData.role = role
      }

      // 更新資料
      await currentUser.update(updatedData)

      return res.status(200).json({ status: 'success', role, email })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
