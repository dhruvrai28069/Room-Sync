const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error Handler] ${err.message}`, err.stack);
  
  return ApiResponse.error(
    res,
    err.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : null,
    statusCode
  );
};

module.exports = {
  notFound,
  errorHandler,
};
