import { normalizeError } from './errors.js';

export const createRequestInterceptor = (getCompanyId, getAuthToken) => {
  return (config) => {
    const companyId = getCompanyId();
    if (companyId) {
      config.headers['X-Company-ID'] = companyId;
    }
    
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  };
};

export const createResponseInterceptor = () => {
  return {
    onFulfilled: (response) => response,
    onRejected: (error) => Promise.reject(normalizeError(error))
  };
};