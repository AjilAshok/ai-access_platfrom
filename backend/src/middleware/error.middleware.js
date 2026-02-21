module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Server error";

  res.status(status).json({ message, ...(err.details ? { details: err.details } : {}) });
};