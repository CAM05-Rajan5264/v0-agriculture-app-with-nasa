# Plant.id API Setup & Error Handling Guide

## Quick Setup

### 1. Add API Key to Environment Variables

The plant.id API key needs to be added to your Vercel project's environment variables:

**API Key:** `2b106T6wt500zga8mnEmtoDu`

#### Steps:
1. Go to your project settings (top right gear icon)
2. Click **Vars** section
3. Add a new variable with:
   - **Name:** `PLANT_ID_API_KEY` (or `PLANTID_API_KEY`)
   - **Value:** `2b106T6wt500zga8mnEmtoDu`
4. Click Save

The application accepts both naming conventions:
- `PLANT_ID_API_KEY` (preferred)
- `PLANTID_API_KEY` (legacy support)

---

## Features

### Plant Identification
- **Scientific Name:** Genus and species identification
- **Common Names:** Multiple common names for the plant
- **Plant Details:** Description and reference URLs

### Disease Detection
- **Real-time Analysis:** Powered by PlantNet API
- **Confidence Score:** Shows accuracy of identification (0-100%)
- **Disease Severity:** Mild, Moderate, Severe, or Critical
- **Treatment Recommendations:** Specific action items prioritized
- **Symptom Identification:** Lists observed symptoms

### Automatic Fallback
If the API is unavailable, the system automatically falls back to local image analysis:
- Uses pixel color analysis
- Identifies general plant health
- Provides basic recommendations
- No API key required for fallback

---

## Error Handling

### Error Scenarios & Solutions

#### 1. **"Analysis service temporarily unavailable"**
**Cause:** API key not configured
**Solution:**
- Add `PLANT_ID_API_KEY` to Vars section
- Ensure the key is correct: `2b106T6wt500zga8mnEmtoDu`
- Wait 30 seconds for environment to reload

#### 2. **"Invalid image format"**
**Cause:** Image not in correct format
**Solution:**
- Ensure you're uploading JPG, PNG, or GIF
- Image must be under 5MB
- Try uploading a different image format

#### 3. **"No image provided"**
**Cause:** Missing image data
**Solution:**
- Select an image first before clicking "Analyze Image"
- Try selecting the image again

#### 4. **"Not a plant detected"**
**Cause:** Image doesn't contain a plant
**Solution:**
- Upload an image containing a plant or crop
- Ensure the plant is clearly visible
- Improve lighting (natural daylight is best)

#### 5. **"Unable to identify plant"**
**Cause:** Plant not recognized by the API
**Solution:**
- Try uploading a clearer image
- Focus on the leaf or affected area
- Ensure adequate lighting
- Try a different angle

#### 6. **Network/Timeout Errors**
**Cause:** API server unreachable or slow
**Solution:**
- Check your internet connection
- Wait a moment and try again
- The system will use fallback analysis if API is unavailable

---

## Image Upload Best Practices

### For Best Results:
✅ **DO:**
- Take photos in natural daylight
- Focus on affected areas (diseased leaves)
- Fill the frame with the plant part
- Ensure images are sharp and in focus
- Use high-quality camera or smartphone

❌ **DON'T:**
- Use blurry or out-of-focus images
- Shoot in poor lighting or shadows
- Include too much background
- Use images smaller than 100x100 pixels
- Upload non-plant images

### Recommended Image Specifications:
- **Format:** JPG, PNG, or GIF
- **Size:** Less than 5MB
- **Resolution:** 640x480 or higher
- **Subject:** Clear view of affected leaf/plant part

---

## API Response Structure

### Successful Analysis Response:

```json
{
  "success": true,
  "analysis": {
    "disease": "Early Blight",
    "confidence": 0.85,
    "severity": "moderate",
    "plantName": "Solanum lycopersicum",
    "plantCommonNames": ["Tomato", "Garden Tomato"],
    "plantDetails": {
      "genus": "Solanum",
      "species": "lycopersicum",
      "description": "...",
      "url": "..."
    },
    "symptoms": [...],
    "treatment": "...",
    "recommendations": [...],
    "urgency": "high",
    "isDisease": true
  },
  "savedRecord": { ... }
}
```

### Fields Explained:
- **disease:** Identified disease/condition name
- **confidence:** Accuracy score (0-1, multiply by 100 for percentage)
- **severity:** mild | moderate | severe | critical
- **plantName:** Scientific name of the plant
- **plantCommonNames:** Array of common names
- **plantDetails:** Additional plant information
- **symptoms:** List of observed symptoms
- **treatment:** Recommended treatment approach
- **recommendations:** Prioritized action items
- **urgency:** low | medium | high | critical
- **isDisease:** Boolean indicating if disease detected

---

## Debugging

### Check API Key Status:
Monitor browser console for these messages:
```
[v0] API Key check - Key exists: true
[v0] Sending image to plant.id API for analysis...
[v0] Plant ID API response received
```

### If API Fails:
```
[v0] Plant ID API error: [status] [error message]
[v0] Falling back to local analysis due to API error
```

### Database Save Issues:
```
[v0] Database error: [error details]
[v0] Analysis complete but database save failed
```

---

## API Rate Limits

The plant.id API has the following rate limits:
- **Free Tier:** 100 requests per month
- **Limited to:** 1 request per second
- **Image Size:** Max 10MB per image

For higher limits, consider upgrading your plant.id plan.

---

## Troubleshooting Checklist

- [ ] API Key added to Vars section
- [ ] Environment reloaded (wait 30 seconds)
- [ ] Using correct API key format
- [ ] Image is valid (JPG/PNG/GIF under 5MB)
- [ ] Image contains a plant
- [ ] Good lighting conditions
- [ ] Plant is clearly visible in image
- [ ] Browser console shows no errors
- [ ] Internet connection is stable

---

## Support Resources

- **Plant.id API Docs:** https://my.plant.id/
- **PlantNet Project:** https://www.plantnet.org/
- **Disease Database:** Built-in comprehensive disease database
- **Fallback Analysis:** Always available when API is down

---

## Next Steps

1. ✅ Add `PLANT_ID_API_KEY` to Vars section
2. ✅ Navigate to Disease Detection page
3. ✅ Upload a plant image
4. ✅ Click "Analyze Image"
5. ✅ View results with plant ID and disease info

The system is now ready to detect plant diseases with real-time API-powered plant identification!
