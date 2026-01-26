import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { yieldForecaster, YieldForecastInput } from "@/lib/crop-yield-forecaster";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      cropId,
      farmId,
      soilMoisture,
      temperature,
      rainfall,
      sunlight,
      nitrogen,
      phosphorus,
      potassium,
      cropAge,
      growthStage,
    } = body;

    // Validate required fields
    if (
      !cropId ||
      !farmId ||
      soilMoisture === undefined ||
      temperature === undefined ||
      rainfall === undefined ||
      sunlight === undefined ||
      nitrogen === undefined ||
      phosphorus === undefined ||
      potassium === undefined ||
      !cropAge ||
      !growthStage
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create forecast input
    const forecastInput: YieldForecastInput = {
      cropId,
      farmId,
      soilMoisture: Math.max(0, Math.min(100, soilMoisture)),
      temperature,
      rainfall: Math.max(0, rainfall),
      sunlight: Math.max(0, sunlight),
      nitrogen: Math.max(0, nitrogen),
      phosphorus: Math.max(0, phosphorus),
      potassium: Math.max(0, potassium),
      cropAge: Math.max(1, cropAge),
      growthStage,
    };

    console.log("[v0] Running yield forecast with input:", forecastInput);

    // Run prediction
    const prediction = yieldForecaster.forecast(forecastInput);

    console.log("[v0] Prediction generated successfully");

    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from("yield_predictions")
      .insert({
        user_id: user.id,
        crop_id: cropId,
        farm_id: farmId,
        estimated_yield: prediction.estimatedYield,
        confidence: prediction.confidence,
        best_case_yield: prediction.bestCaseYield,
        worst_case_yield: prediction.worstCaseYield,
        factors: JSON.stringify(prediction.factors),
        recommendations: JSON.stringify(prediction.recommendations),
        risk_factors: JSON.stringify(prediction.riskFactors),
        input_data: JSON.stringify(forecastInput),
      })
      .select()
      .single();

    if (saveError) {
      console.warn("[v0] Failed to save prediction:", saveError);
      // Still return the prediction even if save fails
    }

    return NextResponse.json({
      success: true,
      prediction,
      savedId: savedPrediction?.id || null,
    });
  } catch (error) {
    console.error("[v0] Yield prediction error:", error);
    return NextResponse.json(
      {
        error: "Prediction failed: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

// Get historical predictions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cropId = searchParams.get("cropId");
    const farmId = searchParams.get("farmId");

    let query = supabase
      .from("yield_predictions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (cropId) {
      query = query.eq("crop_id", cropId);
    }

    if (farmId) {
      query = query.eq("farm_id", farmId);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch predictions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, predictions: data || [] });
  } catch (error) {
    console.error("[v0] Fetch predictions error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
