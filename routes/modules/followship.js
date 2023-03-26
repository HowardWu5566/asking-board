const router = require('express').Router()
const followshipController = require('../../controllers/followship-controller')

router.post('/:id', followshipController.followOthers)
router.delete('/:id', followshipController.unfollowOthers)

module.exports = router
