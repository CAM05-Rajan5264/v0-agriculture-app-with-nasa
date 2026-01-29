# Kindwise crop.health API Integration

## Overview
The disease detection system is now integrated with **Kindwise crop.health API**, an advanced AI-powered disease and pest identification system specifically designed for crops.

## Features

### Disease Detection Coverage
- **23 Major Crops**: Apple, Banana, Barley, Cassava, Citrus, Cocoa, Coffee, Corn, Cotton, Cucumber, Eggplant, Garlic, Grapevine, Oil palm, Onion, Potato, Rice, Soybean, Sugarcane, Tea, Tobacco, Tomato, Wheat
- **288+ Diseases & Pests**: Comprehensive database covering fungal, bacterial, viral diseases, pests, and nutrient deficiencies
- **High Accuracy**: Top-3 accuracy of 93% and top-1 accuracy of 85% on validation datasets

### Analysis Details
Each disease identification includes:
- **Common & Scientific Names**: Complete taxonomic information
- **Severity Levels**: Mild, Moderate, Severe, Critical
- **Symptoms**: Detailed symptom descriptions
- **Treatment Options**: Specific treatment recommendations
- **Spreading Info**: Information about disease transmission
- **EPPO Codes**: International plant protection organization codes
- **Wiki URLs**: References and additional information

## Setup

### Step 1: Add API Key to Environment Variables
1. Go to the **Vars** section in v0 sidebar
2. Add the following environment variable:
   ```
   KINDWISE_API_KEY = LUb1izCbjL5YpagT7coo0xddOqkphSJbIPpv89og4DG4K8oBVB
   ```
   (Or use `CROP_HEALTH_API_KEY` as an alternative variable name)

### Step 2: Use the Disease Detection Feature
1. Navigate to **Dashboard → Disease Detection**
2. Select your crop type (optional but recommended for accuracy)
3. Upload a clear image of the affected leaf/plant
4. Click "Analyze Image"
5. Review the AI-generated analysis including:
   - Disease/pest identification
   - Confidence score
   - Severity assessment
   - Detailed symptoms
   - Treatment recommendations
   - Action items

## Integration Details

### API Endpoint
```
POST https://crop.kindwise.com/api/v1/identification
```

### Request Format
```json
{
  "images": ["base64_image_data"],
  "crop_type": "Tomato",  // Optional - improves accuracy
  "details": [
    "treatment",
    "description", 
    "severity",
    "symptoms",
    "taxonomy",
    "url"
  ]
}
```

### Response Mapping
The Kindwise API response is automatically mapped to the application's disease analysis format:
- `name` → Disease name
- `probability` → Confidence score
- `details.severity` → Disease severity
- `details.symptoms` → Symptom list
- `details.treatment` → Treatment recommendations
- `details.description` → Disease description

## Fallback Behavior

If Kindwise API is unavailable or an error occurs, the system falls back to **local pixel-based analysis** that uses color pattern recognition to identify common disease indicators.

## Supported Crops (23 Total)

1. Apple (Malus domestica)
2. Banana (Musa spp.)
3. Barley (Hordeum vulgare)
4. Cassava (Manihot esculenta)
5. Citrus (Citrus spp.)
6. Cocoa (Theobroma cacao)
7. Coffee (Coffea spp.)
8. Corn (Zea mays)
9. Cotton (Gossypium spp.)
10. Cucumber (Cucumis sativus)
11. Eggplant (Solanum melongena)
12. Garlic (Allium sativum)
13. Grapevine (Vitis spp.)
14. Oil palm (Elaeis guineensis)
15. Onion (Allium cepa)
16. Potato (Solanum tuberosum)
17. Rice (Oryza spp.)
18. Soybean (Glycine max)
19. Sugarcane (Saccharum officinarum)
20. Tea (Camellia sinensis)
21. Tobacco (Nicotiana tabacum)
22. Tomato (Solanum lycopersicum)
23. Wheat (Triticum spp.)

## Disease Categories Identified

- **Fungal Diseases**: Powdery mildew, early blight, late blight, grey mold, rust
- **Bacterial Diseases**: Bacterial spot, fire blight, Pierce's disease
- **Viral Diseases**: Mosaic viruses, bunch top virus, leaf curl virus
- **Pests**: Aphids, Colorado potato beetle, grasshoppers, whiteflies
- **Nutrient Deficiencies**: Nitrogen, phosphorus, potassium deficiencies
- **Other Issues**: General health assessment and damage analysis

## Data Storage

Analysis results are saved to the database including:
- Predicted disease/issue
- Confidence score
- Severity level
- Symptoms identified
- Treatment recommendations
- Input parameters and timestamp

This allows farmers to:
- Track disease history over time
- Monitor crop health trends
- Reference past diagnoses
- Build historical records for future reference

## Best Practices

1. **Image Quality**: Take clear, well-lit photos in natural daylight
2. **Focus Area**: Capture the affected leaf or plant part clearly
3. **Crop Selection**: Always select your crop type for best accuracy
4. **Multiple Images**: If unsure, upload multiple angles for confirmation
5. **Early Detection**: Use regularly for early disease detection
6. **Professional Review**: For critical decisions, consult local agricultural experts

## Accuracy Notes

- **High Accuracy**: 85-93% accuracy on real-world datasets
- **Variability**: Accuracy depends on image quality and crop type
- **Best Results**: Works best with clear images of mature symptoms
- **Early Stage**: May have lower confidence for very early-stage infections

## Support & Troubleshooting

If disease detection is not working:
1. Verify the API key is correctly set in environment variables
2. Check image format (JPG, PNG, GIF, up to 5MB)
3. Ensure image shows clear symptoms
4. Try uploading a different angle or image
5. Check internet connection
6. System will automatically fall back to local analysis if API unavailable
