const { body, validationResult } = require('express-validator')
const { grade, subject } = require('../config/questionInfo')

module.exports = {
  // 註冊驗證規則
  signUpValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 50 })
      .withMessage("can't exceed 50 characters"),
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
    })
  ],

  // 個人資料驗證規則
  profileValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ max: 50 })
      .withMessage("can't exceed 50 characters"),
    body('introduction')
      .trim()
      .isLength({ max: 200 })
      .withMessage("can't exceed 200 characters")
  ],

  // 問題驗證規則
  questionValidator: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ min: 3, max: 50 })
      .withMessage('must be between 3 and 50 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage("can't be empty")
      .isLength({ min: 10, max: 500 })
      .withMessage('must be between 10 and 500 characters'),
    body('isAnonymous').trim().isBoolean().withMessage('must be a Boolean'),
    body('grade').isIn(grade),
    body('subject').isIn(subject)
  ],

  // 回覆驗證規則
  replyValidator: body('comment')
    .trim()
    .notEmpty()
    .withMessage("can't be empty")
    .isLength({ max: 5 })
    .withMessage("can't exceed 500 characters"),

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
