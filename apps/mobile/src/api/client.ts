import axios from 'axios';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({ 
  baseURL: 'http://localhost:3000/api/v1' 
});

apiClient.interceptors.request.use((config) => {
  if (['post', 'patch', 'put'].includes(config.method?.toLowerCase() || '')) {
    config.headers['Idempotency-Key'] = uuidv4();
  }
  return config;
});
