# Disease Detection Setup Guide

## Overview

The AI Plant Disease Detection feature uses the **plant.id API** - a free, powerful machine learning service for identifying plants and detecting diseases from images.

## Setup Instructions

### 1. Add Your API Key

The plant.id API key has been provided. You need to add it to your environment variables:

1. Go to your project settings (⚙️ gear icon in top right)
2. Click **Vars** section
3. Click **Add New**
4. Add a new environment variable:
   - **Name**: `PLANT_ID_API_KEY`
   - **Value**: `2b106T6wt500zga8mnEmtoDu`
5. Click **Save**
6. Wait 30 seconds for the environment to reload

### 2. How Disease Detection Works

The feature performs the following steps:

1. **Image Upload**: User uploads a clear photo of an infected leaf or plant
2. **AI Analysis**: The image is sent to plant.id's ML model for analysis
3. **Disease Identification**: The system identifies the plant and any diseases present
4. **Treatment Recommendations**: Detailed treatment options and action items are provided
5. **Database Storage**: Results are saved to your Supabase database for record-keeping

### 3. Using the Disease Detection Feature

#### For Best Results:

- **Lighting**: Take photos in natural daylight (avoid shadows)
- **Focus**: Ensure the affected leaf or area is in clear focus
- **Angle**: Photograph the affected area directly, not at extreme angles
- **Clarity**: Avoid blur or obstruction of the disease symptoms
- **Size**: File must be less than 5MB (PNG, JPG, GIF)

#### What You'll Get:

- **Disease Name**: Identified plant disease or plant species
- **Confidence Score**: How confident the AI is in the identification (0-100%)
- **Severity Level**: Mild, Moderate, Severe, or Critical
- **Symptoms**: List of observed visual symptoms
- **Treatment Plan**: Recommended treatment options
- **Action Items**: Priority-ordered steps to address the issue

### 4. API Limits

The plant.id API has usage limits on the free tier. If you encounter rate limit errors, you can:

1. Wait a few minutes before retrying
2. Upgrade to a paid plant.id plan if you need more requests
3. Check the plant.id documentation at https://api.plant.id/

### 5. Database Schema

Disease detection results are stored in the `disease_detections` table with:

- `user_id`: User who performed the analysis
- `crop_id`: Associated crop (if selected)
- `farm_id`: Associated farm (if selected)
- `image_url`: Base64 encoded image
- `detected_disease`: Name of the detected disease
- `confidence_score`: Confidence percentage
- `severity`: Disease severity level
- `symptoms`: Array of observed symptoms
- `recommended_treatment`: Treatment recommendations
- `treatment_urgency`: Urgency level (low, medium, high, critical)
- `raw_analysis`: Complete API response

### 6. Comprehensive Error Handling

The system includes robust error detection and graceful fallback mechanisms:

#### Error Types & Solutions:

**API_KEY_MISSING** - "API Key Not Configured"
- [ ] Open project settings (⚙️ icon)
- [ ] Go to Vars section
- [ ] Add: `PLANT_ID_API_KEY` = `2b106T6wt500zga8mnEmtoDu`
- [ ] Wait 30 seconds for reload
- [ ] Hard refresh page (Ctrl+Shift+R)

**INVALID_API_KEY** - "Invalid API Key"
- [ ] Verify the key is exactly: `2b106T6wt500zga8mnEmtoDu`
- [ ] Check for extra spaces or typos
- [ ] Ensure no special characters
- [ ] Update in Vars section

**IMAGE_FORMAT_ERROR** - "Invalid image format"
- [ ] Use JPG, PNG, or GIF format
- [ ] Image must be under 5MB
- [ ] Try a different image format
- [ ] Ensure image is not corrupted

**NOT_A_PLANT** - "Not a plant detected"
- [ ] Upload an image containing a plant
- [ ] Ensure plant/leaf is clearly visible
- [ ] Try better lighting (natural daylight)
- [ ] Focus on the affected area

**UNABLE_TO_IDENTIFY** - "Unable to identify plant"
- [ ] Take a clearer image with better focus
- [ ] Improve lighting conditions
- [ ] Use higher resolution image
- [ ] Try a different angle

**NETWORK_ERROR** - Network/connectivity issues
- [ ] Check your internet connection
- [ ] Try again in 1-2 minutes
- [ ] Check if plant.id API is operational
- [ ] Try from different network if possible

**RATE_LIMIT** - "Rate limit exceeded"
- [ ] Wait 5-10 minutes before retrying
- [ ] Check your API usage on plant.id dashboard
- [ ] Consider upgrading plan for higher limits

**TIMEOUT** - Request took too long
- [ ] Try with a smaller image file
- [ ] Check internet speed/stability
- [ ] Wait a moment and retry
- [ ] Try from different network

#### Automatic Fallback System:
If the API is unavailable, the system automatically uses local image analysis:
- ✅ Basic plant health assessment
- ✅ Color-based disease detection
- ✅ No API key required
- ✅ Graceful degradation

#### Browser Console Debugging:
Open DevTools (F12) → Console tab to see detailed logs:
- `[v0] API Key check - Key exists: true/false`
- `[v0] Sending image to plant.id API...`
- `[v0] API Status: 200 OK` (success) or error codes
- `[v0] Plant probability: 0.95` (confidence)
- Error messages prefixed with `[v0]` for easy tracking

### 7. Free Tier Benefits

The plant.id API free tier includes:

- Plant identification
- Disease detection
- Similar image results
- Plant details (taxonomy, descriptions)
- No credit card required

## Next Steps

1. Configure the `PLANT_ID_API_KEY` environment variable
2. Navigate to Dashboard → Disease Detection
3. Upload a plant or leaf image
4. Review the AI analysis and recommendations
5. Save results for future reference

For more information, visit: https://www.plant.id/
