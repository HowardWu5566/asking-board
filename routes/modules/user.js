const router = require('express').Router()
const userController = require('../../controllers/user-controller')
const upload = require('../../middleware/multer')
const {
  profileValidator,
  profileValidate
} = require('../../middleware/validate')

router.put(
  '/',
  upload.single('avatar'),
  profileValidator,
  profileValidate,
  userController.putUser
)
router.get('/most_replies', userController.getMostRepliesUsers)
router.get('/most_followers', userController.getMostFollowersUsers)
router.get('/most_liked', userController.getMostLikedUsers)
router.put('/account', userController.putUserAccount)
router.get('/:id', userController.getUser)
router.get('/:id/questions', userController.getUserQuestions)
router.get('/:id/replies', userController.getUserReplies)
router.get('/:id/likes', userController.getUserLikes)
router.get('/:id/followers', userController.getUserFollowers)
router.get('/:id/followings', userController.getUserFollowings)

module.exports = router
