import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const requestSchema = z.object({
  farmId: z.string().uuid(),
  cropId: z.string().uuid(),
  soilQuality: z.number().finite().min(0).max(100),
  irrigationMm: z.number().finite().min(0).max(2000),
})

interface HistoricalYield {
  average_yield: number | string | null
  yield_unit: string | null
  crop_type: string | null
  soil_quality_score: number | string | null
  irrigation_applied: number | string | null
}

function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "Choose a farm and crop, then enter soil quality from 0 to 100 and irrigation from 0 to 2,000 mm." }, { status: 400 })

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return Response.json({ error: "Sign in to run a farm yield estimate." }, { status: 401 })

  const { farmId, cropId, soilQuality, irrigationMm } = parsed.data
  const [{ data: farm }, { data: crop }] = await Promise.all([
    supabase.from("farms").select("id").eq("id", farmId).eq("user_id", authData.user.id).maybeSingle(),
    supabase.from("crops").select("id,name,expected_harvest_date").eq("id", cropId).eq("farm_id", farmId).eq("user_id", authData.user.id).maybeSingle(),
  ])
  if (!farm || !crop) return Response.json({ error: "That farm and crop could not be found." }, { status: 404 })

  const { data: history, error: historyError } = await supabase
    .from("crop_historical_yields")
    .select("average_yield,yield_unit,crop_type,soil_quality_score,irrigation_applied")
    .eq("farm_id", farmId)
    .eq("user_id", authData.user.id)
    .limit(200)

  if (historyError) {
    console.error("[v0] Yield history query failed:", historyError.message)
    return Response.json({ error: "Harvest history could not be loaded." }, { status: 500 })
  }

  const trainingRows = ((history ?? []) as HistoricalYield[])
    .filter((row) => row.crop_type?.trim().toLocaleLowerCase() === crop.name.trim().toLocaleLowerCase())
    .map((row) => ({
      yieldValue: toFiniteNumber(row.average_yield),
      yieldUnit: row.yield_unit?.trim() || "kg",
      soilQuality: toFiniteNumber(row.soil_quality_score),
      irrigationMm: toFiniteNumber(row.irrigation_applied),
    }))
    .filter((row): row is { yieldValue: number; yieldUnit: string; soilQuality: number; irrigationMm: number } =>
      row.yieldValue !== null && row.soilQuality !== null && row.irrigationMm !== null,
    )

  if (trainingRows.length < 3) {
    return Response.json({ error: `Add at least 3 complete ${crop.name} harvest records for this farm to train a useful local model.`, sampleCount: trainingRows.length }, { status: 422 })
  }

  const soilRange = Math.max(10, Math.max(...trainingRows.map((row) => row.soilQuality)) - Math.min(...trainingRows.map((row) => row.soilQuality)))
  const irrigationRange = Math.max(25, Math.max(...trainingRows.map((row) => row.irrigationMm)) - Math.min(...trainingRows.map((row) => row.irrigationMm)))
  const neighbors = trainingRows
    .map((row) => ({
      ...row,
      distance: Math.hypot((soilQuality - row.soilQuality) / soilRange, (irrigationMm - row.irrigationMm) / irrigationRange),
    }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 3)

  const weightedTotal = neighbors.reduce((sum, row) => sum + row.yieldValue / (0.15 + row.distance), 0)
  const totalWeight = neighbors.reduce((sum, row) => sum + 1 / (0.15 + row.distance), 0)
  const predictedYield = Number((weightedTotal / totalWeight).toFixed(2))
  const meanDistance = neighbors.reduce((sum, row) => sum + row.distance, 0) / neighbors.length
  const fitScore = Math.round(100 * Math.exp(-meanDistance) * Math.min(1, trainingRows.length / 8))
  const observedRange: [number, number] = [
    Number(Math.min(...neighbors.map((row) => row.yieldValue)).toFixed(2)),
    Number(Math.max(...neighbors.map((row) => row.yieldValue)).toFixed(2)),
  ]
  const unitCounts = new Map<string, number>()
  for (const row of neighbors) unitCounts.set(row.yieldUnit, (unitCounts.get(row.yieldUnit) ?? 0) + 1)
  const yieldUnit = [...unitCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "kg"

  const { error: saveError } = await supabase.from("crop_yield_predictions").insert({
    user_id: authData.user.id,
    farm_id: farmId,
    crop_id: cropId,
    predicted_yield: predictedYield,
    yield_unit: yieldUnit,
    confidence_score: fitScore / 100,
    model_version: "farm-knn-v1",
    prediction_for_date: crop.expected_harvest_date,
    prediction_factors: {
      algorithm: "feature-scaled k-nearest neighbors",
      trainingRecords: trainingRows.length,
      neighborsUsed: neighbors.length,
      input: { soilQualityScore: soilQuality, seasonalIrrigationMm: irrigationMm },
      nearestDistances: neighbors.map((row) => Number(row.distance.toFixed(3))),
      fitScoreMeaning: "similarity and sample-volume indicator, not a calibrated probability",
    },
  })

  if (saveError) {
    console.error("[v0] Yield prediction save failed:", saveError.message)
    return Response.json({ error: "The estimate was calculated but could not be saved." }, { status: 500 })
  }

  return Response.json({
    predictedYield,
    yieldUnit,
    fitScore,
    sampleCount: trainingRows.length,
    neighborsUsed: neighbors.length,
    observedRange,
    modelVersion: "farm-knn-v1",
  })
}
