const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const adminController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body
      const adminData = await User.findOne({
        where: { email, role: 'admin' },
        attributes: ['id', 'name', 'email', 'password', 'role', 'avatar']
      })
      const isPasswordCorrect = await bcrypt.compare(
        password,
        adminData.password
      )
      if (!adminData || !isPasswordCorrect)
        return res
          .status(401)
          .json({ status: 'error', message: 'email or password incorrect!' })
      const admin = adminData.tojson()
      delete admin.password
      const token = jwt.sign(admin, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      res.status(200).json({ token, admin })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminController
