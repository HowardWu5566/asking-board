const { Reply } = require('../models')

const replyController = {
  putReply: async (req, res, next) => {
    try {
      const userId = 12
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
      const userId = 12
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
  }
}

module.exports = replyController
