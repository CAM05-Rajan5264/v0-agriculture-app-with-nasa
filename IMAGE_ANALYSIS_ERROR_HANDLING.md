# Image Analysis Error Handling Guide

## Quick Reference

| Error Type | Message | Status | Solution | Time to Fix |
|-----------|---------|--------|----------|------------|
| API Key Missing | "API Key Not Configured" | 🔴 | Add PLANT_ID_API_KEY to Vars | 2 min |
| Invalid API Key | "Invalid API Key" | 🔴 | Verify key: `2b106T6wt500zga8mnEmtoDu` | 1 min |
| Bad Image Format | "Invalid image format" | 🟡 | Use JPG/PNG/GIF, <5MB | 1 min |
| No Plant Detected | "Not a plant detected" | 🟡 | Upload plant image | 2 min |
| Can't Identify | "Unable to identify plant" | 🟡 | Better lighting/focus | 5 min |
| Network Error | Network timeout | 🔴 | Check connection, retry | 2 min |
| Rate Limited | "Rate limit exceeded" | 🟡 | Wait 5-10 min | 10 min |
| Server Error | "API Server Error" | 🔴 | Wait, try again | 5 min |
| Timeout | Request timeout | 🟡 | Try smaller image | 2 min |

---

## Detailed Error Scenarios

### 1. API Key Missing or Not Configured

**Error Message:**
```
API Key Not Configured - Analysis service temporarily unavailable
Symptoms: Unable to connect to analysis service
```

**Root Causes:**
- Environment variable not added
- Wrong variable name (not `PLANT_ID_API_KEY`)
- Environment not reloaded after adding

**Step-by-Step Fix:**
```
1. Click ⚙️ Settings (top right)
2. Click "Vars" section
3. Look for PLANT_ID_API_KEY
   ├─ If missing: Click "Add New"
   ├─ Name: PLANT_ID_API_KEY
   ├─ Value: 2b106T6wt500zga8mnEmtoDu
   └─ Click Save
4. Wait 30 seconds (environment reload)
5. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
6. Try uploading image again
```

**Verification:**
- Open browser DevTools (F12)
- Go to Console tab
- Upload image
- Should see: `[v0] API Key check - Key exists: true`

**Time to Fix:** 2-3 minutes

---

### 2. Invalid or Incorrect API Key

**Error Message:**
```
Invalid API Key - API key is incorrect or expired
```

**Root Causes:**
- Typo in API key
- Extra spaces before/after key
- Copy-paste error
- Corrupted key value

**Step-by-Step Fix:**
```
1. Go to Settings → Vars
2. Find PLANT_ID_API_KEY
3. Verify exact value: 2b106T6wt500zga8mnEmtoDu
   └─ No spaces, no extra characters
4. If incorrect:
   ├─ Click the variable
   ├─ Clear the value completely
   ├─ Paste exactly: 2b106T6wt500zga8mnEmtoDu
   ├─ Click Save
5. Wait 30 seconds
6. Hard refresh page
7. Try again
```

**Quick Check:**
- Copy the key from documentation
- Paste in Vars (removes formatting)
- Count characters: should be 28 characters

**Time to Fix:** 1-2 minutes

---

### 3. Invalid Image Format

**Error Message:**
```
Invalid image format - Please upload a valid image file
```

**Root Causes:**
- Not an image file (uploaded document, etc.)
- Corrupted image file
- Unsupported format
- Image too large (>5MB)

**Step-by-Step Fix:**
```
1. Check image file:
   ├─ Format: JPG, PNG, or GIF only
   ├─ Size: Less than 5MB
   ├─ Not corrupted (can open in image viewer)
2. Try different image:
   ├─ Take new photo of plant
   ├─ Use PNG or JPG format
   ├─ Ensure under 5MB
3. Compress if needed:
   ├─ Use online image compressor
   ├─ Or reduce resolution
4. Try uploading again
```

**Recommended Image Settings:**
- **Format:** JPG or PNG (best compatibility)
- **Size:** 2-4MB (ideal)
- **Max Size:** 5MB hard limit
- **Resolution:** 640x480 minimum (higher is better)
- **Compression:** Moderate (keeps quality)

