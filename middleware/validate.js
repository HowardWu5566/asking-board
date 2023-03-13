const { body, validationResult } = require('express-validator')
const { grade, subject, role } = require('../config/dropdown-value')

module.exports = {
  // 註冊驗證規則
  signUpValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('此欄位為必填')
      .isLength({ max: 20 })
      .withMessage('字數超出上限'),
    body('email').isEmail().withMessage('請填入 email'),
    body('password')
      .notEmpty()
      .withMessage('此欄位為必填')
      .isLength({ min: 8 })
      .withMessage('長度不足 8 字元'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('與密碼不相符')
      }
      return true
    }),
    body('role').notEmpty().isIn(role).withMessage('請選擇身分')
  ],

  // 帳戶設定驗證
  accountValidator: [
    body('role').isIn(role),
    body('email').isEmail().withMessage('請填入 email'),
    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('長度不足 8 字元'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('與密碼不相符')
      }
      return true
    }),
    body('password')
      .if((_, { req }) => req.body.newPassword !== undefined)
      .notEmpty()
      .withMessage('此欄位為必填')
  ],

  // 個人資料驗證規則
  profileValidator: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('此欄位為必填')
      .isLength({ max: 20 })
      .withMessage('字數超出上限'),
    body('introduction')
      .trim()
      .isLength({ max: 150 })
      .withMessage('字數超出上限')
  ],

  // 問題驗證規則
  questionValidator: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('此欄位為必填')
      .isLength({ max: 50 })
      .withMessage('字數超出上限'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('此欄位為必填')
      .isLength({ max: 500 })
      .withMessage('字數超出上限'),
    body('isAnonymous').trim().isBoolean().withMessage('格式不符'),
    body('grade').isIn(grade).withMessage('請選擇年級'),
    body('subject').isIn(subject).withMessage('請選擇科目')
  ],

  // 回覆驗證規則
  replyValidator: body('comment')
    .trim()
    .notEmpty()
    .withMessage('此欄位為必填')
    .isLength({ max: 500 })
    .withMessage('字數超出上限'),

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
