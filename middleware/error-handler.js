module.exports = {
  errorHandler: (error, res, next) => {
    return res
      .status(error.status || 500)
      .json({ status: 'error', message: 'unexpected error' })
  }
}
