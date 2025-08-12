#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup for WhatsApp Clone');
console.log('=====================================\n');

console.log('📋 Steps to get your Firebase configuration:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Go to Project Settings (gear icon)');
console.log('4. Scroll down to "Your apps"');
console.log('5. Click "Add app" → "Web"');
console.log('6. Register your app and copy the config\n');

console.log('📝 Create a .env file in the root directory with:');
console.log('==================================================');

const envTemplate = `# Firebase Configuration
# Replace these values with your actual Firebase project configuration

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001

# Feature Flags
REACT_APP_ENABLE_AUTHENTICATION=true
REACT_APP_ENABLE_REAL_TIME_MESSAGING=true
REACT_APP_ENABLE_FILE_UPLOAD=true

# App Configuration
REACT_APP_APP_NAME=WhatsApp Web UI
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# UI Configuration
REACT_APP_THEME=light
REACT_APP_LANGUAGE=en`;

console.log(envTemplate);
console.log('\n🔧 After creating .env file:');
console.log('1. Restart your development server');
console.log('2. Test with phone number: +1 650-555-1234');
console.log('3. Use OTP: 123456 (for test numbers)');
console.log('\n📖 For detailed instructions, see FIREBASE_SETUP_GUIDE.md');


