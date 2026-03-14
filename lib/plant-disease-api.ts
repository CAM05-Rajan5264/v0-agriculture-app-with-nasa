// Free plant disease detection APIs
// Using plant.id API (free tier) for real ML-based plant disease detection

interface PlantIdResponse {
  suggestions: {
    id: string
    name: string
    probability: number
    similar_images?: string[]
    details?: {
      description?: string
      url?: string
      common_names?: string[]
      taxonomy?: {
        genus?: string
        species?: string
      }
    }
  }[]
  is_plant: {
    probability: number
  }
}

interface DiseaseAnalysisResult {
  disease: string
  confidence: number
  severity: "mild" | "moderate" | "severe" | "critical"
  symptoms: string[]
  treatment: string
  urgency: "low" | "medium" | "high" | "critical"
  recommendations: string[]
  isDisease: boolean
  plantName?: string
  plantCommonNames?: string[]
  plantDetails?: {
    description?: string
    url?: string
    genus?: string
    species?: string
  }
  rawResponse?: PlantIdResponse
}

// Disease database mapping to treatment information
const DISEASE_TREATMENTS: Record<string, Partial<DiseaseAnalysisResult>> = {
  // Fungal diseases
  "early_blight": {
    disease: "Early Blight",
    severity: "moderate",
    urgency: "high",
    symptoms: [
      "Brown spots with concentric rings",
      "Yellowing leaves",
      "Spots start on lower leaves",
    ],
    treatment:
      "Apply fungicide (chlorothalonil or mancozeb), remove affected leaves, improve air circulation",
    recommendations: [
      "Prune lower leaves immediately",
      "Apply fungicide every 7-10 days",
      "Increase spacing between plants",
      "Avoid overhead watering",
    ],
  },
  "powdery_mildew": {
    disease: "Powdery Mildew",
    severity: "moderate",
    urgency: "medium",
    symptoms: ["White powdery coating on leaves", "Leaf curling", "Stunted growth"],
    treatment:
      "Apply sulfur spray or potassium bicarbonate, improve air circulation, reduce humidity",
    recommendations: [
      "Spray with fungicide immediately",
      "Remove heavily infected leaves",
      "Increase air circulation with fans",
      "Avoid excess humidity",
    ],
  },
  "leaf_spot": {
    disease: "Leaf Spot Disease",
    severity: "moderate",
    urgency: "medium",
    symptoms: [
      "Dark spots on leaves",
      "Yellow halo around spots",
      "Spots may merge",
    ],
    treatment:
      "Apply copper fungicide, remove infected leaves, avoid wetting foliage",
    recommendations: [
      "Remove all spotted leaves",
      "Apply copper-based fungicide",
      "Water at soil level only",
      "Space plants for better air flow",
    ],
  },
  "rust": {
    disease: "Rust Disease",
    severity: "moderate",
    urgency: "high",
    symptoms: [
      "Orange or rust-colored pustules",
      "Yellow upper leaf surface",
      "Brown/rust lower surface",
    ],
    treatment:
      "Apply sulfur or copper fungicide, remove infected leaves, improve air circulation",
    recommendations: [
      "Apply fungicide spray immediately",
      "Remove heavily infected leaves",
      "Prune lower branches",
      "Increase plant spacing",
    ],
  },
  "septoria_leaf_blotch": {
    disease: "Septoria Leaf Blotch",
    severity: "moderate",
    urgency: "high",
    symptoms: [
      "Circular gray spots with dark borders",
      "Small black dots in center",
      "Yellowing around lesions",
    ],
    treatment:
      "Apply fungicide containing chlorothalonil, mancozeb, or ziram; remove infected leaves",
    recommendations: [
      "Remove infected leaves immediately",
      "Apply fungicide every 7-10 days",
      "Improve air circulation",
      "Avoid wetting foliage",
    ],
  },

  // Bacterial diseases
  "bacterial_wilt": {
    disease: "Bacterial Wilt",
    severity: "severe",
    urgency: "critical",
    symptoms: ["Sudden wilting", "Brown discoloration in vascular tissue"],
    treatment:
      "No cure available; remove infected plant immediately to prevent spread",
    recommendations: [
      "Remove and destroy infected plants",
      "Disinfect tools and equipment",
      "Control insect vectors",
      "Plant resistant varieties",
    ],
  },

  // Viral diseases
  "mosaic_virus": {
    disease: "Mosaic Virus",
    severity: "moderate",
    urgency: "high",
    symptoms: [
      "Mottled appearance on leaves",
      "Leaf curling and distortion",
      "Stunted growth",
    ],
    treatment:
      "No cure; control aphids and other vectors, remove infected plants",
    recommendations: [
      "Remove and destroy infected plants",
      "Control aphid populations",
      "Use resistant varieties",
      "Sanitize tools between plants",
    ],
  },

  // Nutritional deficiencies
  "nitrogen_deficiency": {
    disease: "Nitrogen Deficiency",
    severity: "mild",
    urgency: "medium",
    symptoms: [
      "Overall yellowing of leaves",
      "Yellowing starts from lower leaves",
      "Stunted growth",
    ],
    treatment:
      "Apply nitrogen-rich fertilizer (urea, ammonium nitrate), improve soil quality",
    recommendations: [
      "Apply balanced fertilizer with high nitrogen",
      "Consider foliar spray of urea solution",
      "Add organic compost to soil",
      "Monitor growth improvement in 2-3 weeks",
    ],
  },
  "iron_deficiency": {
    disease: "Iron Deficiency (Chlorosis)",
    severity: "mild",
    urgency: "medium",
    symptoms: [
      "Yellowing between leaf veins",
      "Veins remain green",
      "New growth appears pale",
    ],
    treatment: "Apply iron supplement (chelated iron), adjust soil pH if needed",
    recommendations: [
      "Apply iron chelate solution",
      "Test and adjust soil pH",
      "Improve soil drainage",
      "Add micronutrient fertilizer",
    ],
  },
  "potassium_deficiency": {
    disease: "Potassium Deficiency",
    severity: "mild",
    urgency: "medium",
    symptoms: [
      "Scorching on leaf margins",
      "Yellowing between veins",
      "Weak stems",
    ],
    treatment:
      "Apply potassium-rich fertilizer (potassium chloride or potassium sulfate)",
    recommendations: [
      "Apply potassium fertilizer",
      "Add wood ash or kelp",
      "Improve soil drainage",
      "Monitor recovery in 2-3 weeks",
    ],
  },
};

