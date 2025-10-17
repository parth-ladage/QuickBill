// Handles requests to routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// A general-purpose error handler that sends errors in a clean JSON format
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come in with a 200 status code, so we'll set it to 500 if that's the case
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // We only want the stack trace in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
