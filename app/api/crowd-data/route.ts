import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, LOCATIONS } from "@/lib/crowdData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const multiplier = parseFloat(searchParams.get("multiplier") ?? "1.0");

  const readings = simulateCrowdData(multiplier);

  const summary = {
    totalPilgrims: readings.reduce((sum, r) => sum + r.count, 0),
    averageDensity: parseFloat(
      (readings.reduce((sum, r) => sum + r.density, 0) / readings.length).toFixed(3)
    ),
    criticalLocations: readings.filter((r) => r.density > 0.85).length,
    highLocations: readings.filter((r) => r.density > 0.70 && r.density <= 0.85).length,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    readings,
    locations: LOCATIONS,
    summary,
  });
}
