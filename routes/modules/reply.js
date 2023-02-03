const router = require('express').Router()
const replyController = require('../../controllers/reply-controller')

router.put('/:id', replyController.putReply)

module.exports = router
