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
  }
}