**Time to Fix:** 1-5 minutes

---

### 4. Not a Plant Detected

**Error Message:**
```
Not a plant detected - Probability: 0.3
Please upload an image of a plant or crop
```

**Root Causes:**
- Image contains object, not plant
- Plant barely visible in frame
- Image too dark or unclear
- Wrong subject matter

**Step-by-Step Fix:**
```
1. Verify image content:
   ├─ Does it contain a plant? ✓
   ├─ Is plant clearly visible? ✓
   ├─ Is plant the main subject? ✓
2. Try different image with:
   ├─ Clear plant/leaf visible
   ├─ Good lighting (natural daylight)
   ├─ Plant fills most of frame
   ├─ No objects obscuring plant
3. Examples of valid images:
   ├─ Close-up of single leaf
   ├─ Whole plant photo
   ├─ Plant part with disease
   ├─ Leaf on white background
```

**Photo Tips:**
- ✅ Natural daylight preferred
- ✅ Plant is main focus
- ✅ Clear background
- ✅ In focus (not blurry)
- ❌ Don't: Mixed objects, unclear focus
- ❌ Don't: Artificial lighting only
- ❌ Don't: Plant barely visible

**Time to Fix:** 3-10 minutes

---

### 5. Unable to Identify Plant

**Error Message:**
```
Unable to identify plant - Confidence: 0.0
Plant type not recognized by API
```

**Root Causes:**
- Image quality too low
- Plant not in plant.id database
- Multiple plants in image
- Unclear/blurry image
- Poor lighting

**Step-by-Step Fix:**
```
1. Improve image quality:
   ├─ Take in natural sunlight
   ├─ Ensure sharp focus
   ├─ Fill frame with plant
   ├─ Higher resolution camera
2. Focus on distinctive features:
   ├─ Clear leaf shape
   ├─ Leaf color/texture
   ├─ Plant structure
   ├─ Visible details
3. Try different angle:
   ├─ Photograph leaf directly
   ├─ Show leaf underside
   ├─ Different plant part
4. Retry analysis
```

**Image Quality Checklist:**
- [ ] Image is in focus (not blurry)
- [ ] Good lighting (no harsh shadows)
- [ ] Plant details clearly visible
- [ ] Leaf texture visible
- [ ] Color accurate
- [ ] Background simple/clear
- [ ] No motion blur
- [ ] Resolution 1000x1000+ pixels

**Time to Fix:** 5-15 minutes

---

### 6. Network/Connectivity Errors

**Error Message:**
```
Network Connection Error - Unable to reach plant.id API
Check your internet connection and try again
```

**Root Causes:**
- Internet connection lost
- Plant.id API server down
- Firewall blocking requests
- Proxy/VPN issues
- DNS resolution failure

**Step-by-Step Fix:**
```
1. Check internet:
   ├─ Open google.com in new tab
   ├─ Can you browse? Yes → continue
   ├─ No → Fix internet, then retry
2. Wait and retry:
   ├─ API might be temporarily down
   ├─ Wait 1-2 minutes
   ├─ Try uploading again
3. Try different network:
   ├─ Switch WiFi network
   ├─ Use mobile hotspot
   ├─ Try wired connection if available
4. Clear browser cache:
   ├─ Ctrl+Shift+Delete (Windows)
   ├─ Cmd+Shift+Delete (Mac)
   ├─ Clear all (especially cached images)
   ├─ Hard refresh page
5. Check firewall/VPN:
   ├─ Disable VPN temporarily
   ├─ Check firewall settings
   ├─ Whitelist v0.app domain
6. Try incognito window:
   ├─ Open private/incognito window
   ├─ Navigate to v0.app
   ├─ Try uploading again
```

**Verification:**
- Can access google.com? → Yes
- Speed test site shows good connection? → Yes
- No VPN interference? → Yes
- Firewall allows HTTPS? → Yes

**Time to Fix:** 2-10 minutes

---

### 7. Rate Limit Exceeded

