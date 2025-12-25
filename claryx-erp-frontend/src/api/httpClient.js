import axios from 'axios';
import { API_CONFIG } from '../config/api.js';
import { createRequestInterceptor, createResponseInterceptor } from './interceptors.js';

class HttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    const requestInterceptor = createRequestInterceptor(
      () => this.getCompanyId(),
      () => this.getAuthToken()
    );
    
    const responseInterceptor = createResponseInterceptor();
    
    this.client.interceptors.request.use(requestInterceptor);
    this.client.interceptors.response.use(
      responseInterceptor.onFulfilled,
      responseInterceptor.onRejected
    );
  }
  
  setCompanyId(companyId) {
    this.companyId = companyId;
  }
  
  getCompanyId() {
    return this.companyId;
  }
  
  setAuthToken(token) {
    this.authToken = token;
  }
  
  getAuthToken() {
    return this.authToken;
  }
  
  get(url, config = {}) {
    return this.client.get(url, config);
  }
  
  post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }
  
  put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }
  
  delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

export default new HttpClient();