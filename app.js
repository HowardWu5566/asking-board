const express = require('express')

const routes = require('./routes')
const app = express()

app.use(routes)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.listen(3000, () => {
  console.log('app is running')
})
