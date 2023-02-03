const router = require('express').Router()
const replyController = require('../../controllers/reply-controller')

router.put('/:id', replyController.putReply)
router.delete('/:id', replyController.deleteReply)


module.exports = router
