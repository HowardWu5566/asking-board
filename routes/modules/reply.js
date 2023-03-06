const router = require('express').Router()
const replyController = require('../../controllers/reply-controller')
const upload = require('../../middleware/multer')
const { replyValidator, validate } = require('../../middleware/validate')

router.put('/:id', upload.array('images', 5),replyValidator, validate, replyController.putReply)
router.delete('/:id', replyController.deleteReply)
router.post('/:id/like', replyController.postReplyLike)
router.delete('/:id/like', replyController.deleteReplyLike)

module.exports = router
