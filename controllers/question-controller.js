const { User, Question, sequelize } = require('../models')

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
  }
}

module.exports = questionController
