const { body, validationResult } = require('express-validator')
const { grade, subject, role } = require('../config/dropdown-value')

module.exports = {
  // 註冊驗證規則
  signUpValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 20 })
      .withMessage('字數超出上限！'),
    body('email').isEmail(),
    body('password')
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ min: 8 })
      .withMessage('should be at least 8 characters long'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('password confirmation does not match password')
      }
      return true
    }),
    body('role').isIn(role)
  ],

  // 帳戶設定驗證
  accountValidator: [
    body('role').isIn(role),
    body('email').isEmail(),
    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('should be at least 8 characters long'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('password confirmation does not match new password')
      }
      return true
    }),
    body('password')
      .if((_, { req }) => req.body.newPassword !== undefined)
      .notEmpty()
      .withMessage("can't be empty")
  ],

  // 個人資料驗證規則
  profileValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 20 })
      .withMessage('字數超出上限！'),
    body('introduction')
      .trim()
      .isLength({ max: 150 })
      .withMessage('字數超出上限！')
  ],

  // 問題驗證規則
  questionValidator: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 50 })
      .withMessage('字數超出上限！'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 500 })
      .withMessage('字數超出上限！'),
    body('isAnonymous').trim().isBoolean().withMessage('must be a Boolean'),
    body('grade').isIn(grade),
    body('subject').isIn(subject)
  ],

  // 回覆驗證規則
  replyValidator: body('comment')
    .trim()
    .notEmpty()
    .withMessage("can't be empty")
    .isLength({ max: 500 })
    .withMessage('字數超出上限！'),

  // 執行驗證
  validate: (req, res, next) => {
    const errorInfo = validationResult(req)
    // 編輯錯誤訊息
    const errorMsg = errorInfo.errors.reduce((obj, error) => {
      obj[error.param] = error.msg
      return obj
    }, {})
    if (!errorInfo.isEmpty()) {
      return res.status(422).json({
        status: 'error',
        message: errorMsg
      })
    }
    next()
  }
}
