function notFound(req, res) {
  res.status(404).json({ message: "Endpoint not found" });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) return next(err);

  if (err.code === "23505") {
    return res.status(409).json({ message: "A record with this unique value already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ message: "A referenced record does not exist" });
  }
  if (err.code === "23514" || err.code === "22P02") {
    return res.status(400).json({ message: "Invalid data supplied" });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
