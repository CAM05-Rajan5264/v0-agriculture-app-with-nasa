# PlantNet API Integration Guide

## Overview

The Disease Detection feature now includes real-time plant identification using the **PlantNet API** (via plant.id service). Users can upload plant photos to instantly receive:
- Plant species identification with scientific names
- Common plant names
- Taxonomic information (genus, species)
- Disease detection and diagnosis
- Treatment recommendations

## How It Works

### PlantNet API via Plant.ID
The integration uses the **plant.id API**, which provides access to the PlantNet database - one of the world's largest crowdsourced plant identification databases with millions of species.

**API Endpoint:** `https://api.plant.id/v2/identify`

### Process Flow
1. **Image Upload**: User takes or uploads a clear plant photo
2. **API Request**: Image is sent to plant.id API in base64 format
3. **Plant Identification**: PlantNet API identifies the plant species
4. **Disease Detection**: System analyzes the identified plant for diseases
5. **Results Display**: Shows plant ID, diseases (if any), and treatment recommendations
6. **Database Save**: Analysis results are saved to Supabase for future reference

## Setup Instructions

### Step 1: Get API Key from Plant.ID

1. Visit [plant.id API Registration](https://web.plant.id/account/register)
2. Create a free account
3. Go to Account → Your API Key
4. Copy your API key

**Free Tier Benefits:**
- 100 API calls/month
- Suitable for testing and development
- Includes plant identification and disease detection

**Paid Tier:**
- Unlimited API calls
- Production use
- Advanced features

### Step 2: Add Environment Variable

Add the API key to your Vercel project:

1. Open **Settings** (top right menu)
2. Click **Vars**
3. Add new variable:
   - **Name:** `PLANTID_API_KEY`
   - **Value:** Your plant.id API key
4. Save

Alternatively, set the variable with this name:
- `PLANT_ID_API_KEY` (also supported)

### Step 3: Test the Integration

1. Navigate to **Dashboard → AI Plant Disease Detection**
2. Click to upload a plant image
3. Select a clear photo of a plant leaf or crop
4. Click **Analyze Image**
5. View the plant identification and disease analysis results

## Features

### Plant Identification
- **Scientific Name**: Exact botanical classification
- **Common Names**: Local and English names for the plant
- **Taxonomy**: Genus and species information
- **Plant Details**: Description and additional information

### Disease Detection
- **Disease Name**: Identification of detected diseases
- **Confidence Score**: Confidence level of the analysis (0-100%)
- **Severity Level**: mild, moderate, severe, or critical
- **Symptoms**: Observable signs of disease
- **Treatment**: Recommended treatment options
- **Priority Actions**: Step-by-step action items to address the issue

### Results Storage
All analyses are automatically saved to the database with:
- Image data
- Plant identification
- Disease diagnosis
- Confidence scores
- Treatment recommendations
- Timestamp and user information

## API Response Structure

```json
{
  "is_plant": {
    "probability": 0.99
  },
  "suggestions": [
    {
      "id": "...",
      "name": "Tomato",
      "probability": 0.95,
      "similar_images": ["..."],
      "details": {
        "description": "...",
        "url": "...",
        "common_names": ["Tomato", "Love Apple"],
        "taxonomy": {
          "genus": "Solanum",
          "species": "Solanum lycopersicum"
        }
      }
    }
  ]
}
```

## Best Practices for Image Upload

For best results:
1. **Clear Focus**: Ensure the affected or diagnostic area is in focus
2. **Natural Lighting**: Use daylight, avoid harsh shadows
3. **Affected Area**: Focus on diseased leaves or stems when available
4. **Clean Background**: Avoid clutter in the background
5. **Image Quality**: Use high-quality camera or phone camera
6. **File Size**: Keep under 5MB

## Disease Database

The system includes treatment information for:
- **Fungal Diseases**: Early blight, powdery mildew, rust, leaf spot, septoria
- **Bacterial Diseases**: Bacterial wilt
- **Viral Diseases**: Mosaic virus
- **Nutritional Deficiencies**: Nitrogen, iron, potassium deficiencies

Each disease includes:
- Severity classification
- Observable symptoms
- Recommended treatments
- Urgent action items

## Troubleshooting

### "API Key not configured" Error
- Check that `PLANTID_API_KEY` is set in Vars
- Verify the key is correct from plant.id account
- Redeploy after adding the environment variable

### "Image not recognized as plant"
- Ensure the image contains a plant
- Try a clearer, higher-quality image
- Ensure good lighting conditions

### "Analysis failed" Error
- Check internet connection
- Verify plant.id API is operational
- Try uploading again in a few moments

### "Image is blurry or unclear"
- Retake the photo with better focus
- Ensure adequate lighting
- Get closer to the affected area

## API Limits

**Free Tier:**
- 100 API calls per month
- Reset on the first day of each month

**Paid Tier:**
- Unlimited API calls
- Immediate access to additional features

## Data Privacy

- Images are processed by plant.id servers
- User images are stored in your Supabase database
- No data is shared without user consent
- See privacy policy for details

## Extending the Integration

### Add Custom Disease Mappings
Edit `/lib/plant-disease-api.ts` to add more disease treatments:

```typescript
"custom_disease": {
  disease: "Custom Disease Name",
  severity: "moderate",
  symptoms: ["symptom 1", "symptom 2"],
  treatment: "Treatment recommendation",
  recommendations: ["action 1", "action 2"]
}
```

### Add New Disease Details
Update the `DISEASE_TREATMENTS` object to include new diseases with:
- Disease name
- Severity level
- Observable symptoms
- Treatment methods
- Recommended actions

## Resources

- [Plant.ID Official Website](https://plant.id)
- [PlantNet Database](https://www.plantnet.org)
- [Plant Disease Information](https://www.apsnet.org)
- [Crop Disease Management](https://www.extension.org/plant-diseases)

## Support

For issues with:
- **Plant.ID API**: Visit [plant.id support](https://web.plant.id/help)
- **Integration Help**: Check the DISEASE_DETECTION_SETUP.md file
- **Technical Issues**: Review application logs
