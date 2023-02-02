const { User, Question, Reply, Like, sequelize } = require('../models')

const questionController = {
  getQuestions: async (req, res, next) => {
    try {
      const currentUserId = 12
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
        include: {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        order: [['id', 'DESC']]
      })
      return res.status(200).json({ questions })
    } catch (error) {
      next(error)
    }
  },
  getQuestion: async (req, res, next) => {
    try {
      const currentUserId = 12
      const question = await Question.findByPk(req.params.id, {
        raw: true,
        nest: true,
        attributes: [
          'id',
          'description',
          'image',
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
        include: {
          model: User,
          attributes: ['id', 'name', 'avatar']
        }
      })
      if (!question)
        return res
          .status(404)
          .json({ status: 404, message: "question doesn't exist!" })
      return res.status(200).json(question)
    } catch (error) {
      next(error)
    }
  },
  postQuestion: async (req, res, next) => {
    try {
      const { description, isAnonymous, grade, subject } = req.body
      const userId = 12
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
  getReplies: async (req, res, next) => {
    try {
      const currentUserId = 12
      const questionId = req.params.id
      const question = await Question.findByPk(questionId)
      if (!question)
        return res
          .status(404)
          .json({ status: 'error', message: "question doesn't exist!" })
      const replies = await Reply.findAll({
        raw: true,
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
        include: {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        order: [['createdAt', 'DESC']],
        where: { questionId }
      })
      return res.json({ replies })
    } catch (error) {
      next(error)
    }
  },
  postReply: async (req, res, next) => {
    try {
      const userId = 12
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
      const userId = 12
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
      const userId = 12
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
