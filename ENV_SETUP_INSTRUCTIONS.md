# Environment Variable Setup Instructions

## Quick Start - Disease Detection API Key

To enable AI plant disease detection, follow these steps:

### Step 1: Open the Vars Section
In the v0 chat sidebar, click on the **Vars** tab on the left side.

### Step 2: Add the Environment Variable
Click "Add variable" and enter:

**Variable Name (Key):**
```
PLANT_ID_API_KEY
```

**Variable Value:**
```
LUb1izCbjL5YpagT7coo0xddOqkphSJbIPpv89og4DG4K8oBVB
```

### Step 3: Save and Deploy
- Click Save
- The variable is now available to your application
- Navigate to Dashboard → Disease Detection to test it out

## How It Works

Once configured:
1. Upload a plant image on the Disease Detection page
2. The API key is used securely on the server to authenticate with plant.id
3. Your image is analyzed by plant.id's AI model
4. Results are returned showing disease detection and treatment recommendations

## Verification

To verify the setup is working:
1. Go to Dashboard → Disease Detection
2. Upload a test image
3. If you see analysis results, the API key is configured correctly
4. If you get an error about "API key not configured", the environment variable wasn't added properly

## What This API Key Does

- **Enables**: Plant disease detection and identification
- **Service**: plant.id API (free tier)
- **Features**: Disease analysis, confidence scores, treatment recommendations
- **Limit**: Free tier has usage limits; upgrade if needed for more requests

For more details, see **DISEASE_DETECTION_SETUP.md**
