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

    // Try plant.id API first (server-side with secure API key)
    try {
      const apiKey = process.env.PLANT_ID_API_KEY;
      
      if (apiKey) {
        console.log("[v0] Calling plant.id API with key");
        const response = await fetch("https://api.plant.id/v2/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": apiKey,
          },
          body: JSON.stringify({
            images: [base64Image],
            modifiers: ["similar_images"],
            plant_details: ["description", "url", "common_names", "taxonomy"],
          }),
        });

        if (response.ok) {
          const data: PlantIdResponse = await response.json();
          console.log("[v0] Plant ID API response received:", data.is_plant);
          analysisResult = await analyzePlantIdResponse(data);
        } else {
          const errorText = await response.text();
          console.warn("[v0] Plant ID API error:", response.status, errorText);
          // Fall through to local analysis
          analysisResult = await getFallbackAnalysis();
        }
      } else {
        console.log("[v0] Plant ID API key not configured, using fallback analysis");
        analysisResult = await getFallbackAnalysis();
      }
    } catch (apiError) {
      console.warn("[v0] Plant ID API failed:", apiError);
      analysisResult = await getFallbackAnalysis();
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
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      savedRecord: data,
    });
  } catch (error) {
    console.error("[v0] Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

async function getFallbackAnalysis() {
  return {
    disease: "Analysis service temporarily unavailable",
    confidence: 0,
    severity: "mild" as const,
    symptoms: ["Unable to connect to analysis service"],
    treatment: "Please try uploading the image again in a moment",
    urgency: "low" as const,
    recommendations: [
      "Check your internet connection",
      "Try uploading again in a moment",
      "Ensure your plant.id API key is configured",
    ],
    isDisease: false,
  };
}
