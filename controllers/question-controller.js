const { User, Question, Reply, Like, Image, sequelize } = require('../models')
const { Op } = require('sequelize')
const { imgurFileHandler } = require('../helpers/file-helper')
const { relativeTime } = require('../helpers/date-helper')
const {
  anonymousHandler,
  getAccountHandler
} = require('../helpers/user-data-helper')
const { POPULAR_QUESTION_AMOUNT, POPULAR_QUESTION_DAY_RANGE } = process.env
const questionController = {
  getQuestions: async (req, res, next) => {
    try {
      const currentUserId = req.user.id

      // 搜尋功能
      const { grade, subject, keyword } = req.query
      const where = {}
      if (grade) {
        where.grade = { [Op.substring]: grade }
      }
      if (subject) {
        where.subject = subject
      }
      if (keyword) {
        where[Op.or] = [
          { title: { [Op.substring]: keyword } },
          { description: { [Op.substring]: keyword } }
        ]
      }

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
          ],
          [
            sequelize.literal(
              `EXISTS (SELECT id FROM Likes WHERE Likes.userId = ${sequelize.escape(
                currentUserId
              )} AND Likes.object = "question" AND Likes.objectId = Question.id)`
            ),
            'isLiked'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar', 'role']
          }
        ],
        order: [['id', 'DESC']],
        where
      })

      questions.forEach(question => {
        // 匿名處理
        if (question.isAnonymous) {
          anonymousHandler(question.User)
        } else {
          getAccountHandler(question.User)
        }
        // 時間格式
        question.createdAt = relativeTime(question.createdAt)
      })

      return res.status(200).json(questions)
    } catch (error) {
      next(error)
    }
  },
  getQuestion: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
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
          ],
          [
            sequelize.literal(
              `EXISTS (SELECT id FROM Likes WHERE Likes.userId = ${sequelize.escape(
                currentUserId
              )} AND Likes.object = "question" AND Likes.objectId = Question.id)`
            ),
            'isLiked'
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

      if (question.isAnonymous) {
        // 匿名處理
        anonymousHandler(question.User.dataValues)
      } else {
        // 取得 account 欄位
        getAccountHandler(question.User.dataValues)
      }

      // 時間格式
      question.dataValues.createdAt = relativeTime(
        question.dataValues.createdAt
      )

      return res.status(200).json(question)
    } catch (error) {
      next(error)
    }
  },
  getPopularQuestions: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { grade } = req.query
      const startDate = new Date()
      startDate.setDate(
        startDate.getDate() - Number(POPULAR_QUESTION_DAY_RANGE)
      )

      // 篩選條件
      const where = {
        createdAt: {
          [Op.gte]: startDate
        }
      }
      if (grade) {
        where.grade = { [Op.substring]: grade }
      }

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
          ],
          [
            sequelize.literal(
              `EXISTS (SELECT id FROM Likes WHERE Likes.userId = ${sequelize.escape(
                currentUserId
              )} AND Likes.object = "question" AND Likes.objectId = Question.id)`
            ),
            'isLiked'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar', 'role']
          }
        ],
        order: [
          ['replyCount', 'DESC'],
          ['id', 'DESC']
        ],
        limit: Number(POPULAR_QUESTION_AMOUNT),
        where
      })

      questions.forEach(question => {
        // 匿名處理
        if (question.isAnonymous) {
          anonymousHandler(question.User)
        } else {
          getAccountHandler(question.User)
        }
        // 時間格式
        question.createdAt = relativeTime(question.createdAt)
      })

      return res.status(200).json(questions)
    } catch (error) {
      next(error)
    }
  },
  postQuestion: async (req, res, next) => {
    try {
      const { title, description, isAnonymous, grade, subject } = req.body
      const { file } = req
      const userId = req.user.id

      // 寫入 Questions 資料表
      await Question.create({
        userId,
        title,
        description: description.trim(),
        isAnonymous,
        grade,
        subject,
        image: file ? await imgurFileHandler(file) : null
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  putQuestion: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { title, description, isAnonymous, grade, subject, image } =
        req.body
      const { file } = req
      const questionId = Number(req.params.id)
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })
      if (question.userId !== currentUserId)
        return res.status(401).json({ status: 'error', message: '無權限' })

      // 修改問題
      await question.update({
        title,
        description,
        isAnonymous,
        grade,
        subject,
        image: file ? await imgurFileHandler(file) : image ? image : null
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  deleteQuestion: async (req, res, next) => {
    try {
      const currentuserId = req.user.id
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })
      if (question.userId !== currentuserId)
        return res.status(401).json({ status: 'error', message: '無權限' })

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
        return await question.destroy({ transaction: deleteQuestion })
      })
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  getReplies: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
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
            sequelize.literal(
              '(SELECT COUNT(id) FROM Likes WHERE Likes.object = "reply" AND Likes.objectId = Reply.id)'
            ),
            'likeCount'
          ],
          [
            sequelize.literal(
              `EXISTS (SELECT id FROM Likes WHERE Likes.userId = ${sequelize.escape(
                currentUserId
              )} AND Likes.object = "reply" AND Likes.objectId = Reply.id)`
            ),
            'isLiked'
          ]
        ],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'avatar', 'role']
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
  postReply: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { comment } = req.body
      const { file } = req
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })

      // 寫入 Replies 資料表
      await Reply.create({
        userId,
        questionId,
        comment,
        image: file ? await imgurFileHandler(file) : null
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  postQuestionLike: async (req, res, next) => {
    try {
      const userId = req.user.id
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })
      const like = await Like.findOrCreate({
        where: {
          userId,
          object: 'question',
          objectId: questionId
        }
      })
      if (!like[1])
        return res
          .status(422)
          .json({ status: 'error', message: '已收藏此問題' })
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  deleteQuestionLike: async (req, res, next) => {
    try {
      const userId = req.user.id
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res.status(404).json({ status: 'error', message: '問題不存在' })
      const like = await Like.findOne({
        where: {
          userId,
          object: 'question',
          objectId: questionId
        }
      })
      if (!like)
        return res
          .status(422)
          .json({ status: 'error', message: '尚未收藏此問題' })
      await like.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = questionController
