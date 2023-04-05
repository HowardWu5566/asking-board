const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcryptjs')
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback'
    },
    async function (accessToken, refreshToken, profile, done) {
      let user = await User.findOne({
        attributes: ['id', 'name', 'email', 'role', 'avatar'],
        where: { email: profile.emails[0].value, isLocalAccount: false }
      })
      if (!user)
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10),
          role: '學生',
          avatar: profile.photos[0].value
        })
      const userData = user.toJSON()
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      return done(null, [userData, token])
    }
  )
)

module.exports = passport
