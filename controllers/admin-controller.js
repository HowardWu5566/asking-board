const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Question, Reply, Image, sequelize } = require('../models')
const { Op } = require('sequelize')

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
          ]
        ],
        include: [
          { model: User, attributes: ['id', 'name', 'avatar'] },
          { model: Image, attributes: ['id', 'url'] }
        ],
        group: 'id', // 只取一張圖當預覽
        order: ['id']
      })
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
        return res
          .status(404)
          .json({ status: 404, message: "question doesn't exist!" })
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
          message: "question doesn't exist!"
        })
      await question.destroy()
      res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  getReplies: async (req, res, next) => {
    try {
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
              '(SELECT COUNT(*) FROM Questions JOIN Replies ON Questions.id = Replies.questionId WHERE Questions.userId = User.id)'
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
        where: { role: { [Op.or]: ['teacher', 'student'] } }
      })
      return res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminController
