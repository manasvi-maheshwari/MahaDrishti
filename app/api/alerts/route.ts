import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, generateAlerts } from "@/lib/crowdData";
import { parseMultiplier } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const multiplier = parseMultiplier(request.nextUrl.searchParams.get("multiplier"));

  const readings = simulateCrowdData(multiplier);
  const alerts = generateAlerts(readings);

  return NextResponse.json({ alerts, count: alerts.length });
}