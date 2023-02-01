require('dotenv').config()
const express = require('express')

const routes = require('./routes')
const passport = require('./config/passport')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(routes)

app.listen(3000, () => {
  console.log('app is running')
})
