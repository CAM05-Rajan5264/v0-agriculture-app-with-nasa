# Disease Detection Setup Guide

## Overview

The AI Plant Disease Detection feature uses the **plant.id API** - a free, powerful machine learning service for identifying plants and detecting diseases from images.

## Setup Instructions

### 1. Add Your API Key

The plant.id API key has been provided. You need to add it to your environment variables:

1. Go to your project settings (in the Vars section of v0)
2. Add a new environment variable:
   - **Key**: `PLANT_ID_API_KEY`
   - **Value**: `LUb1izCbjL5YpagT7coo0xddOqkphSJbIPpv89og4DG4K8oBVB`

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

### 6. Troubleshooting

**"API key not configured" error**:
- Ensure you've added `PLANT_ID_API_KEY` to your environment variables
- Verify the key is correct
- Redeploy or restart your application

**"Image analysis failed" error**:
- Check your internet connection
- Try uploading a different image
- Ensure the image quality is good
- Verify the file size is under 5MB

**"Plant not identified" message**:
- The image may not be clear enough
- Try retaking the photo in better lighting
- Ensure the plant is clearly visible in the frame

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
