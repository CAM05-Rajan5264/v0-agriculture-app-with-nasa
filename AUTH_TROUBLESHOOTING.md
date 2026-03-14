# Authentication & Password Reset Troubleshooting Guide

## Common Issues & Solutions

### 1. "Failed to fetch" Error on Forgot Password Page

**Problem:** Getting network error when requesting password reset

**Root Cause:** CORS (Cross-Origin Resource Sharing) issue when calling Supabase from client-side

**Solution - FIXED:**
- Migrated to Server Actions for all auth requests
- Password reset now runs on server-side (no CORS issues)
- Automatic retry with exponential backoff
- Graceful fallback to detailed error messages

**What Changed:**
- Forgot Password: Uses `requestPasswordReset()` server action
- Reset Password: Uses `resetPassword()` server action  
- Both avoid browser fetch restrictions

### 2. "Login Failed" Error

**Problem:** Cannot sign in with email/password

**Causes & Solutions:**

**a) Supabase Environment Variables Not Set**
- Check: Settings → Vars
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Action: Verify all 3 are populated and correct

**b) Wrong Email/Password**
- Verify email is correct
- Check CAPS LOCK is off
- Try resetting password instead (click "Forgot?")

**c) User Account Doesn't Exist**
- Go to `/auth/sign-up` to create account
- Or check email confirmation if using email verification

**d) CORS/Network Blocked**
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for detailed errors
- Verify internet connection

### 3. "Failed to Send Reset Email"

**Problem:** Error when clicking "Send Reset Link"

**Causes & Solutions:**

**a) Invalid Email Address**
- Use valid email format: `user@domain.com`
- No spaces or special characters

**b) Email Not in Database**
- Account must exist first
- Create account at `/auth/sign-up`

**c) Server Error**
- Check Supabase project is active
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Wait 30 seconds and retry

**d) Rate Limiting**
- Supabase may limit requests to prevent abuse
- Wait 5 minutes before retrying
- Check email (link sent successfully but error appeared)

### 4. "Passwords Do Not Match"

**Problem:** Error when resetting password

**Solution:**
- Confirm both password fields have SAME password
- No typos or extra spaces
- Both fields must be identical

### 5. "Password Must Be At Least 6 Characters"

**Problem:** Password rejected for being too short

**Solution:**
- Use password of 6+ characters
- For strong password: 10+ chars with uppercase + numbers
- See strength indicator (changes color as you type)

### 6. "Reset Link Expired"

**Problem:** Password reset link not working

**Causes & Solutions:**

**a) Link Older Than 24 Hours**
- Request new reset link
- Links expire after 24 hours for security

**b) Link Already Used**
- Password already reset successfully
- Try logging in with new password
- If forgotten, request new reset link

**c) Malformed Link URL**
- Ensure full URL copied from email
- Don't edit or modify the link
- Use link within 24 hours of receiving

### 7. "Invalid Session" or "Not Authenticated"

**Problem:** Reset password page says invalid session

**Solution:**
- Must click link from reset email
- Clicking link establishes valid session
- Don't try accessing page directly
- Request new reset link if needed

## Testing the Password Reset Flow

### Complete Test Steps:

1. **Test Request Reset Email:**
   - Go to `/auth/forgot-password`
   - Enter valid email from account
   - Click "Send Reset Link"
   - Expected: "Check your email" success message

2. **Verify Email Received:**
   - Check email inbox
   - Look for "FarmPulse Password Reset"
   - Check spam folder if not found
   - Link valid for 24 hours

3. **Click Reset Link:**
   - Click link from email
   - Should redirect to `/auth/reset-password?token=...`
   - Page should show "Create a Strong Password" form

4. **Reset Password:**
   - Enter new password (6+ characters)
   - Confirm password (must match)
   - Watch strength indicator
   - Click "Reset Password"
   - Expected: Redirect to login after 2 seconds

5. **Login with New Password:**
   - Use new password to sign in
   - Should successfully enter dashboard

## Debug Logs

### View Detailed Logs:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with `[v0]`
4. Logs show:
   - Password reset request sent
   - Server action execution
   - Success/failure status
   - Error messages with details

### Example Log Output:
```
[v0] Submitting password reset request for: farmer@example.com
[v0] Server action: Requesting password reset for farmer@example.com
[v0] Supabase client created, calling resetPasswordForEmail
[v0] Password reset email sent successfully
```

## Supabase Configuration Checklist

- [ ] Supabase project created and active
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vars
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vars
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vars
- [ ] Email configuration enabled in Supabase
- [ ] Email templates set for password recovery
- [ ] Redirect URL configured: `{APP_URL}/auth/reset-password`

## Network Requirements

**CORS/Security:**
- Server Actions bypass CORS automatically
- No browser fetch restrictions
- Requests go through Next.js server

**Firewall/Network:**
- Allow outbound HTTPS to supabase.co
- No VPN should block auth requests
- Check proxy settings if behind corporate firewall

## Recovery Procedures

### If You Can't Reset Password:

1. **Try Alternative Email:**
   - If account has multiple emails
   - Add secondary email to Supabase account

2. **Contact Supabase Support:**
   - Go to Supabase Dashboard
   - Settings → Support
   - Request account recovery

3. **Re-signup:**
   - Create new account at `/auth/sign-up`
   - Use different email address
   - Clear browser cookies if same email

### If Email Not Received:

1. Check spam/junk folder
2. Check sender is "noreply@supabase.io"
3. Wait 2-3 minutes (email can be slow)
4. Request new reset link
5. Try different email if available
6. Contact Supabase support if persistent

## Performance & Optimization

**Server Actions Benefits:**
- No CORS issues
- Direct server-to-server communication
- Automatic error handling
- Full retry logic with exponential backoff
- Session management handled server-side
- Cookie-based authentication (more secure)

**Expected Response Times:**
- Password reset request: 1-3 seconds
- Email delivery: 1-5 minutes
- Password update: 1-2 seconds

## Security Notes

- Passwords never sent to client
- Server-side validation of all inputs
- HTTPS required (enforced by Supabase)
- Reset tokens expire in 24 hours
- Sessions managed securely with cookies
- No sensitive data logged to console
