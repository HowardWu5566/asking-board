const { Reply, Like, Image, sequelize } = require('../models')
const { Op } = require('sequelize')
const { imgurFileHandler } = require('../helpers/file-helper')

const replyController = {
  putReply: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { comment, images } = req.body
      const { files } = req
      const replyId = Number(req.params.id)
      const reply = await Reply.findByPk(replyId)
      if (!reply)
        return res.status(404).json({ status: 'error', message: '回覆不存在' })
      if (reply.userId !== userId)
        return res.status(401).json({ status: 'error', message: '無權限' })

      await sequelize.transaction(async putReply => {
        // 修改回覆
        const updatedReply = {
          userId,
          questionId: reply.questionId,
          comment: comment.trim()
        }
        await reply.update(updatedReply, { transaction: putReply })

        const existedImgs = await Image.findAll({
          raw: true,
          nest: true,
          attributes: ['id'],
          where: { object: 'reply', objectId: replyId },
          transaction: putReply
        })
        const deletedImgIds = existedImgs
          .filter(item => !images?.includes(item.id.toString()))
          .map(item => item.id)

        // 修改後移除圖片
        await Image.destroy({
          where: {
            id: { [Op.in]: deletedImgIds }
          },
          transaction: putReply
        })

        // 修改後新增圖片
        if (files) {
          for (const file of files) {
            await Image.create(
              {
                object: 'reply',
                objectId: reply.dataValues.id,
                url: await imgurFileHandler(file),
                isSeed: false
              },
              { transaction: putReply }
            )
          }
        }
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
        return res.status(404).json({ status: 404, message: '回覆不存在' })
      if (reply.userId !== currentUserId)
        return res.status(401).json({ status: 'error', message: '無權限' })

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
