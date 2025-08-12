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

FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
react_app_api_base_url=https://messnger-backend-1.onrender.com

# Feature Flags
ENABLE_AUTHENTICATION=true
ENABLE_REAL_TIME_MESSAGING=true
ENABLE_FILE_UPLOAD=true

# App Configuration
APP_NAME=WhatsApp Web UI
APP_VERSION=1.0.0
ENVIRONMENT=development

# UI Configuration
THEME=light
LANGUAGE=en`;

console.log(envTemplate);
console.log('\n🔧 After creating .env file:');
console.log('1. Restart your development server');
console.log('2. Test with phone number: +1 650-555-1234');
console.log('3. Use OTP: 123456 (for test numbers)');
console.log('\n📖 For detailed instructions, see FIREBASE_SETUP_GUIDE.md');


