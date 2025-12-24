const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle known business errors
  if (err.message === 'UNAUTHORIZED_COMPANY_ACCESS') {
    statusCode = 403;
    message = 'Access denied to company resources';
  } else if (err.message === 'INVALID_TOKEN' || err.message === 'NO_TOKEN_PROVIDED') {
    statusCode = 401;
    message = 'Authentication required';
  } else if (err.message.startsWith('VALIDATION_FAILED:')) {
    statusCode = 400;
    message = err.message.replace('VALIDATION_FAILED:', '').trim();
  } else if (err.message.startsWith('INSUFFICIENT_STOCK:')) {
    statusCode = 400;
    message = err.message.replace('INSUFFICIENT_STOCK:', '').trim();
  } else if (err.message === 'VOUCHER_NOT_FOUND') {
    statusCode = 404;
    message = 'Voucher not found';
  }
  // Handle PostgreSQL errors
  else if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Foreign key constraint violation';
  }
  // Use original message for other errors
  else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message,
    timestamp
  });
};

module.exports = errorHandler;