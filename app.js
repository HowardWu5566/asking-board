const express = require('express')

const routes = require('./routes')
const { errorHandler } = require('./middleware/error-handler')
const app = express()

app.use(routes)
app.use(errorHandler)

app.listen(3000, () => {
  console.log('app is running')
})
