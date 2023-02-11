const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { User } = require('../models')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.id)
      if (!user) return done(null, false)
      return done(null, user)
    } catch (error) {
      return done(error, false)
    }
  })
)

module.exports = passport
