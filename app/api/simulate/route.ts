import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, generateAlerts, LOCATIONS } from "@/lib/crowdData";

export async function POST(request: NextRequest) {
  const { multiplier = 1.0 } = await request.json().catch(() => ({}));

  const readings = simulateCrowdData(multiplier);
  const alerts = generateAlerts(readings);

  const criticalLocs = readings
    .filter((r) => r.density > 0.75)
    .map((r) => {
      const loc = LOCATIONS.find((l) => l.id === r.locationId);
      return `${loc?.name}: ${Math.round(r.density * 100)}% full, trend: ${r.trend}`;
    });

  const totalPilgrims = readings.reduce((s, r) => s + r.count, 0);

  const prompt = `You are an AI command center analyst for MahaKumbh 2028 crowd management in Prayagraj.

Current situation:
- Total pilgrims across all zones: ${totalPilgrims.toLocaleString()}
- Active critical/high alerts: ${alerts.filter(a => a.severity === "critical" || a.severity === "high").length}
- High-density locations (>75%): ${criticalLocs.length > 0 ? criticalLocs.join("; ") : "None currently"}
- Simulation intensity: ${multiplier}x normal

Give a concise 3-part situation report:
1. SITUATION ASSESSMENT (2 sentences)
2. IMMEDIATE ACTIONS (3 bullet points for field commanders)
3. PILGRIM ADVISORY (1 sentence public announcement)

Be specific, use location names, be action-oriented. Keep total response under 200 words.`;

  try {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text =
    response.text ?? "AI advisory unavailable.";

  return NextResponse.json({
    advisory: text,
    timestamp: new Date().toISOString(),
  });
} catch {
    return NextResponse.json({
      advisory: `SITUATION: ${criticalLocs.length} high-density zones detected with ${totalPilgrims.toLocaleString()} pilgrims. Monitoring active.\n\nIMEDIATE ACTIONS:\n• Deploy crowd control to high-density zones\n• Activate alternate route signage\n• Alert medical teams for standby\n\nPILGRIM ADVISORY: Please follow marked routes and avoid overcrowded ghats — use alternate paths for safe darshan.`,
      timestamp: new Date().toISOString(),
    });
  }
}
