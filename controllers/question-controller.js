const { User, Question, Reply, Like, Image, sequelize } = require('../models')
const { Op } = require('sequelize')

const questionController = {
  getQuestions: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const questions = await Question.findAll({
        raw: true,
        nest: true,
        attributes: [
          'id',
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
          { model: User, attributes: ['id', 'name', 'avatar'] },
          { model: Image, attributes: ['id', 'url'] }
        ],
        group: 'id', // 只取一張圖當預覽
        order: [['id', 'DESC']]
      })

      // 匿名處理
      questions.forEach(question => {
        if (question.isAnonymous) {
          question.User = {
            name: '匿名',
            avatar: 'https://i.imgur.com/YOTISNv.jpg'
          }
        }
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
            attributes: ['id', 'name', 'avatar']
          },
          {
            model: Image,
            attributes: ['id', 'url']
          }
        ]
      })
      if (!question)
        return res
          .status(404)
          .json({ status: 404, message: "question doesn't exist!" })

      // 匿名處理
      if (question.isAnonymous) {
        question.User = {
          name: '匿名',
          avatar: 'https://i.imgur.com/YOTISNv.jpg'
        }
      }

      return res.status(200).json(question)
    } catch (error) {
      next(error)
    }
  },
  postQuestion: async (req, res, next) => {
    try {
      const { description, isAnonymous, grade, subject } = req.body
      const userId = req.user.id
      await Question.create({
        userId,
        description: description.trim(),
        isAnonymous,
        grade,
        subject
      })
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  putQuestion: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const { description, isAnonymous, grade, subject } = req.body
      const questionId = Number(req.params.id)
      const question = await Question.findByPk(questionId)
      if (!question)
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
      if (question.userId !== currentUserId)
        return res
          .status(401)
          .json({ status: 'error', message: 'unauthorized!' })
      const updatedQuestion = {
        description,
        isAnonymous,
        grade,
        subject
      }
      await question.update(updatedQuestion)
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
        return res
          .status(404)
          .json({ status: 404, message: "question doesn't exist!" })
      if (question.userId !== currentuserId)
        return res
          .status(401)
          .json({ status: 'error', message: 'unauthorized!' })

      // 刪除 question 時，同時刪除關聯的 replies, likes, images
      await sequelize.transaction(async deleteQuestion => {
        const replies = await Reply.findAll({ where: { questionId } })
        const replyIds = replies.map(reply => reply.id)
        console.log(replyIds)
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
      const currentUserId = req.user.id
      const questionId = Number(req.params.id)
      const question = await Question.findByPk(questionId)
      if (!question)
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
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
            attributes: ['id', 'name', 'avatar']
          },
          {
            model: Image,
            attributes: ['id', 'url']
          }
        ],
        order: [['id', 'ASC']],
        where: { questionId }
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
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
      await Reply.create({
        userId,
        questionId,
        comment
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
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
      const like = await Like.findOrCreate({
        where: {
          userId,
          object: 'question',
          objectId: questionId
        },
        defaults: {
          isSeed: false
        }
      })
      if (!like[1])
        return res
          .status(422)
          .json({ status: 'error', message: 'already like the question!' })
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
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
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
          .json({ status: 'error', message: "haven't liked the question!" })
      await like.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = questionController
