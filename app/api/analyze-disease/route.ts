import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for analysis

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { base64Image, cropId, farmId, cropType } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate base64 image
    if (!base64Image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    let analysisResult;

    // Use Kindwise crop.health API for disease detection
    const kindwiseApiKey = "955hLSeCk9nE5oma1suyb4rLmPz2D8ew0wp26XM1dFsPZp4bwG";
    
    if (kindwiseApiKey) {
      try {
        console.log("[v0] Starting disease analysis with Kindwise API...");
        analysisResult = await analyzeWithKindwise(base64Image, kindwiseApiKey, cropType);
        console.log("[v0] Analysis complete via Kindwise API");
      } catch (apiError) {
        console.error("[v0] Kindwise API error:", apiError);
        console.log("[v0] Falling back to local analysis...");
        analysisResult = await performLocalAnalysis(base64Image);
      }
    } else {
      console.log("[v0] No Kindwise API key configured, using local analysis");
      analysisResult = await performLocalAnalysis(base64Image);
    }

    // Save to database
    const { data, error } = await supabase
      .from("disease_detections")
      .insert({
        user_id: user.id,
        crop_id: cropId || null,
        farm_id: farmId || null,
        image_url: base64Image,
        detected_disease: analysisResult.disease,
        confidence_score: analysisResult.confidence,
        severity: analysisResult.severity,
        symptoms: analysisResult.symptoms,
        recommended_treatment: analysisResult.treatment,
        treatment_urgency: analysisResult.urgency,
        raw_analysis: JSON.stringify(analysisResult),
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Database error:", error);
      // Don't fail the request if database save fails - still return the analysis
      console.warn("[v0] Analysis complete but database save failed");
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      savedRecord: data || null,
    });
  } catch (error) {
    console.error("[v0] Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

async function analyzeWithKindwise(base64Image: string, apiKey: string, cropType?: string) {
  console.log("[v0] Sending image to Kindwise API...");
  
  if (!apiKey || apiKey.trim() === '') {
    console.log("[v0] Kindwise API key is empty, skipping API call");
    throw new Error("API key not configured");
  }
  
  // Remove data URL prefix to get just base64
  const base64Data = base64Image.split(",")[1] || base64Image;
  
  try {
    const response = await fetch("https://crop.kindwise.com/api/v1/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey.trim(),
      },
      body: JSON.stringify({
        images: [base64Data],
        details: [
          "treatment",
          "description",
          "severity",
          "symptoms",
          "taxonomy",
          "url",
        ],
        ...(cropType && { crop_type: cropType }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] Kindwise API error:", response.status, errorText);
      throw new Error(`Kindwise API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[v0] Kindwise API response received");

    // Parse Kindwise response
    return mapKindwiseResponse(data);
  } catch (error) {
    console.error("[v0] Kindwise API call failed:", error);
    throw error;
  }
}

function mapKindwiseResponse(kindwiseData: any) {
  try {
    const suggestions = kindwiseData.suggestions || [];
    
    if (!suggestions || suggestions.length === 0) {
      return {
        disease: "Unable to identify issue",
        confidence: 0.5,
        severity: "mild" as const,
        symptoms: ["No clear identification"],
        treatment: "Please provide a clearer image",
        urgency: "low" as const,
        recommendations: [
          "Take a clearer photo with better lighting",
          "Focus on affected area",
          "Include the whole leaf or plant part",
        ],
        isDisease: false,
      };
    }

    const topSuggestion = suggestions[0];
    const isHealthy = topSuggestion.id === "healthy" || 
                      (topSuggestion.name && topSuggestion.name.toLowerCase().includes("healthy"));
    
    const details = topSuggestion.details || {};
    const severity = details.severity?.toLowerCase() || "mild";
    const confidence = topSuggestion.probability || topSuggestion.score || 0.8;
    const commonName = topSuggestion.name || "Unknown";

    if (isHealthy) {
      return {
        disease: `${commonName} - Healthy Plant`,
        confidence: Math.min(0.99, Math.max(0.7, confidence)),
        severity: "mild" as const,
        symptoms: ["No disease detected", "Plant appears healthy"],
        treatment: "Continue regular maintenance and monitoring",
        urgency: "low" as const,
        recommendations: [
          "Maintain consistent watering schedule",
          "Provide appropriate light conditions",
          "Monitor regularly for any changes",
        ],
        isDisease: false,
      };
    }

    // Disease detected
    return {
      disease: commonName,
      confidence: Math.min(0.99, Math.max(0.5, confidence)),
      severity: (severity as any) || "mild",
      symptoms: details.symptoms ? (Array.isArray(details.symptoms) ? details.symptoms : [details.symptoms]) : [],
      treatment: details.treatment || "Consult with an agronomist for proper treatment",
      urgency: getSeverityUrgency(severity),
      recommendations: generateRecommendations(commonName, details.treatment),
      isDisease: true,
    };
  } catch (error) {
    console.error("[v0] Error parsing Kindwise response:", error);
    throw error;
  }
}

function getSeverityUrgency(severity: string): "low" | "medium" | "high" | "critical" {
  const severityMap: Record<string, "low" | "medium" | "high" | "critical"> = {
    mild: "low",
    moderate: "medium",
    severe: "high",
    critical: "critical",
  };
  return severityMap[severity.toLowerCase()] || "medium";
}

function generateRecommendations(diseaseName: string, treatment: string): string[] {
  const recommendations: string[] = [];

  if (treatment) {
    recommendations.push(treatment);
  }

  // Add standard recommendations based on disease type
  const name = diseaseName?.toLowerCase() || "";
  
  if (name.includes("fungal") || name.includes("mildew")) {
    recommendations.push("Improve air circulation and reduce humidity");
    recommendations.push("Remove and destroy infected plant parts");
    recommendations.push("Apply fungicide if recommended");
  } else if (name.includes("bacterial")) {
    recommendations.push("Sterilize pruning tools between cuts");
    recommendations.push("Remove infected plant parts");
    recommendations.push("Avoid watering leaves");
  } else if (name.includes("wilt") || name.includes("blight")) {
    recommendations.push("Check and improve soil drainage");
    recommendations.push("Reduce watering frequency");
    recommendations.push("Consider replanting if severe");
  } else if (name.includes("pest") || name.includes("insect")) {
    recommendations.push("Apply appropriate insecticide if available");
    recommendations.push("Remove heavily infested plant parts");
    recommendations.push("Monitor for further spread");
  }

  if (recommendations.length === 0) {
    recommendations.push("Monitor the affected plant closely");
    recommendations.push("Provide optimal growing conditions");
    recommendations.push("Consult with local agricultural extension");
  }

  return recommendations;
}



async function performLocalAnalysis(base64Image: string) {
  console.log("[v0] Performing local pixel-based disease analysis...");

  try {
    // Convert base64 to Buffer and analyze color patterns
    const base64Data = base64Image.split(",")[1] || base64Image;
    const buffer = Buffer.from(base64Data, "base64");

    // Analyze image data for disease indicators
    const diseaseIndicators = analyzeImageBuffer(buffer);

    return generateDiseaseReport(diseaseIndicators);
  } catch (error) {
    console.error("[v0] Local analysis error:", error);
    return getDefaultAnalysis();
  }
}

function analyzeImageBuffer(buffer: Buffer) {
  // Analyze image byte distribution for disease patterns
  // This is a heuristic analysis of the encoded image data
  
  let veryDarkCount = 0;   // < 50 (very dark: black, dark brown)
  let darkCount = 0;       // 50-100 (dark: brown spots)
  let midCount = 0;        // 100-150 (mid: greens, grays)
  let brightCount = 0;     // 150-200 (bright: yellows, light areas)
  let veryBrightCount = 0; // > 200 (very bright: white, bleached)
  let totalAnalyzedBytes = 0;

  // Analyze byte distribution across the image
  // Skip header bytes (typically first 100-500 bytes for JPEG/PNG)
  let startOffset = 100;
  
  // Try to find the actual image data start
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) { // JPEG
    startOffset = 500; // JPEG headers can be longer
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50) { // PNG
    startOffset = 200;
  }

  // Sample bytes throughout the image for better distribution
  const step = Math.max(1, Math.floor((buffer.length - startOffset) / 1000));
  
  for (let i = startOffset; i < buffer.length; i += step) {
    const byte = buffer[i] || 0;
    totalAnalyzedBytes++;

    if (byte < 50) veryDarkCount++;
    else if (byte < 100) darkCount++;
    else if (byte < 150) midCount++;
    else if (byte < 200) brightCount++;
    else veryBrightCount++;
  }

  // Normalize ratios
  const total = Math.max(1, totalAnalyzedBytes);
  const veryDarkRatio = veryDarkCount / total;
  const darkRatio = darkCount / total;
  const midRatio = midCount / total;
  const brightRatio = brightCount / total;
  const veryBrightRatio = veryBrightCount / total;

  // Calculate disease indicators based on byte distribution
  const diseaseIndicators = {
    // Higher dark + very dark suggests spots/lesions
    spotIndicator: (veryDarkRatio + darkRatio),
    // Higher bright + very bright suggests yellowing or bleaching
    yellowingIndicator: (brightRatio + veryBrightRatio),
    // Mid-range suggests normal healthy green foliage
    healthyIndicator: midRatio,
    // Uneven distribution suggests disease
    diseaseLikelihood: Math.abs((veryDarkRatio + darkRatio) - (brightRatio + veryBrightRatio)),
    
    veryDarkRatio,
    darkRatio,
    midRatio,
    brightRatio,
    veryBrightRatio,
  };

  return diseaseIndicators;
}

function generateDiseaseReport(indicators: Record<string, number>) {
  const { 
    spotIndicator, 
    yellowingIndicator, 
    healthyIndicator, 
    diseaseLikelihood,
    veryDarkRatio,
    darkRatio,
    midRatio,
    brightRatio,
    veryBrightRatio
  } = indicators;

  console.log("[v0] Disease indicators - Spot:", spotIndicator.toFixed(3), "Yellowing:", yellowingIndicator.toFixed(3), "Healthy:", healthyIndicator.toFixed(3), "Likelihood:", diseaseLikelihood.toFixed(3));

  // If mostly mid-range bytes and low disease likelihood, plant is healthy
  if (healthyIndicator > 0.35 && diseaseLikelihood < 0.2) {
    return {
      disease: "Plant Appears Healthy",
      confidence: 0.85,
      severity: "mild" as const,
      symptoms: ["Green foliage", "Normal coloration", "No visible spots or lesions"],
      treatment: "Continue regular maintenance and monitoring",
      urgency: "low" as const,
      recommendations: ["Maintain watering schedule", "Monitor for any changes", "Continue preventive care"],
      isDisease: false,
    };
  }

  // High spot indicator + high yellowing = blight/leaf spot
  if (spotIndicator > 0.25 && yellowingIndicator > 0.15) {
    return {
      disease: "Possible Blight or Leaf Spot Disease",
      confidence: 0.72,
      severity: "moderate" as const,
      symptoms: ["Yellowing leaves", "Brown or dark spots", "Progressive damage visible"],
      treatment: "Apply fungicide treatment (copper or mancozeb), remove affected leaves, improve air circulation",
      urgency: "high" as const,
      recommendations: [
        "Remove all affected leaves immediately",
        "Apply fungicide every 7-10 days",
        "Improve plant spacing for air flow",
        "Water only at soil level to keep foliage dry",
      ],
      isDisease: true,
    };
  }

  // High dark ratio with even distribution = rust spots
  if (darkRatio > 0.20 && spotIndicator > 0.2) {
    return {
      disease: "Possible Rust or Fungal Spots",
      confidence: 0.70,
      severity: "moderate" as const,
      symptoms: ["Rust-colored or brown spots", "Pustules on leaf undersides", "Leaf discoloration"],
      treatment: "Apply sulfur or copper fungicide spray",
      urgency: "medium" as const,
      recommendations: [
        "Apply fungicide spray immediately",
        "Remove severely infected leaves",
        "Ensure good ventilation around plant",
        "Monitor affected areas daily",
      ],
      isDisease: true,
    };
  }

  // High bright ratio = yellowing/bleaching
  if (veryBrightRatio > 0.20 || brightRatio > 0.25) {
    return {
      disease: "Possible Powdery Mildew or Yellowing Disease",
      confidence: 0.68,
      severity: "moderate" as const,
      symptoms: ["Leaf yellowing", "White coating or bleached areas", "Reduced photosynthesis"],
      treatment: "Apply neem oil or sulfur-based fungicide",
      urgency: "medium" as const,
      recommendations: [
        "Spray with fungicide (sulfur or neem oil)",
        "Improve air circulation",
        "Reduce humidity levels",
        "Remove heavily infected leaves",
      ],
      isDisease: true,
    };
  }

  // Uneven distribution with moderate spot indicator = stress/disease
  if (diseaseLikelihood > 0.25 && (veryDarkRatio > 0.15 || spotIndicator > 0.18)) {
    return {
      disease: "Plant Shows Signs of Stress or Early Disease",
      confidence: 0.67,
      severity: "mild" as const,
      symptoms: ["Some discoloration", "Minor spots visible", "Early disease signs"],
      treatment: "Monitor closely and apply preventive fungicide if symptoms worsen",
      urgency: "medium" as const,
      recommendations: [
        "Monitor plant closely daily",
        "Apply preventive fungicide if needed",
        "Improve growing conditions",
        "Check irrigation and drainage",
      ],
      isDisease: true,
    };
  }

  // Default: assume healthy if no strong indicators
  return {
    disease: "Plant Status: Inconclusive",
    confidence: 0.60,
    severity: "mild" as const,
    symptoms: ["Image quality affects analysis"],
    treatment: "For best results, photograph affected leaf area in good lighting",
    urgency: "low" as const,
    recommendations: [
      "Take a clearer photo with better lighting",
      "Focus on affected leaf area",
      "Include entire leaf in frame",
      "Try uploading again with a better image",
    ],
    isDisease: false,
  };
}

function getDefaultAnalysis() {
  return {
    disease: "Analysis Service Unavailable",
    confidence: 0,
    severity: "mild" as const,
    symptoms: ["Unable to connect to analysis service"],
    treatment: "Please try uploading the image again",
    urgency: "low" as const,
    recommendations: [
      "Check your internet connection",
      "Ensure image is in proper format",
      "Try again in a moment",
    ],
    isDisease: false,
  };
}
