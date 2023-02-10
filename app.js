require('dotenv').config()
const express = require('express')

const routes = require('./routes')
const { errorHandler } = require('./middleware/error-handler')
const passport = require('./config/passport')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(routes)
app.use(errorHandler)

app.listen(3000, () => {
  console.log('app is running')
})