**Error Message:**
```
Rate Limit Exceeded - Too many requests to the API
Wait 5-10 minutes before trying again
```

**Root Causes:**
- Too many analysis requests in short time
- Plant.id free tier limit reached
- Multiple users on same API key
- Monthly quota exceeded

**Step-by-Step Fix:**
```
1. Immediate: Wait 5-10 minutes
2. Check usage:
   ├─ Log into plant.id dashboard
   ├─ Check remaining requests
   ├─ See monthly quota
3. Options:
   ├─ Option A: Wait for monthly reset
   ├─ Option B: Upgrade plant.id plan
   ├─ Option C: Get new API key
4. Best Practices:
   ├─ Don't upload same image twice
   ├─ Space out requests (5+ seconds apart)
   ├─ Combine multiple analyses if possible
```

**Rate Limits:**
- **Free Tier:** 100 requests/month
- **Per Second:** 1 request/second max
- **Per Hour:** ~5 requests/hour sustainable
- **Monthly Reset:** 1st of each month (UTC)

**Usage Tracking:**
```javascript
// Each analysis uses 1 request
// Monitor in browser console:
[v0] API response received in 8234 ms
[v0] Suggestions count: 5 (= 1 request)
```

**Time to Fix:** 5-10 minutes (wait) or upgrade

---

### 8. API Server Error

**Error Message:**
```
API Server Error - plant.id API encountered an error
Please try again in a moment
```

**Root Causes:**
- Plant.id API server temporary outage
- Server maintenance
- Server overload
- Internal API error

**Step-by-Step Fix:**
```
1. Immediate action: Wait 5 minutes
2. Retry analysis:
   ├─ Try same image again
   ├─ Different image might help
3. Check status:
   ├─ Visit: https://www.plant.id/status
   ├─ Check for known outages
4. Alternative:
   ├─ Try incognito window
   ├─ Try different device
   ├─ Try at different time
5. If persistent:
   ├─ Contact plant.id support
   ├─ Report error with timestamp
```

**Status Page:**
- plant.id publishes status updates
- Check for maintenance windows
- Service status page at: https://status.plant.id/ (if available)

**Time to Fix:** 5-30 minutes (wait for server recovery)

---

### 9. Request Timeout

**Error Message:**
```
Request Timeout - API request took too long
```

**Root Causes:**
- Slow internet connection
- Large image file
- API server slow/overloaded
- Browser timeout limit reached

**Step-by-Step Fix:**
```
1. Reduce image size:
   ├─ Compress before uploading
   ├─ Reduce resolution
   ├─ Target: 2-3MB
2. Improve connection:
   ├─ Use faster WiFi
   ├─ Wired connection preferred
   ├─ Close other bandwidth-heavy apps
3. Retry:
   ├─ Wait 30 seconds
   ├─ Try uploading again
4. Alternative:
   ├─ Try different device
   ├─ Try mobile connection
```

**Image Optimization:**
- **Original:** 5MB image → Likely timeout
- **Optimized:** 2MB image → Usually succeeds
- **Target:** 1-3MB sweet spot
- **Tool:** Use online image compressor

**Time to Fix:** 2-5 minutes

---

## Browser Console Debugging

### Enable DevTools:
- **Windows:** F12 or Ctrl+Shift+I
- **Mac:** Cmd+Option+I or Cmd+Shift+I
- **Chrome:** ⋮ → More Tools → Developer Tools

### Navigate to Console Tab:
- Click "Console" tab at top
- You'll see `[v0]` prefixed messages

### Successful Analysis Logs:
```javascript
[v0] API Key check - Key exists: true
[v0] Sending image to plant.id API for analysis...
[v0] Image size: 2456789 bytes
[v0] API response received in 8234 ms
[v0] API Status: 200 OK
[v0] Plant ID API response received successfully
[v0] Suggestions count: 5
[v0] Plant probability: 0.95
```

### Error Analysis Logs:
```javascript
[v0] API Key check - Key exists: false
[v0] ERROR: Plant ID API key not configured
[v0] Please add PLANT_ID_API_KEY to environment variables
[v0] Using fallback analysis

// OR

[v0] Plant ID API error: 401 Unauthorized
[v0] ERROR: Invalid API key
[v0] Falling back to local analysis due to API error

// OR

[v0] Network error - unable to reach plant.id API
[v0] Plant ID API failed: Failed to fetch
```

