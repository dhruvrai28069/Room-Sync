/**
 * Standard API Response Format
 */
class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'Internal Server Error', errorDetails = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails,
    });
  }
}

module.exports = ApiResponse;
