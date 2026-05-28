import axios from 'axios';
import { API_URL } from '../config/env';

export const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default httpClient;