### Copy Logs for Support:
1. Right-click in Console
2. Select "Save as..." 
3. Share logs with support team

---

## Automatic Fallback System

If all errors occur, the system automatically switches to **local image analysis**:

**Fallback Capabilities:**
- ✅ Basic plant health assessment
- ✅ Color-based disease detection
- ✅ Green/yellow/brown color analysis
- ✅ Spotting pattern recognition
- ✅ Local processing (no API needed)

**Fallback Results:**
```
Plant Appears Healthy
├─ Confidence: 75%
├─ Symptoms: ["Green foliage", "Normal growth pattern"]
├─ Treatment: Continue regular maintenance
└─ Urgency: Low

OR

Early Blight (Detected)
├─ Confidence: 85% (based on color analysis)
├─ Severity: Moderate
├─ Symptoms: ["Brown spots", "Yellowing leaves"]
├─ Treatment: Apply fungicide, remove affected leaves
└─ Recommendations: [List of actions]
```

**When Fallback Triggers:**
- API key not configured
- API unavailable/timeout
- Network error
- Invalid API key
- Any other critical error

---

## Testing Error Scenarios

### Test Case 1: No API Key
```
1. Remove PLANT_ID_API_KEY from Vars
2. Hard refresh page
3. Upload image
4. Should see: "API Key Not Configured" error
5. Browser logs show: [v0] API Key check - Key exists: false
```

### Test Case 2: Bad Image Format
```
1. Try uploading .txt file
2. Should see: "Invalid image format" error
3. Or: "Please select a valid image file"
```

### Test Case 3: Non-Plant Image
```
1. Upload photo of dog, car, building, etc.
2. Should see: "Not a plant detected" error
3. Probability: <0.5
```

### Test Case 4: Valid Plant Image
```
1. Upload clear plant/leaf photo
2. Should see: Analysis results with plant name
3. Disease status (if applicable)
4. Treatment recommendations
5. Browser logs show: [v0] Plant probability: >0.8
```

---

## Summary Table

| Scenario | Detection | Response | User Action | Time |
|----------|-----------|----------|-------------|------|
| No API Key | Immediate | API_KEY_MISSING | Add to Vars | 2m |
| Bad Key | On Send | INVALID_KEY | Verify key | 1m |
| Bad Image | On Send | IMAGE_FORMAT_ERROR | Try different image | 2m |
| Not Plant | On Analysis | NOT_A_PLANT | Upload plant photo | 5m |
| Can't Identify | On Analysis | CANT_IDENTIFY | Better quality image | 5m |
| Network Down | On Send | NETWORK_ERROR | Check internet | 5m |
| Rate Limited | On Send | RATE_LIMIT | Wait 5-10 min | 10m |
| Server Error | On Send | API_ERROR | Wait, retry | 5m |
| Timeout | On Send | TIMEOUT | Smaller image | 2m |

---

## Getting Help

**If error persists after all steps:**

1. **Check documentation:**
   - DISEASE_DETECTION_SETUP.md
   - PLANT_ID_SETUP_GUIDE.md
   - PLANTNET_INTEGRATION.md

2. **Check browser console:**
   - Open DevTools (F12)
   - Copy all `[v0]` messages
   - Save for reference

3. **Verify setup:**
   - [ ] API key in Vars: `2b106T6wt500zga8mnEmtoDu`
   - [ ] Environment reloaded (30+ seconds)
   - [ ] Hard refresh page (Ctrl+Shift+R)
   - [ ] Using valid plant image
   - [ ] Image under 5MB
   - [ ] Internet connection stable

4. **Contact Support:**
   - Include error message
   - Include console logs (`[v0]` messages)
   - Describe steps taken
   - Provide system info (OS, browser)

---

**Last Updated:** 2026-03-14  
**API Provider:** plant.id (PlantNet)  
**Support:** https://www.plant.id/
