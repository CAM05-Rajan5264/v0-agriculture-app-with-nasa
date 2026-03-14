# Plant Disease Detection - System Architecture

## 📊 High-Level Data Flow

```
┌─────────────────┐
│   User Input    │
│  Plant Image    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Disease Detection Page     │
│ /app/dashboard/disease-     │
│ detection/page.tsx          │
│                             │
│ • Image upload              │
│ • Validation (format/size)  │
│ • Preview display           │
│ • Error handling UI         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Validate Image             │
│                             │
│ ✓ Format: JPG/PNG/GIF       │
│ ✓ Size: < 5MB               │
│ ✓ Base64 encoded            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  API Route                  │
│ /app/api/analyze-disease/   │
│ route.ts                    │
│                             │
│ • Check API key             │
│ • Error detection           │
│ • Database integration      │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
   ✓ Key    ✗ No Key
   │         │
   │         ▼
   │    ┌─────────────────────┐
   │    │ Fallback Analysis   │
   │    │ (Local Processing)  │
   │    │                     │
   │    │ • Color analysis    │
   │    │ • Pattern detection │
   │    │ • Generic results   │
   │    └─────────┬───────────┘
   │              │
   │    ┌─────────┴──────────┐
   │    │                    │
   │    ▼                    ▼
   │  Results          Database
   │    │
   └────┼────────────────────┐
        │                    │
        ▼                    ▼
   ┌──────────────────────────────┐
   │ Send to plant.id API         │
   │ https://api.plant.id/v2/     │
   │ identify                     │
   │                              │
   │ POST with:                   │
   │ • images (base64)            │
   │ • modifiers                  │
   │ • plant_details              │
   └─────────┬──────────────────┘
        ┌────┴────┐
        │          │
        ▼          ▼
      ✓ OK       ✗ Error
       │          │
       │    ┌─────┴────────────────────┐
       │    │  Error Type Check        │
       │    │                          │
       │    ├─ 401 → Invalid key       │
       │    ├─ 429 → Rate limited      │
       │    ├─ 413 → Image too large   │
       │    ├─ 5xx → Server error      │
       │    └─ timeout → Timeout       │
       │         │                     │
       │         ▼                     │
       │    Use Fallback              │
       │         │                     │
       └─────────┴───────────────┬─────┘
                 │               │
                 ▼               ▼
          ┌──────────────────────────────┐
          │  Analyze Response            │
          │ /lib/plant-disease-api.ts    │
          │                              │
          │ • Extract plant data         │
          │ • Identify disease           │
          │ • Map to treatment           │
          │ • Calculate severity         │
          │ • Generate recommendations   │
          └─────────┬────────────────────┘
                    │
                    ▼
          ┌──────────────────────────┐
          │  Analysis Result Object  │
          │                          │
          │ • disease: string        │
          │ • confidence: number     │
          │ • severity: level        │
          │ • plantName: string      │
          │ • symptoms: string[]     │
          │ • treatment: string      │
          │ • recommendations: []    │
          │ • isDisease: boolean     │
          └─────────┬────────────────┘
                    │
          ┌─────────┴──────────┐
          │                    │
          ▼                    ▼
    ┌──────────────┐    ┌──────────────┐
    │   Database   │    │    User UI   │
    │   Storage    │    │   Display    │
    │ (Supabase)   │    │   Results    │
    │              │    │              │
    │ Disease      │    │ • Plant ID   │
    │ Detection    │    │ • Disease    │
    │ Records      │    │ • Treatment  │
    │              │    │ • Actions    │
    └──────────────┘    └──────────────┘
```

---

