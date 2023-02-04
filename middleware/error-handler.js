module.exports = {
  errorHandler: (error, res) => {
    return res
      .status(error.status || 500)
      .json({ status: 'error', message: 'unexpected error' })
  },
  undefinedRoute: (req, res) => {
    return res
      .status(404)
      .json({ status: 'error', message: 'path not found' })
  }
}
