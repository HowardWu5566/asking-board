const router = require('express').Router()
const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')
const { profileValidator, accountValidator, validate } = require('../../middleware/validate')

router.put('/', upload.single('avatar'), profileValidator, validate, userController.putUser)
router.get('/', userController.getCurrentUser)
router.get('/most_replies', userController.getMostRepliesUsers)
router.get('/most_followers', userController.getMostFollowersUsers)
router.get('/most_liked', userController.getMostLikedUsers)
router.put('/account', accountValidator, validate, userController.putUserAccount)
router.get('/account', userController.getUserAccount)
router.get('/:id', userController.getUser)
router.get('/:id/questions', userController.getUserQuestions)
router.get('/:id/replies', userController.getUserReplies)
router.get('/:id/likes', userController.getUserLikes)
router.get('/:id/followers', userController.getUserFollowers)
router.get('/:id/followings', userController.getUserFollowings)

module.exports = router
