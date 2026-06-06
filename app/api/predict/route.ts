import { NextRequest, NextResponse } from "next/server";
import { generateHourlyForecast, LOCATIONS } from "@/lib/crowdData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId") ?? "triveni";

  const loc = LOCATIONS.find((l) => l.id === locationId);
  const forecast = generateHourlyForecast(locationId);

  // Find peak hour
  const peakHour = forecast.reduce((prev, curr) => (curr.predicted > prev.predicted ? curr : prev));
  const safeHours = forecast.filter((f) => f.percentFull < 50).map((f) => f.hour);

  return NextResponse.json({
    locationId,
    locationName: loc?.name ?? locationId,
    forecast,
    insights: {
      peakHour: peakHour.hour,
      peakCount: peakHour.predicted,
      safeWindows: safeHours.slice(0, 4),
      recommendation: peakHour.percentFull > 80
        ? `Avoid ${loc?.name} during ${peakHour.hour}. Best times: ${safeHours.slice(0, 2).join(", ")}`
        : `${loc?.name} remains manageable. Peak at ${peakHour.hour} but within safe limits.`,
    },
  });
}