// Map common disease names from plant.id API to our database
function mapDiseaseToTreatment(
  diseaseName: string
): Partial<DiseaseAnalysisResult> | null {
  const lowerName = diseaseName.toLowerCase();

  // Direct matches
  for (const [key, treatment] of Object.entries(DISEASE_TREATMENTS)) {
    if (lowerName.includes(key.replace(/_/g, " "))) {
      return treatment;
    }
  }

  // Fuzzy matching for common variations
  if (
    lowerName.includes("blight") &&
    lowerName.includes("early")
  ) {
    return DISEASE_TREATMENTS["early_blight"];
  }
  if (lowerName.includes("powdery")) {
    return DISEASE_TREATMENTS["powdery_mildew"];
  }
  if (lowerName.includes("rust")) {
    return DISEASE_TREATMENTS["rust"];
  }
  if (lowerName.includes("spot")) {
    return DISEASE_TREATMENTS["leaf_spot"];
  }
  if (lowerName.includes("septoria")) {
    return DISEASE_TREATMENTS["septoria_leaf_blotch"];
  }
  if (lowerName.includes("wilt")) {
    return DISEASE_TREATMENTS["bacterial_wilt"];
  }
  if (lowerName.includes("mosaic")) {
    return DISEASE_TREATMENTS["mosaic_virus"];
  }
  if (lowerName.includes("nitrogen")) {
    return DISEASE_TREATMENTS["nitrogen_deficiency"];
  }
  if (lowerName.includes("iron")) {
    return DISEASE_TREATMENTS["iron_deficiency"];
  }
  if (lowerName.includes("potassium")) {
    return DISEASE_TREATMENTS["potassium_deficiency"];
  }

  return null;
}

