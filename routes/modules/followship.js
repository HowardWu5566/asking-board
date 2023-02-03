const router = require('express').Router()
const followshipController = require('../../controllers/followship-controller')

router.post('/', followshipController.followOthers)

module.exports = router
