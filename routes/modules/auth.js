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
    return res
      .status(200)
      .json({ status: 'success', token: req.user[1], user: req.user[0] })
  }
)

module.exports = router
