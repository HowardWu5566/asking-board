const router = require('express').Router()
const passport = require('passport')

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.LOGIN_PAGE
  }),
  function (req, res) {
    return res.redirect(
      process.env.LOGIN_PAGE +
        `?token=${req.user[1]}&user=${JSON.stringify(req.user[0])}`
    )
  }
)

module.exports = router