## 🔌 Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        V0 Frontend                              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Disease Detection Page Component                │ │
│  │      /app/dashboard/disease-detection/page.tsx          │ │
│  │                                                          │ │
│  │ State Management:                                       │ │
│  │  • selectedImage: File | null                          │ │
│  │  • preview: string (base64)                            │ │
│  │  • analysis: DiseaseAnalysisResult | null              │ │
│  │  • loading: boolean                                    │ │
│  │  • error: string | null                                │ │
│  │                                                          │ │
│  │ Event Handlers:                                        │ │
│  │  • handleImageSelect() → Validate & Preview            │ │
│  │  • handleAnalyze() → Send to API                        │ │
│  │  • getSeverityColor() → Style results                  │ │
│  │                                                          │ │
│  │ UI Components:                                         │ │
│  │  • Upload area with drag & drop                        │ │
│  │  • Image preview                                       │ │
│  │  • Error messages                                      │ │
│  │  • Results display                                     │ │
│  │  • Loading spinner                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │ API Call                         │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Next.js Route Handler                           │ │
│  │      /app/api/analyze-disease/route.ts                  │ │
│  │                                                          │ │
│  │ POST Method Flow:                                      │ │
│  │  1. Get authenticated user (Supabase)                  │ │
│  │  2. Extract base64Image from request                   │ │
│  │  3. Validate image format                              │ │
│  │  4. Check for API key                                  │ │
│  │  5. Send to plant.id API or fallback                   │ │
│  │  6. Parse response or handle errors                    │ │
│  │  7. Save to Supabase database                          │ │
│  │  8. Return analysis to frontend                        │ │
│  │                                                          │ │
│  │ Error Handling:                                        │ │
│  │  • API_KEY_MISSING → Fallback                          │ │
│  │  • INVALID_API_KEY → Fallback                          │ │
│  │  • NETWORK_ERROR → Fallback                            │ │
│  │  • TIMEOUT → Fallback                                  │ │
│  │  • RATE_LIMIT → Fallback                               │ │
│  │  • etc. (9 error types)                                │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│   External API Layer    │  │  Database Layer              │
│                          │  │                              │
│  plant.id API           │  │  Supabase PostgreSQL         │
│  https://api.plant.id   │  │                              │
│  /v2/identify           │  │  Tables:                     │
│                          │  │  • users (auth)             │
│  Request:              │  │  • disease_detections       │
│  • images[]             │  │  • crops                     │
│  • modifiers            │  │  • farms                     │
│  • plant_details        │  │  • etc.                      │
│                          │  │                              │
│  Response:             │  │  Functions:                  │
│  • suggestions[]        │  │  • insert()                  │
│  • is_plant{}           │  │  • select()                  │
│  • details{}            │  │  • Row-level security        │
│                          │  │                              │
└──────────────────────────┘  └──────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Utility/Helper Layer           │
│                                  │
│  /lib/plant-disease-api.ts       │
│  • analyzePlantIdResponse()      │
│  • mapDiseaseToTreatment()       │
│  • analyzeImageLocally()         │
│                                  │
│  DISEASE_TREATMENTS Database:    │
│  • early_blight {}               │
│  • powdery_mildew {}             │
│  • rust {}                       │
│  • leaf_spot {}                  │
│  • (30+ total diseases)          │
│                                  │
└──────────────────────────────────┘
```

---

## 🔄 Error Handling Flow

```
Image Upload
    │
    ▼
Format Valid?
    ├─ NO → "Invalid image format" error
    └─ YES ↓
    
Size < 5MB?
    ├─ NO → "Image too large" error
    └─ YES ↓
    
API Key exists?
    ├─ NO → Fallback Analysis (API_KEY_MISSING)
    └─ YES ↓
    
Send to plant.id API
    │
    ├─ 401 Unauthorized → Invalid key error → Fallback
    ├─ 429 Too Many Requests → Rate limit error → Fallback
    ├─ 413 Payload Too Large → Image too large error → Fallback
    ├─ 5xx Server Error → Server error → Fallback
    ├─ Timeout → Timeout error → Fallback
    ├─ Network Error → Network error → Fallback
    ├─ Parse Error → Format error → Fallback
    └─ 200 OK ↓
    
