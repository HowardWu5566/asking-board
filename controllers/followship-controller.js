const { Followship, User, sequelize } = require('../models')
const { Op } = require('sequelize')

const followshipController = {
  followOthers: async (req, res, next) => {
    try {
      const userId = req.user.id
      const followingId = Number(req.body.id)
      if (userId === followingId)
        return res
          .status(422)
          .json({ status: 'error', message: "You can't follow yourself!" })
      const user = await User.findByPk(followingId)
      if (!user || user.role === 'admin')
        return res
          .status(404)
          .json({ status: 'error', message: "user doesn't exist!" })
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
          .json({ status: 'error', message: 'You have followed the user!' })
      res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  },
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
          .json({ status: 'error', message: "user doesn't exist!" })
      if (!followship)
        return res
          .status(422)
          .json({ status: 'error', message: "You haven't followed the user!" })
      await followship.destroy()
      res.status(200).json({ status: 'success' })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = followshipController
