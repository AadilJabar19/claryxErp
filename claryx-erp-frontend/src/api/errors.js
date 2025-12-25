export const ERROR_TYPES = {
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  PERIOD_LOCK: 'period_lock',
  SERVER: 'server',
  NETWORK: 'network'
};

export class ApiError extends Error {
  constructor(type, message, details = null, status = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.details = details;
    this.status = status;
  }
}

export const normalizeError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 422) {
      return new ApiError(ERROR_TYPES.VALIDATION, 'Validation failed', data.errors, status);
    }
    
    if (status === 403) {
      return new ApiError(ERROR_TYPES.PERMISSION, 'Access denied', data.message, status);
    }
    
    if (status === 423) {
      return new ApiError(ERROR_TYPES.PERIOD_LOCK, 'Period is locked', data.message, status);
    }
    
    return new ApiError(ERROR_TYPES.SERVER, data.message || 'Server error', data, status);
  }
  
  return new ApiError(ERROR_TYPES.NETWORK, 'Network error', null, null);
};