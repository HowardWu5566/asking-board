const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Question, Reply, Like, sequelize } = require('../models')
const { Op } = require('sequelize')
const { relativeTime } = require('../helpers/date-helper')
const { getAccountHandler } = require('../helpers/user-data-helper')
const { defaultImage }=require('../config/dropdown-value')

const adminController = {
  // 管理員登入
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body
      const adminData = await User.findOne({
        where: { email, role: 'admin' },
        attributes: ['id', 'name', 'email', 'password', 'role', 'avatar']
      })
      const isPasswordCorrect = await bcrypt.compare(
        password,
        adminData.password
      )
      if (!adminData || !isPasswordCorrect)
        return res
          .status(401)
          .json({ status: 'error', message: 'email 或密碼錯誤' })
      const admin = adminData.toJSON()
      delete admin.password
      const token = jwt.sign(admin, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      return res.status(200).json({ status: 'success', token, admin })
    } catch (error) {
      next(error)
    }
  },

  // 查看所有問題
  getquestions: async (req, res, next) => {
    try {
      const questions = await Question.findAll({
        raw: true,
        nest: true,
        attributes: [
          'id',
          'title',
          'description',
          'isAnonymous',
          'grade',
          'subject',
          'image',
          'createdAt',
          [
            // 回覆數
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Replies 
                WHERE Replies.questionId = Question.id
            )`),
            'replyCount'
          ],
          [
            // 收藏數
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Likes 
                WHERE Likes.object = "question" 
                  AND Likes.objectId = Question.id
            )`),
            'likeCount'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar', 'role']
          }
        ],
        order: [['id', 'DESC']]
      })

      questions.forEach(question => {
        // 時間格式
        question.createdAt = relativeTime(question.createdAt)
        // 取得 account 欄位
        getAccountHandler(question.User)

        // 若無圖片，填入預設圖
        if (!question.image) {
          question.image = defaultImage
        }
      })

      return res.status(200).json(questions)
    } catch (error) {
      next(error)
    }
  },

  // 查看特定問題
  getquestion: async (req, res, next) => {
    try {
      const questionId = Number(req.params.id)
      const question = await Question.findByPk(questionId, {
        nest: true,
        attributes: [
          'id',
          'title',
          'description',
          'isAnonymous',
          'grade',
          'subject',
          'image',
          'createdAt',
          [
            // 回覆數
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Replies 
                WHERE Replies.questionId = Question.id
            )`),
            'replyCount'
          ],
          [
            // 收藏數
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Likes 
                WHERE Likes.object = "question" 
                  AND Likes.objectId = Question.id
            )`),
            'likeCount'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar', 'role']
          }
        ]
      })
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })

      // 時間格式
      question.dataValues.createdAt = relativeTime(
        question.dataValues.createdAt
      )

      // 取得 account 欄位
      getAccountHandler(question.User.dataValues)

      return res.status(200).json(question)
    } catch (error) {
      next(error)
    }
  },

  // 刪除特定問題
  deleteQuestion: async (req, res, next) => {
    try {
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({
          status: 'error',
          message: '問題不存在'
        })

      // 刪除 question 時，同時刪除關聯的 replies, likes
      await sequelize.transaction(async deleteQuestion => {
        const replies = await Reply.findAll({ where: { questionId } })
        const replyIds = replies.map(reply => reply.id)
        // 刪除 question 的 replies
        await Reply.destroy({
          where: { questionId },
          transaction: deleteQuestion
        })
        // 刪除 question 的 likes，及 replies 的 likes
        await Like.destroy({
          where: {
            [Op.or]: [
              { object: 'question', objectId: questionId },
              { object: 'reply', objectId: { [Op.in]: replyIds } }
            ]
          },
          transaction: deleteQuestion
        })
        return await question.destroy({ transaction: deleteQuestion })
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },

  // 查看某問題的回覆
  getReplies: async (req, res, next) => {
    try {
      const questionId = Number(req.params.id)
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })
      const replies = await Reply.findAll({
        nest: true,
        attributes: [
          'id',
          'comment',
          'image',
          'createdAt',
          [
            // 此回覆的讚數
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Likes 
                WHERE Likes.object = "reply" 
                  AND Likes.objectId = Reply.id
            )`),
            'likeCount'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar']
          }
        ],
        order: [
          ['id', 'DESC'] // replies 排序
        ],
        where: { questionId }
      })

      replies.forEach(reply => {
        // 時間格式
        reply.dataValues.createdAt = relativeTime(reply.dataValues.createdAt)
        // 取得 account 欄位
        getAccountHandler(reply.User.dataValues)
      })

      return res.status(200).json(replies)
    } catch (error) {
      next(error)
    }
  },

  // 刪除特定回覆
  deleteReply: async (req, res, next) => {
    try {
      const replyId = Number(req.params.id)
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({
          status: 'error',
          message: '回覆不存在'
        })

      // 刪除 reply 時，同時刪除關聯的 likes
      await sequelize.transaction(async deleteReply => {
        await Like.destroy({
          where: { object: 'reply', objectId: replyId },
          transaction: deleteReply
        })
        return await reply.destroy({ transaction: deleteReply })
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },

  // 查看所有使用者
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: [
          'id',
          'name',
          'email',
          'role',
          'avatar',
          [ // 發問數
            sequelize.literal(`(
              SELECT 
                COUNT (*) FROM Questions 
                WHERE userId = User.id
            )`),
            'questionCount'
          ],
          [ // 回覆問題數
            sequelize.literal(`(
              SELECT 
                COUNT (*) 
                FROM Questions 
                JOIN Replies 
                  ON Questions.id = Replies.questionId 
                WHERE Replies.userId = User.id
            )`),
            'replyCount'
          ],
          [ // 問題收到讚數
            sequelize.literal(`(
              SELECT 
                COUNT (*) 
                FROM Questions 
                JOIN Likes 
                  ON Questions.id = Likes.objectId 
                WHERE Questions.userId = User.id
            )`),
            'questionLikedCount'
          ],
          [ // 回覆收到讚數
            sequelize.literal(`(
              SELECT 
                COUNT (*) 
                FROM Replies 
                JOIN Likes 
                  ON Replies.id = Likes.objectId 
                WHERE Replies.userId = User.id
            )`),
            'replyLikedCount'
          ],
          [ // 多少人追蹤他
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Followships 
                WHERE followingId = User.id
            )`),
            'followerCount'
          ],
          [ // 他追蹤多少人
            sequelize.literal(`(
              SELECT 
                COUNT (id) FROM Followships 
                WHERE followerId = User.id
            )`),
            'followingCount'
          ]
        ],
        order: [['id', 'DESC']],
        where: { role: { [Op.ne]: 'admin' } }
      })

      // 取得 account 欄位
      users.forEach(user => getAccountHandler(user.dataValues))

      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminController
