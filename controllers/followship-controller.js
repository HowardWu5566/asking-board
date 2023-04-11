const { Followship, User } = require('../models')

const followshipController = {
  // 追蹤他人
  followOthers: async (req, res, next) => {
    try {
      const userId = req.user.id
      const followingId = Number(req.params.id)
      if (userId === followingId)
        return res
          .status(422)
          .json({ status: 'error', message: '不可追蹤自己' })
      const user = await User.findByPk(followingId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 'error', message: '使用者不存在' })
      const followship = await Followship.findOrCreate({
        where: {
          followingId,
          followerId: userId
        },
        defaults: { isSeed: false }
      })
      if (!followship[1])
        return res
          .status(422)
          .json({ status: 'error', message: '已追蹤此使用者' })
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },

  // 取消追蹤他人
  unfollowOthers: async (req, res, next) => {
    try {
      const userId = req.user.id
      const followingId = req.params.id
      const [user, followship] = await Promise.all([
        User.findByPk(followingId),
        Followship.findOne({
          where: {
            followingId,
            followerId: userId
          }
        })
      ])
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 'error', message: '使用者不存在' })
      if (!followship)
        return res
          .status(422)
          .json({ status: 'error', message: '尚未追蹤此使用者' })
      await followship.destroy()
      return res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = followshipController
