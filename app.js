if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const { errorHandler } = require('./middleware/error-handler')
const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use('/api/v1', routes)
app.use(errorHandler)

app.listen(port, () => {
  console.log('app is running')
})
