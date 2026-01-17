interface DiseaseAnalysisResult {
  disease: string
  confidence: number
  severity: "mild" | "moderate" | "severe" | "critical"
  symptoms: string[]
  treatment: string
  urgency: "low" | "medium" | "high" | "critical"
  recommendations: string[]
}

interface ImageMetrics {
  yellowingScore: number
  greenScore: number
  redScore: number
  brownScore: number
  spottingScore: number
  imageQuality: "poor" | "fair" | "good"
  averageBrightness: number
}

const DISEASE_DATABASE: Record<string, DiseaseAnalysisResult> = {
  healthy: {
    disease: "Plant Appears Healthy",
    confidence: 0.95,
    severity: "mild",
    symptoms: ["Green foliage", "Normal growth pattern"],
    treatment: "Continue regular maintenance and monitoring",
    urgency: "low",
    recommendations: ["Maintain regular watering schedule", "Monitor for any changes"],
  },
  early_blight: {
    disease: "Early Blight",
    confidence: 0.85,
    severity: "moderate",
    symptoms: ["Brown spots with concentric rings", "Yellowing leaves", "Spots start on lower leaves"],
    treatment: "Apply fungicide (chlorothalonil or mancozeb), remove affected leaves, improve air circulation",
    urgency: "high",
    recommendations: [
      "Prune lower leaves immediately",
      "Apply fungicide every 7-10 days",
      "Increase spacing between plants",
      "Avoid overhead watering",
    ],
  },
  powdery_mildew: {
    disease: "Powdery Mildew",
    confidence: 0.82,
    severity: "moderate",
    symptoms: ["White powdery coating on leaves", "Leaf curling", "Stunted growth"],
    treatment: "Apply sulfur spray or potassium bicarbonate, improve air circulation, reduce humidity",
    urgency: "medium",
    recommendations: [
      "Spray with fungicide immediately",
      "Remove heavily infected leaves",
      "Increase air circulation with fans",
      "Avoid excess humidity",
    ],
  },
  leaf_spot: {
    disease: "Leaf Spot Disease",
    confidence: 0.8,
    severity: "moderate",
    symptoms: ["Dark spots on leaves", "Yellow halo around spots", "Spots may merge"],
    treatment: "Apply copper fungicide, remove infected leaves, avoid wetting foliage",
    urgency: "medium",
    recommendations: [
      "Remove all spotted leaves",
      "Apply copper-based fungicide",
      "Water at soil level only",
      "Space plants for better air flow",
    ],
  },
  rust: {
    disease: "Rust Disease",
    confidence: 0.78,
    severity: "moderate",
    symptoms: ["Orange or rust-colored pustules", "Yellow upper leaf surface", "Brown/rust lower surface"],
    treatment: "Apply sulfur or copper fungicide, remove infected leaves, improve air circulation",
    urgency: "high",
    recommendations: [
      "Apply fungicide spray immediately",
      "Remove heavily infected leaves",
      "Prune lower branches",
      "Increase plant spacing",
    ],
  },
  nitrogen_deficiency: {
    disease: "Nitrogen Deficiency",
    confidence: 0.75,
    severity: "mild",
    symptoms: ["Overall yellowing of leaves", "Yellowing starts from lower leaves", "Stunted growth"],
    treatment: "Apply nitrogen-rich fertilizer (urea, ammonium nitrate), improve soil quality",
    urgency: "medium",
    recommendations: [
      "Apply balanced fertilizer with high nitrogen",
      "Consider foliar spray of urea solution",
      "Add organic compost to soil",
      "Monitor growth improvement in 2-3 weeks",
    ],
  },
  iron_deficiency: {
    disease: "Iron Deficiency (Chlorosis)",
    confidence: 0.73,
    severity: "mild",
    symptoms: ["Yellowing between leaf veins", "Veins remain green", "New growth appears pale"],
    treatment: "Apply iron supplement (chelated iron), adjust soil pH if needed",
    urgency: "medium",
    recommendations: [
      "Apply iron chelate solution",
      "Test and adjust soil pH",
      "Improve soil drainage",
      "Add micronutrient fertilizer",
    ],
  },
}

