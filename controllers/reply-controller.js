const { Reply, Like, Image, sequelize } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')

const replyController = {
  putReply: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { comment, image } = req.body
      const { file } = req
      const replyId = Number(req.params.id)
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({ status: 'error', message: '回覆不存在' })
      if (reply.userId !== userId)
        return res.status(401).json({ status: 'error', message: '無權限' })

      // 修改回覆
      await reply.update({
        userId,
        questionId: reply.questionId,
        comment: comment.trim(),
        image: file ? await imgurFileHandler(file) : image ? image : null
      })

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
  deleteReply: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user.id)
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({ status: 'error', message: '回覆不存在' })
      if (reply.userId !== currentUserId)
        return res.status(401).json({ status: 'error', message: '無權限' })

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
  postReplyLike: async (req, res, next) => {
    try {
      const userId = req.user.id
      const replyId = req.params.id
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({ status: 'error', message: '回覆不存在' })
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
          .json({ status: 'error', message: '已點讚此回覆' })
      return res.status(200).json({ status: 'success' })
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
        return res.status(404).json({ status: 'error', message: '回覆不存在' })
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
          .json({ status: 'error', message: '尚未點讚此回覆' })
      await like.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = replyController
