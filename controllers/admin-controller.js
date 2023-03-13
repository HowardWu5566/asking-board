const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Question, Reply, Like, Image, sequelize } = require('../models')
const { Op } = require('sequelize')
const { relativeTime } = require('../helpers/date-helper')

const adminController = {
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
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Replies WHERE Replies.questionId = Question.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Likes WHERE Likes.object = "question" AND Likes.objectId = Question.id)'
            ),
            'likeCount'
          ]
        ],
        include: [
          { model: User, attributes: ['id', 'name', 'avatar'] },
          { model: Image, attributes: ['id', 'url'] }
        ],
        group: 'id', // 只取一張圖當預覽
        order: [['id', 'DESC']]
      })

      // 時間格式
      questions.forEach(
        question => (question.createdAt = relativeTime(question.createdAt))
      )

      return res.status(200).json(questions)
    } catch (error) {
      next(error)
    }
  },
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
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Replies WHERE Replies.questionId = Question.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Likes WHERE Likes.object = "question" AND Likes.objectId = Question.id)'
            ),
            'likeCount'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'avatar']
          },
          {
            model: Image,
            attributes: ['id', 'url']
          }
        ]
      })
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })

      // 時間格式
      question.dataValues.createdAt = relativeTime(
        question.dataValues.createdAt
      )

      return res.status(200).json(question)
    } catch (error) {
      next(error)
    }
  },
  deleteQuestion: async (req, res, next) => {
    try {
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({
          status: 'error',
          message: '問題不存在'
        })

      // 刪除 question 時，同時刪除關聯的 replies, likes, images
      await sequelize.transaction(async deleteQuestion => {
        const replies = await Reply.findAll({ where: { questionId } })
        const replyIds = replies.map(reply => reply.id)
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
        // 刪除 question 的 images，及 replies 的 images
        await Image.destroy({
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
          'createdAt',
          [
            sequelize.literal(
              '(SELECT COUNT(id) FROM Likes WHERE Likes.object = "reply" AND Likes.objectId = Reply.id)'
            ),
            'likeCount'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'avatar']
          },
          {
            model: Image,
            attributes: ['id', 'url']
          }
        ],
        order: [
          ['id', 'ASC'], // replies 排序
          [Image, 'id', 'ASC'] // replies 內的 images 排序
        ],
        where: { questionId }
      })

      // 時間格式
      replies.forEach(
        reply =>
          (reply.dataValues.createdAt = relativeTime(
            reply.dataValues.createdAt
          ))
      )

      return res.status(200).json(replies)
    } catch (error) {
      next(error)
    }
  },
  deleteReply: async (req, res, next) => {
    try {
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({
          status: 'error',
          message: '回覆不存在'
        })

      // 刪除 reply 時，同時刪除關聯的 likes, images
      await sequelize.transaction(async deleteReply => {
        // 刪除 reply 的 likes
        await Like.destroy({
          where: { object: 'reply', objectId: replyId },
          transaction: deleteReply
        })
        // 刪除 reply 的 images
        await Image.destroy({
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
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: [
          'id',
          'name',
          'role',
          'avatar',
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions WHERE userId = User.id)'
            ),
            'questionCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions JOIN Replies ON Questions.id = Replies.questionId WHERE Replies.userId = User.id)'
            ),
            'replyCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Questions JOIN Likes ON Questions.id = Likes.objectId WHERE Questions.userId = User.id) + ' +
                '(SELECT COUNT(*) FROM Replies JOIN Likes ON Replies.id = Likes.objectId WHERE Replies.userId = User.id)'
            ),
            'likeCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE followingId = User.id)'
            ),
            'followerCount'
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Followships WHERE followerId = User.id)'
            ),
            'followingCount'
          ]
        ],
        order: [['id', 'DESC']],
        where: { role: { [Op.ne]: 'admin' } }
      })
      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminController
