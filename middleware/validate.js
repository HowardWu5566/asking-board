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

  // 驗證註冊
  signUpValidate: (req, res, next) => {
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
  },

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

  // 驗證問題
  questionValidate: (req, res, next) => {
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
  },

  // 回覆驗證規則
  replyValidator: body('comment')
    .trim()
    .notEmpty()
    .withMessage("can't be empty")
    .isLength({ max: 500 })
    .withMessage("can't exceed 500 characters"),

  //驗證回覆
  replyValidate: (req, res, next) => {
    const errorInfo = validationResult(req)
    if (!errorInfo.isEmpty()) {
      return res.status(422).json({
        status: 'error',
        message: errorInfo.errors[0].msg
      })
    }
    next()
  }
}
