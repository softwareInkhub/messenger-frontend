# Firebase Authentication System

This project implements a complete Firebase authentication system with phone number-based login and signup, using email/password authentication under the hood.

## 🚀 Features

### Authentication
- ✅ **Phone Number Signup** - Create accounts with username, phone number, and password
- ✅ **Phone Number Login** - Sign in with phone number and password
- ✅ **Email Conversion** - Automatically converts phone numbers to email format for Firebase Auth
- ✅ **User Data Storage** - Stores additional user data in Firestore
- ✅ **Form Validation** - Comprehensive client-side validation
- ✅ **Error Handling** - Detailed error messages for different scenarios

### User Management
- ✅ **User Search** - Search users by username (case-insensitive)
- ✅ **User Profiles** - Store and retrieve user profile data
- ✅ **Username Availability** - Check if usernames are available
- ✅ **Phone Number Validation** - Verify phone number format and uniqueness

### UI Components
- ✅ **Signup Page** - Complete signup form with validation
- ✅ **Login Page** - Clean login interface
- ✅ **User Search Component** - Real-time search with debouncing
- ✅ **Responsive Design** - Mobile-friendly Tailwind CSS styling

## 📁 File Structure

```
src/
├── config/
│   └── firebase.ts              # Firebase configuration and auth functions
├── pages/
│   └── auth/
│       ├── LoginPage.tsx        # Login page component
│       └── SignupPage.tsx       # Signup page component
├── utils/
│   └── firebaseUsers.ts         # User management utilities
├── components/
│   └── UserSearch.tsx           # User search component
└── routes/
    └── index.tsx                # Route configuration
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

Create a `.env` file in the root directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
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
```

### 2. Firebase Console Setup

1. **Enable Email/Password Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" provider

2. **Create Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in test mode for development

3. **Set Firestore Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for search
    }
  }
}
```

## 🎯 Usage Examples

### Signup Flow

```typescript
import { signUpWithPhone } from '../config/firebase';

const handleSignup = async () => {
  try {
    const user = await signUpWithPhone(
      '+1234567890',  // phone number
      'password123',   // password
      'johndoe'       // username
    );
    console.log('User created:', user);
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

### Login Flow

```typescript
import { signInWithPhone } from '../config/firebase';

const handleLogin = async () => {
  try {
    const user = await signInWithPhone(
      '+1234567890',  // phone number
      'password123'   // password
    );
    console.log('User logged in:', user);
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### User Search

```typescript
import { searchUsersByUsername } from '../utils/firebaseUsers';

const handleSearch = async () => {
  try {
    const users = await searchUsersByUsername('john', 10);
    console.log('Search results:', users);
  } catch (error) {
    console.error('Search error:', error);
  }
};
```

## 🔍 API Reference

### Authentication Functions

#### `signUpWithPhone(phoneNumber, password, username)`
Creates a new user account with phone number authentication.

**Parameters:**
- `phoneNumber` (string): User's phone number (e.g., "+1234567890")
- `password` (string): User's password (minimum 6 characters)
- `username` (string): Unique username (3+ characters, alphanumeric + underscore)

**Returns:** Firebase User object

#### `signInWithPhone(phoneNumber, password)`
Authenticates a user with phone number and password.

**Parameters:**
- `phoneNumber` (string): User's phone number
- `password` (string): User's password

**Returns:** Firebase User object

#### `signOutUser()`
Signs out the current user.

**Returns:** Promise<void>

### User Management Functions

#### `searchUsersByUsername(searchTerm, limitCount)`
Searches for users by username (case-insensitive).

**Parameters:**
- `searchTerm` (string): Search query
- `limitCount` (number): Maximum results (default: 10)

**Returns:** Array of SearchResult objects

#### `getUserById(uid)`
Retrieves user data by UID.

**Parameters:**
- `uid` (string): User ID

**Returns:** UserData object or null

#### `isUsernameAvailable(username)`
Checks if a username is available.

**Parameters:**
- `username` (string): Username to check

**Returns:** Boolean

#### `isPhoneNumberRegistered(phoneNumber)`
Checks if a phone number is already registered.

**Parameters:**
- `phoneNumber` (string): Phone number to check

**Returns:** Boolean

## 🎨 UI Components

### SignupPage
- **Route:** `/signup`
- **Features:** Username, phone number, password, confirm password
- **Validation:** Real-time form validation
- **Styling:** Tailwind CSS with responsive design

### LoginPage
- **Route:** `/login`
- **Features:** Phone number, password
- **Validation:** Input validation and error handling
- **Styling:** Clean, modern design

### UserSearch
- **Features:** Real-time search with debouncing
- **Props:** `onUserSelect`, `placeholder`, `className`, `maxResults`
- **Styling:** Dropdown with user avatars and info

## 🔒 Security Features

### Phone Number Conversion
Phone numbers are automatically converted to email format for Firebase Auth:
- `+1234567890` → `+1234567890@app.local`

### Data Validation
- **Username:** 3+ characters, alphanumeric + underscore only
- **Phone Number:** International format validation
- **Password:** Minimum 6 characters

### Error Handling
Comprehensive error handling for:
- Invalid phone numbers
- Weak passwords
- Duplicate usernames
- Non-existent accounts
- Network errors

## 🧪 Testing

### Test Data
Use these test phone numbers for development:
- `+1234567890` (any password)
- `+9876543210` (any password)

### Manual Testing
1. **Signup Flow:**
   - Navigate to `/signup`
   - Fill in username, phone number, password
   - Submit and verify account creation

2. **Login Flow:**
   - Navigate to `/login`
   - Enter phone number and password
   - Verify successful login

3. **User Search:**
   - Use the UserSearch component
   - Type username to search
   - Verify results display correctly

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase Auth not initialized"**
   - Check Firebase configuration in `.env`
   - Verify all required environment variables

2. **"auth/email-already-in-use"**
   - Phone number already registered
   - Use different phone number or login instead

3. **"auth/invalid-email"**
   - Invalid phone number format
   - Use international format (e.g., +1234567890)

4. **"auth/weak-password"**
   - Password too short
   - Use 6+ characters

5. **Search not working**
   - Check Firestore security rules
   - Verify database permissions

### Debug Mode
Add to `.env`:
```env
REACT_APP_DEBUG=true
```

## 📱 Mobile Responsiveness

All components are fully responsive:
- **Desktop:** Full-width forms with proper spacing
- **Tablet:** Optimized layout for medium screens
- **Mobile:** Stacked inputs with touch-friendly buttons

## 🎯 Future Enhancements

- [ ] **Profile Management** - Edit user profiles
- [ ] **Avatar Upload** - Profile picture upload
- [ ] **Password Reset** - Forgot password functionality
- [ ] **Email Verification** - Optional email verification
- [ ] **Two-Factor Auth** - Additional security layer
- [ ] **Social Login** - Google, Facebook integration
- [ ] **Session Management** - Remember login state
- [ ] **Rate Limiting** - Prevent abuse

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**


