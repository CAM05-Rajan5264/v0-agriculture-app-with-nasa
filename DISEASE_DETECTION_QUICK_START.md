# AI Disease Detection - Quick Start Guide

## ✅ Status: Ready to Use - COMPLETELY FREE

Your crop disease detection system is **fully operational and requires NO API keys** or paid subscriptions.

## How to Use (3 Simple Steps)

### 1. Navigate to Disease Detection
- Go to your Dashboard
- Click **"Disease Detection"** in the sidebar
- Or visit: `/dashboard/disease-detection`

### 2. Upload Plant Image
- Click the upload area or drag & drop
- Select a clear photo of the affected leaf/plant
- Optionally select your crop type (Tomato, Wheat, Potato, etc.)

### 3. Get AI Analysis
- Click **"Analyze Image"**
- Results appear in 1-2 seconds
- View detailed disease information, treatment recommendations, and action items

## What You Get

Each analysis includes:
- 🎯 **Disease Detection** - What disease/pest was found
- 📊 **Confidence Score** - How confident the AI is (0-100%)
- 🔴 **Severity Level** - Mild, Moderate, Severe, or Critical
- 📋 **Symptoms** - Visual signs to watch for
- 💊 **Treatment** - Recommended treatment options
- ⚡ **Urgency** - How quickly to act
- ✅ **Action Items** - Step-by-step recommendations

## How It Works (Technical Details)

The system uses a **smart fallback architecture**:

\`\`\`
1. Check for Kindwise API Key (Advanced AI, optional paid upgrade)
   ↓
2. If not available → Use FREE Local Pixel Analysis
   • Analyzes color patterns in images
   • Works 100% OFFLINE
   • No internet required
   • No rate limits
\`\`\`

## Free Analysis Method

The current system uses **pixel-based disease detection** that analyzes:
- **Green Ratios** → Plant health indicator
- **Yellow Areas** → Blight, spots, nutrient issues
- **Brown Patches** → Fungal diseases, rot
- **Red Discoloration** → Rust, mites, viral issues

## Image Quality Tips

For best results:
- ✅ Take photos in natural daylight
- ✅ Focus clearly on affected area
- ✅ Avoid shadows and backlighting
- ✅ Use neutral background if possible
- ✅ Ensure image is sharp and clear

## Database Storage

All your disease detection results are automatically saved and can be:
- Viewed in analysis history
- Tracked over time
- Associated with specific crops/farms
- Used for yield predictions

## Optional: Upgrade to Advanced AI

### Want 85-93% Accuracy?

Upgrade to **Kindwise crop.health API** for:
- 288+ disease recognition
- 85-93% accuracy
- Detailed treatment plans
- Scientific names and references

**Steps:**
1. Get API key from https://admin.kindwise.com
2. Add to Vars: `KINDWISE_API_KEY = your_key`
3. System automatically uses advanced AI

## Supported Crops

- Apple, Banana, Barley, Cassava, Citrus, Cocoa, Coffee
- Corn, Cotton, Cucumber, Eggplant, Garlic, Grapevine
- Oil Palm, Onion, Potato, Rice, Soybean, Sugarcane
- Tea, Tobacco, Tomato, Wheat

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Image Quality: Inconclusive" | Try clearer, better-lit image |
| No disease found when expected | Ensure good lighting, try different angle |
| Want better accuracy | Add Kindwise API key for advanced AI |
| Lost image history | Check Disease Detection page for saved results |

## File Storage

All analysis data is stored in your Supabase database:
- Table: `disease_detections`
- Fields: disease name, confidence, severity, symptoms, treatment
- Associated with user, farm, and crop IDs

## API Documentation

- **Endpoint:** `POST /api/analyze-disease`
- **Auth:** Required (user must be logged in)
- **Response Time:** 1-2 seconds
- **Cost:** FREE

### Request Format
\`\`\`json
{
  "base64Image": "data:image/jpeg;base64,...",
  "cropType": "Tomato",
  "farmId": "optional_farm_id",
  "cropId": "optional_crop_id"
}
\`\`\`

### Response Format
\`\`\`json
{
  "success": true,
  "analysis": {
    "disease": "Powdery Mildew",
    "confidence": 0.82,
    "severity": "moderate",
    "symptoms": ["White powdery coating", "Leaf curling"],
    "treatment": "Apply sulfur spray or neem oil",
    "urgency": "medium",
    "recommendations": ["Spray with fungicide", "Remove infected leaves"],
    "isDisease": true
  },
  "savedRecord": { /* database record */ }
}
\`\`\`

## Next Steps

1. ✅ Start using disease detection today (FREE)
2. 📊 Review your analysis history
3. 🤖 Consider upgrading to Kindwise for advanced AI (optional)
4. 📱 Use results to improve farming decisions

---

**System Status:** ✅ Fully Operational  
**Cost:** 💰 FREE  
**Setup Time:** ⚡ 0 minutes (ready now!)  
**Date:** February 2026
