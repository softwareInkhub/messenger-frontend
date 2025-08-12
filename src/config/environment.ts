// Environment configuration with validation
export const environment = {
  // API Configuration
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  
  // Firebase Configuration
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  },
  
  // App Configuration
  app: {
    name: process.env.REACT_APP_APP_NAME || 'WhatsApp Web UI',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  },
  
  // Feature Flags
  features: {
    authentication: process.env.REACT_APP_ENABLE_AUTHENTICATION === 'true',
    realTimeMessaging: process.env.REACT_APP_ENABLE_REAL_TIME_MESSAGING === 'true',
    fileUpload: process.env.REACT_APP_ENABLE_FILE_UPLOAD === 'true',
  },
  
  // UI Configuration
  ui: {
    theme: process.env.REACT_APP_THEME || 'light',
    language: process.env.REACT_APP_LANGUAGE || 'en',
  },
};

// API Constants for backend endpoints
export const API_CONSTANTS = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  ENDPOINTS: {
    SEND_MESSAGE: '/api/sendMessage',
    GET_MESSAGES: '/api/getMessages',
    GET_MESSAGES_BY_SENDER: '/api/messages/sender',
    GET_MESSAGES_BY_RECEIVER: '/api/messages/receiver',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  BACKEND_ERROR: 'Backend service error. Please try again later.',
  VALIDATION_ERROR: 'Invalid data provided.',
  UNAUTHORIZED: 'Unauthorized access.',
  NOT_FOUND: 'Resource not found.',
};







