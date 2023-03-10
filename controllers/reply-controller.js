const { Reply, Like } = require('../models')

const replyController = {
  putReply: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { comment } = req.body
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res
          .status(404)
          .json({ status: 'error', message: "reply doesn't exist!" })
      if (reply.userId !== userId)
        return res
          .status(401)
          .json({ status: 'error', message: 'unauthorized!' })
      const updatedReply = {
        userId,
        questionId: reply.questionId,
        comment: comment.trim()
      }
      await reply.update(updatedReply)
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  deleteReply: async (req, res, next) => {
    try {
      const userId = req.user.id
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res
          .status(404)
          .json({ status: 404, message: "reply doesn't exist!" })
      if (reply.userId !== userId)
        return res
          .status(401)
          .json({ status: 'error', message: 'unauthorized!' })
      await reply.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  postReplyLike: async (req, res, next) => {
    try {
      const userId = req.user.id
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res
          .status(404)
          .json({ status: 'error', message: 'reply doesn,t exist!' })
      const like = await Like.findOrCreate({
        where: {
          userId,
          object: 'reply',
          objectId: replyId
        },
        defaults: { isSeed: false }
      })
      if (!like[1])
        return res
          .status(422)
          .json({ status: 'error', message: 'already like the reply!' })
      return res.status(422).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  deleteReplyLike: async (req, res, next) => {
    try {
      const userId = req.user.id
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res
          .status(404)
          .json({ status: 'error', message: 'reply doesn,t exist!' })
      const like = await Like.findOne({
        where: {
          userId,
          object: 'reply',
          objectId: replyId
        }
      })
      if (!like)
        return res
          .status(422)
          .json({ status: 'error', message: "haven't liked the reply!" })
      await like.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = replyController
