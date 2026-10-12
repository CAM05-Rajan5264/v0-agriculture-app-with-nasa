import { NextResponse } from "next/server"
import { getSatelliteMetadata } from "@/lib/nasa-gibs-imagery"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latitude = Number(searchParams.get("latitude"))
  const longitude = Number(searchParams.get("longitude"))

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Valid coordinates are required" }, { status: 400 })
  }

  const captures = await getSatelliteMetadata(latitude, longitude)
  const bestCapture = captures
    .filter((capture) => capture.date)
    .sort((a, b) => (a.cloudCover - b.cloudCover) || b.date.localeCompare(a.date))[0] || null

  return NextResponse.json({ capture: bestCapture }, { headers: { "Cache-Control": "public, max-age=3600" } })
}