export async function analyzePlantIdResponse(
  data: PlantIdResponse
): Promise<DiseaseAnalysisResult> {
  // Check if detected as plant
  if (!data.is_plant || data.is_plant.probability < 0.5) {
    return {
      disease: "Not a plant detected",
      confidence: data.is_plant?.probability || 0,
      severity: "mild",
      symptoms: [],
      treatment: "Please upload an image of a plant or crop",
      urgency: "low",
      recommendations: [
        "Ensure the image contains a plant or crop",
        "Try uploading a clearer image",
      ],
      isDisease: false,
    };
  }

  // Get top suggestion
  if (!data.suggestions || data.suggestions.length === 0) {
    return {
      disease: "Unable to identify plant",
      confidence: 0,
      severity: "mild",
      symptoms: [],
      treatment: "Please upload a clearer image with better lighting",
      urgency: "low",
      recommendations: [
        "Take a photo in natural daylight",
        "Ensure the affected area is clearly visible",
      ],
      isDisease: false,
    };
  }

  const topSuggestion = data.suggestions[0];
  const diseaseName = topSuggestion.name;
  const probability = topSuggestion.probability;

  // Check if it's a disease
  const diseaseInfo = mapDiseaseToTreatment(diseaseName);

  // Extract plant identification details
  const plantCommonNames = topSuggestion.details?.common_names || [];
  const plantGenus = topSuggestion.details?.taxonomy?.genus;
  const plantSpecies = topSuggestion.details?.taxonomy?.species;

  const plantDetails = {
    description: topSuggestion.details?.description,
    url: topSuggestion.details?.url,
    genus: plantGenus,
    species: plantSpecies,
  };

  if (diseaseInfo) {
    return {
      disease: diseaseInfo.disease || diseaseName,
      confidence: probability,
      severity: diseaseInfo.severity || "moderate",
      symptoms: diseaseInfo.symptoms || [],
      treatment:
        diseaseInfo.treatment ||
        "Consult with a plant pathologist for specific treatment",
      urgency: diseaseInfo.urgency || "medium",
      recommendations: diseaseInfo.recommendations || [
        "Monitor the plant closely",
        "Consider consulting a plant specialist",
      ],
      isDisease: true,
      plantName: diseaseName,
      plantCommonNames,
      plantDetails,
      rawResponse: data,
    };
  }

  // Plant appears healthy or species identified but no disease
  return {
    disease: `Plant appears healthy`,
    confidence: probability,
    severity: "mild",
    symptoms: ["Plant appears to be healthy or not showing disease symptoms"],
    treatment:
      "Continue regular maintenance and monitor for any changes in plant condition",
    urgency: "low",
    recommendations: [
      "Maintain regular watering schedule",
      "Monitor for any changes",
      "Ensure adequate sunlight",
    ],
    isDisease: false,
    plantName: diseaseName,
    plantCommonNames,
    plantDetails,
    rawResponse: data,
  };
}

// Fallback local analysis if API is unavailable
export function analyzeImageLocally(
  imageData: ImageData
): DiseaseAnalysisResult {
  const data = imageData.data;
  let totalYellow = 0;
  let totalGreen = 0;
  let totalRed = 0;
  let totalBrown = 0;
  let totalBrightness = 0;
  let spotPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    totalBrightness += brightness;

    if (r > 150 && g > 150 && b < 100) totalYellow++;
    if (r < 150 && g > 150 && b < 150) totalGreen++;
    if (r > 100 && g < 100 && b < 100) {
      totalRed++;
      if (brightness < 100) spotPixels++;
    }
    if (r > 100 && r < 180 && g > 50 && g < 150 && b < 100) totalBrown++;
  }

  const totalPixels = data.length / 4;
  const yellowingScore = totalYellow / totalPixels;
  const greenScore = totalGreen / totalPixels;
  const spottingScore = spotPixels / totalPixels;
  const brownScore = totalBrown / totalPixels;

  if (greenScore > 0.4 && yellowingScore < 0.1 && spottingScore < 0.05) {
    return {
      disease: "Plant Appears Healthy",
      confidence: 0.75,
      severity: "mild",
      symptoms: ["Green foliage", "Normal growth pattern"],
      treatment: "Continue regular maintenance and monitoring",
      urgency: "low",
      recommendations: ["Maintain regular watering", "Monitor for changes"],
      isDisease: false,
    };
  }

  if (yellowingScore > 0.25 && brownScore > 0.15) {
    return {
      disease: "Early Blight (Detected)",
      confidence: Math.min(0.85, 0.5 + yellowingScore + brownScore),
      severity: "moderate",
      urgency: "high",
      symptoms: [
        "Brown spots with concentric rings",
        "Yellowing leaves",
        "Spots on lower leaves",
      ],
      treatment:
        "Apply fungicide, remove affected leaves, improve air circulation",
      recommendations: [
        "Prune lower leaves immediately",
        "Apply fungicide every 7-10 days",
      ],
      isDisease: true,
    };
  }

  return {
    disease: "Image analysis inconclusive",
    confidence: 0.5,
    severity: "mild",
    symptoms: ["Unable to determine from local analysis"],
    treatment: "Please upload a clearer image",
    urgency: "low",
    recommendations: ["Try uploading a higher quality image"],
    isDisease: false,
  };
}