Analyze Response
    │
    ├─ Not a plant? (probability < 0.5)
    │   └─ Return "Not a plant" result
    │
    ├─ No suggestions? (empty array)
    │   └─ Return "Unable to identify" result
    │
    └─ Success ↓
    
Extract Plant Data
    ├─ Scientific name (genus/species)
    ├─ Common names
    └─ Plant details ↓
    
Match Disease
    ├─ Disease in database?
    │   ├─ YES → Add treatment info
    │   └─ NO → Generic result ↓
    │
    └─ Save to Database ↓
    
Return Results to User
    │
    ├─ Display plant identification
    ├─ Display disease status
    ├─ Show confidence score
    ├─ List symptoms
    ├─ Show treatment plan
    └─ List action items
```

---

## 🗄️ Database Schema

```
disease_detections table
├─ id (UUID, Primary Key)
├─ created_at (timestamp)
├─ updated_at (timestamp)
├─ user_id (UUID, Foreign Key → users.id)
├─ farm_id (UUID, Foreign Key → farms.id, nullable)
├─ crop_id (UUID, Foreign Key → crops.id, nullable)
├─ image_url (text, base64 image)
├─ detected_disease (text)
│  └─ Example: "Early Blight", "Plant appears healthy"
├─ confidence_score (numeric)
│  └─ Range: 0.0 - 1.0
├─ severity (text)
│  └─ Enum: "mild", "moderate", "severe", "critical"
├─ symptoms (json array)
│  └─ Example: ["Brown spots", "Yellowing leaves"]
├─ recommended_treatment (text)
│  └─ Long-form treatment recommendation
├─ treatment_urgency (text)
│  └─ Enum: "low", "medium", "high", "critical"
└─ raw_analysis (jsonb)
   └─ Complete API response stored for reference

Indexes:
├─ user_id (for quick user lookups)
├─ farm_id (for farm-based queries)
├─ crop_id (for crop-based queries)
├─ created_at (for time-based sorting)
└─ detected_disease (for disease frequency analysis)
```

---

## 🔐 Environment Variables

```
Production Configuration:
├─ PLANT_ID_API_KEY
│  └─ Value: 2b106T6wt500zga8mnEmtoDu
│  └─ Location: Vercel Vars section
│  └─ Scope: Server-side only
│  └─ Used in: /app/api/analyze-disease/route.ts
│
├─ NEXT_PUBLIC_SUPABASE_URL
│  └─ Supabase project URL
│  └─ Scope: Client & Server
│
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│  └─ Supabase anonymous key
│  └─ Scope: Client & Server
│
└─ (Supabase auth tokens managed automatically)
```

---

## 📊 Request/Response Cycle

```
1. FRONTEND REQUEST
   POST /api/analyze-disease
   Content-Type: application/json
   {
     "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
     "cropId": null,
     "farmId": null
   }

2. BACKEND VALIDATION
   ✓ Check authentication
   ✓ Validate image format
   ✓ Extract image data
   ✓ Check API key

3. EXTERNAL API CALL
   POST https://api.plant.id/v2/identify
   Headers:
   - Content-Type: application/json
   - Api-Key: 2b106T6wt500zga8mnEmtoDu
   
   Body:
   {
     "images": ["data:image/jpeg;base64,..."],
     "modifiers": ["similar_images"],
     "plant_details": ["description", "url", "common_names", "taxonomy"]
   }

4. EXTERNAL API RESPONSE
   HTTP 200 OK
   {
     "suggestions": [
       {
         "id": "...",
         "name": "Solanum lycopersicum",
         "probability": 0.95,
         "details": {
           "description": "...",
           "url": "...",
           "common_names": ["Tomato", "Garden Tomato"],
           "taxonomy": {
             "genus": "Solanum",
             "species": "lycopersicum"
           }
         }
       }
     ],
     "is_plant": {
       "probability": 0.99
     }
   }

