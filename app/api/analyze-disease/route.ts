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
    const apiKey = process.env.PLANT_ID_API_KEY;
    
    console.log("[v0] API Key check - Key exists:", !!apiKey);
    console.log("[v0] Environment variables available:", Object.keys(process.env).filter(k => k.includes('PLANT') || k.includes('SUPABASE')));
    
    if (!apiKey) {
      console.log("[v0] Plant ID API key not configured, using fallback analysis");
      analysisResult = await getFallbackAnalysis();
    } else {
      try {
        console.log("[v0] Sending image to plant.id API for analysis...");
        
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[v0] Plant ID API error:", response.status, errorText);
          console.log("[v0] Falling back to local analysis due to API error");
          analysisResult = await getFallbackAnalysis();
        } else {
          const data: PlantIdResponse = await response.json();
          console.log("[v0] Plant ID API response received");
          analysisResult = await analyzePlantIdResponse(data);
        }
      } catch (apiError) {
        console.error("[v0] Plant ID API failed:", apiError);
        console.log("[v0] Using fallback analysis due to API error");
        analysisResult = await getFallbackAnalysis();
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
