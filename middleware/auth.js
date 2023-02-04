const passport = require('../config/passport')

module.exports = {
  authenticated: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user) => {
      if (!user)
        return res
          .status(401)
          .json({ stauts: 'error', message: 'Unauthorized' })
      if (error) return next(error)
      req.user = user.dataValues
      next()
    })(req, res, next)
  },
  authenticatedUser: (req, res, next) => {
    if (req.user.role === 'student' || req.user.role === 'teacher')
      return next()
    return res
      .status(403)
      .json({ status: 'error', message: 'Permission denied' })
  },
  authenticatedAdmin: (req, res, next) => {
    if (req.user.role === 'admin') return next()
    return res
      .status(403)
      .json({ status: 'error', message: 'Permission denied' })
  }
}
