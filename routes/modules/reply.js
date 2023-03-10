const router = require('express').Router()
const replyController = require('../../controllers/reply-controller')

router.put('/:id', replyController.putReply)
router.delete('/:id', replyController.deleteReply)
router.post('/:id/like', replyController.postReplyLike)
router.delete('/:id/like', replyController.deleteReplyLike)

module.exports = router
