# Google OAuth Setup Complete

## What Was Implemented

### Backend Changes

1. **Database Migration** - Added OAuth columns to users table:
   - `google_id` - Unique Google user ID
   - `google_email` - Email from Google account
   - `google_picture` - Profile picture URL
   - `auth_provider` - 'local' or 'google'

2. **Google OAuth Service** (`backend/services/googleAuthService.js`):
   - Handles Google sign-in flow
   - **Account Matching Logic**:
     - If Google ID exists → Sign in existing Google user
     - If email matches existing local account → Link Google to existing account (Google takes precedence)
     - If no match → Create new account with Google

3. **Auth Controller Updates** (`backend/controllers/authController.js`):
   - Added Passport.js Google Strategy configuration
   - New endpoints: `/api/auth/google` and `/api/auth/google/callback`

4. **Dependencies Added**:
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth 2.0 strategy

### How It Works

1. **User clicks "Sign in with Google"** → Frontend redirects to `/api/auth/google`
2. **User authorizes with Google** → Google redirects back to `/api/auth/google/callback`
3. **Backend processes OAuth**:
   - Checks if Google ID exists in database
   - If not, checks if email matches existing account (links them)
   - If neither, creates new account
   - Google account always takes precedence once linked
4. **Backend redirects to frontend** with JWT token

## Configuration Needed

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

### 2. Update Backend .env

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### 3. Frontend Implementation Needed

Add a "Sign in with Google" button that redirects to:
```javascript
window.location.href = 'http://localhost:5001/api/auth/google'
```

When user returns from Google, frontend will receive URL like:
```
http://localhost:5173/?token=JWT_TOKEN&provider=google
```

Extract token from URL params and store in localStorage.

## Testing

Once configured:

1. Start backend: `cd backend && node server.js`
2. Visit: `http://localhost:5001/api/auth/google`
3. Sign in with Google
4. Should redirect back with token

## Account Matching Behavior

### Scenario 1: New User
- User signs in with Google (email: john@example.com)
- No existing account → **Creates new account with Google**

### Scenario 2: Existing Local Account
- User has account with email/password (john@example.com)
- User signs in with Google (john@example.com)
- **Links Google account to existing account**
- Google auth now takes precedence

### Scenario 3: Existing Google User
- User previously signed in with Google
- **Signs in normally with Google ID**

## Security Notes

- Existing local passwords are preserved when linking Google accounts
- Users can still sign in with email/password even after linking Google
- Google auth takes precedence once linked (recommended flow)
- JWT tokens are signed and expire after 7 days

## Next Steps

1. **Get Google OAuth credentials** from Google Cloud Console
2. **Update .env** with real credentials
3. **Implement frontend** Google sign-in button
4. **Test the flow** end-to-end
5. **(Optional) Add unlinking feature** if users want to disconnect Google

