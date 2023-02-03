const { Followship, User } = require('../models')

const followshipController = {
  followOthers: async (req, res, next) => {
    try {
      const userId = 12
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
  }
}

module.exports = followshipController
