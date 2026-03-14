# Login & Authentication Troubleshooting Guide

## Issue: "Failed to fetch" on Login Page

### Root Cause
The error occurs when the client tries to authenticate directly with Supabase, which fails due to:
- CORS policy restrictions
- Network connectivity issues
- Supabase service unavailability

### Solution Implemented
Moved authentication logic from client-side to server-side using Next.js Server Actions:
- Client sends credentials to server action
- Server handles Supabase authentication securely
- Session is managed via secure cookies
- No direct client-to-Supabase API calls

### Architecture

```
User Input (Client)
    ↓
loginUser() Server Action
    ↓
Supabase Server Client
    ↓
Authentication Success/Error
    ↓
Session Management (Cookies)
    ↓
Redirect to Dashboard
```

## Testing the Fix

### Step 1: Verify Environment Variables
Check that all Supabase vars are set:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `NEXT_PUBLIC_APP_URL` (optional, for redirects)

### Step 2: Test Login Flow
1. Navigate to `/auth/login`
2. Open DevTools (F12) → Console
3. Enter credentials and submit
4. Watch for `[v0]` logs showing progress:
   - `[v0] Submitting login for: user@example.com`
   - `[v0] Login successful, redirecting to dashboard`
5. Should redirect to `/dashboard` within 2 seconds

### Step 3: Test Password Reset
1. Navigate to `/auth/forgot-password`
2. Enter email address
3. Should see success message
4. Check email for reset link
5. Click link → `/auth/reset-password`
6. Enter new password
7. Submit → redirects to login

## Common Error Messages & Solutions

### "Failed to fetch"
**Cause**: Network error or CORS issue
**Fix**:
- Hard refresh page (Ctrl+Shift+R)
- Check internet connection
- Wait 30 seconds and try again
- Verify Supabase project is active

### "Invalid login credentials"
**Cause**: Wrong email/password combination
**Fix**:
- Verify email address is correct
- Check password is correct
- Use "Forgot Password" if needed
- Try sign up if account doesn't exist

### "User already registered"
**Cause**: Email already has account
**Fix**:
- Use login page instead of sign up
- Click "Forgot?" to reset password
- Use different email for new account

### "Email not confirmed"
**Cause**: Verification email not clicked
**Fix**:
- Check email inbox (including spam)
- Click verification link in email
- Request new verification email

### "Too many login attempts"
**Cause**: Rate limiting after failed attempts
**Fix**:
- Wait 15 minutes before retrying
- Check that credentials are correct
- Reset password if unsure

## Browser Console Debugging

Open DevTools (F12) and check Console tab for `[v0]` logs:

```
[v0] Submitting login for: farmer@example.com
[v0] Login successful, redirecting to dashboard
```

**If you see errors**:
```
[v0] Login error: Invalid login credentials
[v0] Login failed: User not found
```

Check the error message and cross-reference with "Common Error Messages" above.

## Server-Side Implementation Details

### Login Server Action
File: `/app/actions/auth-actions.ts`

```typescript
export async function loginUser(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) return { success: false, message: error.message }
  if (!data.session) return { success: false, message: "No session" }
  
  return { success: true, message: "Login successful" }
}
```

### Login Page Implementation
File: `/app/auth/login/page.tsx`

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  const result = await loginUser(email, password)
  
  if (!result.success) {
    setError(result.message)
    return
  }
  
  router.push("/dashboard")
}
```

### Session Management
Sessions are stored as secure cookies via:
- `@supabase/ssr` package
- `next/headers` cookies API
- Automatic refresh token handling

## Performance Notes

- Server actions run in Node.js environment (not browser)
- Supabase operations complete faster server-side
- Cookies automatically sent on subsequent requests
- No need for client-side session state

## Security Features

✓ Credentials sent via server action (encrypted in transit)
✓ No API keys exposed to client
✓ Session stored in secure HTTP-only cookies
✓ Automatic token refresh handled server-side
✓ CORS policy respected by design

## If Issues Persist

1. **Hard refresh** (Ctrl+Shift+R)
2. **Check console** for `[v0]` error logs
3. **Verify credentials** are correct
4. **Wait 30 seconds** for environment reload
5. **Check Supabase dashboard** for service status
6. **Contact support** with error message and timestamp

---

Last Updated: 2026-03-14
Fix: Server-side authentication via Next.js Server Actions
