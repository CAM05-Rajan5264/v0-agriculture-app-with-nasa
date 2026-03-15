import { createClient } from "@/lib/supabase/server";
import { analyzePlantIdResponse } from "@/lib/plant-disease-api";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for analysis

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
    const { base64Image, cropId, farmId } = body;

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

    // Use plant.id API for disease detection
    // Try both naming conventions for the API key
    const apiKey = process.env.PLANT_ID_API_KEY || process.env.PLANTID_API_KEY;
    
    console.log("[v0] API Key check - Key exists:", !!apiKey);
    console.log("[v0] API Key name:", apiKey ? "PLANT_ID_API_KEY or PLANTID_API_KEY" : "NOT SET");
    if (apiKey) {
      console.log("[v0] API Key length:", apiKey.length);
      console.log("[v0] API Key starts with:", apiKey.substring(0, 10));
      console.log("[v0] API Key ends with:", apiKey.substring(apiKey.length - 10));
    }
    
    if (!apiKey) {
      console.log("[v0] ERROR: Plant ID API key not configured");
      console.log("[v0] Please add PLANT_ID_API_KEY to environment variables");
      console.log("[v0] Using fallback analysis");
      analysisResult = getFallbackAnalysis("API_KEY_MISSING");
    } else {
      try {
        console.log("[v0] Sending image to plant.id API for analysis...");
        console.log("[v0] Image size:", base64Image.length, "bytes");
        
        const requestBody = {
          images: [base64Image],
          modifiers: ["similar_images"],
          plant_details: ["description", "url", "common_names", "taxonomy"],
        };

        console.log("[v0] Request headers - Api-Key present:", !!apiKey);
        console.log("[v0] Request body size:", JSON.stringify(requestBody).length, "bytes");
        
        const startTime = Date.now();
        const response = await fetch("https://api.plant.id/v2/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        const responseTime = Date.now() - startTime;
        console.log("[v0] API response received in", responseTime, "ms");
        console.log("[v0] API Status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[v0] Plant ID API error:", response.status, errorText);
          
          // Log specific error scenarios
          if (response.status === 401) {
            console.error("[v0] ERROR: Invalid API key");
            analysisResult = getFallbackAnalysis("INVALID_API_KEY");
          } else if (response.status === 429) {
            console.error("[v0] ERROR: Rate limit exceeded");
            analysisResult = getFallbackAnalysis("RATE_LIMIT");
          } else if (response.status === 413) {
            console.error("[v0] ERROR: Image too large");
            analysisResult = getFallbackAnalysis("IMAGE_TOO_LARGE");
          } else {
            console.error("[v0] ERROR: API server error");
            analysisResult = getFallbackAnalysis("API_ERROR");
          }
        } else {
          const data: PlantIdResponse = await response.json();
          console.log("[v0] Plant ID API response received successfully");
          console.log("[v0] Suggestions count:", data.suggestions?.length);
          console.log("[v0] Plant probability:", data.is_plant?.probability);
          analysisResult = await analyzePlantIdResponse(data);
        }
      } catch (apiError) {
        console.error("[v0] Plant ID API failed:", apiError);
        if (apiError instanceof Error) {
          console.error("[v0] Error details:", apiError.message);
          if (apiError.message.includes("fetch")) {
            console.error("[v0] Network error - unable to reach plant.id API");
            analysisResult = getFallbackAnalysis("NETWORK_ERROR");
          } else if (apiError.message.includes("timeout")) {
            console.error("[v0] Request timeout");
            analysisResult = getFallbackAnalysis("TIMEOUT");
          } else {
            analysisResult = getFallbackAnalysis("PARSE_ERROR");
          }
        } else {
          analysisResult = getFallbackAnalysis("UNKNOWN_ERROR");
        }
      }
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

function getFallbackAnalysis(errorType?: string) {
  const errorMessages: Record<string, { disease: string; symptoms: string[]; treatment: string; recommendations: string[] }> = {
    API_KEY_MISSING: {
      disease: "API Key Not Configured",
      symptoms: ["Missing PLANT_ID_API_KEY environment variable"],
      treatment: "Add your plant.id API key to the Vars section",
      recommendations: [
        "Open project settings (gear icon)",
        "Go to Vars section",
        "Add variable: PLANT_ID_API_KEY = 2b106T6wt500zga8mnEmtoDu",
        "Wait 30 seconds for environment to reload",
        "Try uploading again"
      ],
    },
    INVALID_API_KEY: {
      disease: "Invalid API Key",
      symptoms: ["API key is incorrect or expired"],
      treatment: "Verify and update your API key",
      recommendations: [
        "Check that the API key is correct",
        "Ensure no extra spaces or characters",
        "Try regenerating the key on plant.id dashboard",
        "Update the key in Vars section",
      ],
    },
    RATE_LIMIT: {
      disease: "Rate Limit Exceeded",
      symptoms: ["Too many requests to the API"],
      treatment: "Wait a few minutes and try again",
      recommendations: [
        "Wait 5-10 minutes before trying again",
        "Check your plant.id plan limits",
        "Consider upgrading your plan for higher limits",
      ],
    },
    IMAGE_TOO_LARGE: {
      disease: "Image Too Large",
      symptoms: ["Image exceeds maximum size"],
      treatment: "Please try a smaller image",
      recommendations: [
        "Compress the image before uploading",
        "Ensure image is less than 5MB",
        "Try reducing image dimensions",
      ],
    },
    NETWORK_ERROR: {
      disease: "Network Connection Error",
      symptoms: ["Unable to reach the plant.id API server"],
      treatment: "Check your internet connection and try again",
      recommendations: [
        "Check your internet connection",
        "Try again in a moment",
        "Verify firewall settings",
        "Contact support if issue persists",
      ],
    },
    TIMEOUT: {
      disease: "Request Timeout",
      symptoms: ["API request took too long"],
      treatment: "Please try again",
      recommendations: [
        "Check your internet speed",
        "Try uploading a smaller image",
        "Wait a moment and try again",
      ],
    },
    PARSE_ERROR: {
      disease: "Invalid Response Format",
      symptoms: ["API returned unexpected format"],
      treatment: "Please try again",
      recommendations: [
        "Try uploading the image again",
        "Check that the API is working",
        "Contact support if issue continues",
      ],
    },
    API_ERROR: {
      disease: "API Server Error",
      symptoms: ["plant.id API encountered an error"],
      treatment: "Please try again in a moment",
      recommendations: [
        "Wait a few minutes and try again",
        "Check plant.id service status",
        "Try with a different image",
      ],
    },
    UNKNOWN_ERROR: {
      disease: "Unknown Error Occurred",
      symptoms: ["An unexpected error occurred"],
      treatment: "Please try again",
      recommendations: [
        "Refresh the page and try again",
        "Check browser console for details",
        "Contact support if issue persists",
      ],
    },
  };

  const errorInfo = errorMessages[errorType || "UNKNOWN_ERROR"] || errorMessages.UNKNOWN_ERROR;

  return {
    disease: errorInfo.disease,
    confidence: 0,
    severity: "mild" as const,
    symptoms: errorInfo.symptoms,
    treatment: errorInfo.treatment,
    urgency: "low" as const,
    recommendations: errorInfo.recommendations,
    isDisease: false,
  };
}
