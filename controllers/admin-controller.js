const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Question, Reply, sequelize } = require('../models')

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
          .json({ status: 'error', message: 'email or password incorrect!' })
      const admin = adminData.tojson()
      delete admin.password
      const token = jwt.sign(admin, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      res.status(200).json({ token, admin })
    } catch (error) {
      next(error)
    }
  },
  getquestions: async (req, res, next) => {
    try {
      const questions = Question.findAll({
        raw: true,
        next: true,
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
          ]
        ],
        include: { model: User },
        attributes: ['id', 'name', 'avatar']
      })
      res.status(200).json(questions)
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
          message: "question doesn't exist!"
        })
      await question.destroy()
      res.status(200).json({ status: 'success' })
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
          message: "reply doesn't exist!"
        })
      await reply.destroy()
      res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminController
