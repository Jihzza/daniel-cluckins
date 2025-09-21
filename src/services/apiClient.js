// src/services/apiClient.js
import axios from 'axios';

/**
 * Create a dedicated, configured Axios instance.
 *
 * Why do this?
 * - Centralized Configuration: Set the base URL for your API in one spot.
 * If your API domain changes, you only have to update it here.
 * - Easy Authentication: When you implement user authentication, you can add
 * interceptors here to automatically attach auth tokens to every request.
 * - Consistent Headers: Set default headers (like Content-Type) for all requests.
 */
const apiClient = axios.create({
  // --- IMPORTANT ---
  // Replace this with the actual base URL of your backend API.
  baseURL: 'http://localhost:3001/api', // Example: 'https://yourapi.com/api'
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;