5. BACKEND PROCESSING
   ✓ Parse API response
   ✓ Extract plant info
   ✓ Identify disease
   ✓ Map to treatment DB
   ✓ Calculate severity
   ✓ Generate recommendations

6. DATABASE STORAGE
   INSERT INTO disease_detections
   {
     user_id, farm_id, crop_id, image_url,
     detected_disease, confidence_score, severity,
     symptoms, recommended_treatment, treatment_urgency,
     raw_analysis
   }

7. BACKEND RESPONSE
   HTTP 200 OK
   {
     "success": true,
     "analysis": {
       "disease": "Early Blight",
       "confidence": 0.85,
       "severity": "moderate",
       "plantName": "Solanum lycopersicum",
       "plantCommonNames": ["Tomato"],
       "plantDetails": {...},
       "symptoms": [...],
       "treatment": "...",
       "recommendations": [...],
       "urgency": "high",
       "isDisease": true
     },
     "savedRecord": {...}
   }

8. FRONTEND DISPLAY
   ✓ Parse response
   ✓ Update state
   ✓ Render results
   ✓ Show plant ID
   ✓ Show disease info
   ✓ Display treatment plan
   ✓ Show action items
```

---

## 🎯 Key Integration Points

```
1. User Authentication
   └─ Supabase Auth
      └─ GET /auth/user
      └─ Verify user before processing

2. Image Processing
   └─ Base64 Encoding
      └─ Client: FileReader.readAsDataURL()
      └─ Server: Extract & validate

3. External API
   └─ plant.id API
      └─ POST /v2/identify
      └─ Requires API_KEY header
      └─ 100 requests/month limit

4. Database
   └─ Supabase PostgreSQL
      └─ INSERT disease_detections
      └─ SELECT for history
      └─ Row-level security on user_id

5. Error Handling
   └─ Browser Console
      └─ [v0] prefix for debugging
      └─ Stack traces on error
      └─ Network request logging

6. Fallback System
   └─ Local Image Analysis
      └─ Pixel color detection
      └─ Pattern matching
      └─ Generic results
```

---

## 🚀 Deployment Checklist

```
✅ Environment Variables
   └─ PLANT_ID_API_KEY set in Vercel Vars
   └─ Supabase credentials configured
   └─ Database schema deployed

✅ Frontend Components
   └─ Disease detection page renders
   └─ Image upload works
   └─ Results display correctly
   └─ Error messages show

✅ Backend Routes
   └─ /api/analyze-disease endpoint active
   └─ Error handling functional
   └─ Database storage working
   └─ Fallback system active

✅ External Services
   └─ plant.id API accessible
   └─ Supabase database online
   └─ Network connectivity confirmed

✅ Security
   └─ API key not exposed in client code
   └─ User authentication required
   └─ HTTPS enforced
   └─ RLS policies active

✅ Documentation
   └─ Setup guides complete
   └─ Error handling documented
   └─ Troubleshooting available
   └─ API key instructions clear
```

---

## 📈 Performance Metrics

```
Expected Response Times:
├─ Image validation: <100ms
├─ API request: 5-15 seconds
├─ Database insert: <500ms
├─ Total response: 5.5-15.5 seconds
└─ UI render: <100ms

Resource Usage:
├─ API calls per user per month: 100 (free tier)
├─ Database storage per record: ~5-10KB
├─ Network bandwidth per request: 2-5MB
└─ Concurrent users: Unlimited (limited by API tier)

Optimization:
├─ Image compression before send
├─ Lazy loading results
├─ Database indexing on frequently queried fields
├─ Caching of disease treatment database
└─ Fallback analysis if API slow
```

---

This architecture provides:
- ✅ Robust error handling
- ✅ Automatic fallback system
- ✅ Comprehensive logging
- ✅ Secure API integration
- ✅ Data persistence
- ✅ User tracking
- ✅ Scalable design
