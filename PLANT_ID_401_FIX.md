# Plant.id API 401 Unauthorized Error - Troubleshooting

## Error Details
- **Status**: 401 Unauthorized
- **Message**: "The specified api key not found"
- **Root Cause**: plant.id API is rejecting the provided API key

## Diagnosis Steps

### Step 1: Verify API Key Format
The API key you provided: `LUb1izCbjL5YpagT7coo0xddOqkphSJbIPpv89og4DG4K8oBVB`
- Length: 60 characters
- Format: Base64-like alphanumeric string

This format looks correct for a plant.id API key.

### Step 2: Check Environment Variable Setup
Run the test endpoint to verify the API key was properly loaded:
1. Open your browser and navigate to: `/api/test-plant-id-key` (POST request)
2. Check the response - it will tell you exactly what's happening

### Step 3: Possible Root Causes

**Issue 1: Environment Variable Not Reloaded**
- After adding `PLANT_ID_API_KEY` to Vars, the system needs 30-60 seconds to reload
- **Fix**: Wait 1 minute, then hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

**Issue 2: API Key is Invalid**
- The API key might be expired or not associated with any active plan
- **Fix**: 
  - Log into your plant.id account at https://web.plant.id
  - Check if the API key is still active
  - Generate a new API key if needed
  - Update the PLANT_ID_API_KEY in Vars

**Issue 3: API Key Format Wrong**
- Some plant.id versions use different header formats
- **Fix**: Try using `X-API-Key` header instead of `Api-Key`

**Issue 4: Free Tier Limitations**
- Some plant.id plans have request limits or geographic restrictions
- **Fix**: Check your plan details in plant.id dashboard

## Solutions

### Solution 1: Verify & Re-add API Key (Recommended)
1. Go to Settings ⚙️ → Vars
2. Delete the existing `PLANT_ID_API_KEY` entry
3. Add it again with the correct key: `LUb1izCbjL5YpagT7coo0xddOqkphSJbIPpv89og4DG4K8oBVB`
4. Wait 60 seconds for reload
5. Hard refresh the page
6. Try image analysis again

### Solution 2: Regenerate API Key
If the key doesn't work after step 1:
1. Visit https://web.plant.id/dashboard
2. Navigate to API Settings
3. Generate a new API key
4. Update it in your Vars section
5. Wait 60 seconds and test again

### Solution 3: Alternative Header Format
If the key is valid but still fails, try different header names. We'll test:
- `Api-Key: <your-key>` (current)
- `X-API-Key: <your-key>` (alternative)
- `Authorization: Bearer <your-key>` (fallback)

## Debug Information Available

Check browser console for [v0] logs showing:
- API key length and format
- Request headers being sent
- API response status and body
- Whether fallback analysis is being used

## If Still Not Working

1. Copy the exact API key from plant.id dashboard (avoid copy-paste errors)
2. Open dev tools (F12) → Network tab
3. Upload an image to analyze
4. Look at the request to `https://api.plant.id/v2/identify`
5. Check the headers - verify `Api-Key` is present
6. Check the response - see exact error message

## Fallback Mode

If the API key cannot be fixed, the system automatically falls back to local image analysis:
- Plant health assessment
- Color-based disease detection
- No API key required
- Works offline

This ensures the app remains functional even without the plant.id API.
