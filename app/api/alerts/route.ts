import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, generateAlerts } from "@/lib/crowdData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const multiplier = parseFloat(searchParams.get("multiplier") ?? "1.0");

  const readings = simulateCrowdData(multiplier);
  const alerts = generateAlerts(readings);

  return NextResponse.json({ alerts, count: alerts.length });
}
