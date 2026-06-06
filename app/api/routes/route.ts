import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, getRouteRecommendations } from "@/lib/crowdData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const multiplier = parseFloat(searchParams.get("multiplier") ?? "1.0");

  const readings = simulateCrowdData(multiplier);
  const routes = getRouteRecommendations(readings);

  return NextResponse.json({ routes });
}