export function analyzeImagePixels(canvas: HTMLCanvasElement): ImageMetrics {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let totalYellow = 0
  let totalGreen = 0
  let totalRed = 0
  let totalBrown = 0
  let totalBrightness = 0
  let spotPixels = 0

  // Analyze pixel by pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (r + g + b) / 3

    totalBrightness += brightness

    // Yellow detection (high R, high G, low B)
    if (r > 150 && g > 150 && b < 100) totalYellow++

    // Green detection (low R, high G, low B)
    if (r < 150 && g > 150 && b < 150) totalGreen++

    // Red/brown spots detection (high R, low G, low B)
    if (r > 100 && g < 100 && b < 100) {
      totalRed++
      if (brightness < 100) spotPixels++
    }

    // Brown detection
    if (r > 100 && r < 180 && g > 50 && g < 150 && b < 100) totalBrown++
  }

  const totalPixels = data.length / 4
  const averageBrightness = totalBrightness / totalPixels

  return {
    yellowingScore: totalYellow / totalPixels,
    greenScore: totalGreen / totalPixels,
    redScore: totalRed / totalPixels,
    brownScore: totalBrown / totalPixels,
    spottingScore: spotPixels / totalPixels,
    imageQuality: averageBrightness > 150 ? "good" : averageBrightness > 100 ? "fair" : "poor",
    averageBrightness,
  }
}

export function detectPlantDisease(metrics: ImageMetrics): DiseaseAnalysisResult {
  // If image is too dark or too bright, quality is poor
  if (metrics.imageQuality === "poor") {
    return {
      disease: "Unable to analyze - poor image quality",
      confidence: 0.4,
      severity: "mild",
      symptoms: ["Image too dark or too bright"],
      treatment: "Please upload a clearer image with better lighting",
      urgency: "low",
      recommendations: [
        "Take a photo in natural daylight",
        "Ensure the affected area is clearly visible",
        "Avoid shadows and backlighting",
      ],
    }
  }

  // If mostly green, plant is healthy
  if (metrics.greenScore > 0.4 && metrics.yellowingScore < 0.1 && metrics.spottingScore < 0.05) {
    return DISEASE_DATABASE["healthy"]
  }

  // Detect specific diseases based on color metrics
  if (metrics.yellowingScore > 0.25 && metrics.brownScore > 0.15) {
    return {
      ...DISEASE_DATABASE["early_blight"],
      confidence: Math.min(0.85, 0.5 + metrics.yellowingScore + metrics.brownScore),
    }
  }

  if (metrics.yellowingScore > 0.35 && metrics.spottingScore < 0.05) {
    return {
      ...DISEASE_DATABASE["nitrogen_deficiency"],
      confidence: Math.min(0.85, 0.5 + metrics.yellowingScore),
    }
  }

  if (metrics.redScore > 0.2 && metrics.spottingScore > 0.08) {
    return {
      ...DISEASE_DATABASE["rust"],
      confidence: Math.min(0.85, 0.5 + metrics.redScore + metrics.spottingScore),
    }
  }

  if (metrics.brownScore > 0.2 && metrics.spottingScore > 0.1) {
    return {
      ...DISEASE_DATABASE["leaf_spot"],
      confidence: Math.min(0.85, 0.5 + metrics.brownScore + metrics.spottingScore),
    }
  }

  if (metrics.yellowingScore > 0.15 && metrics.greenScore > 0.3) {
    return {
      ...DISEASE_DATABASE["iron_deficiency"],
      confidence: 0.75,
    }
  }

  // Default: likely healthy
  return DISEASE_DATABASE["healthy"]
}
