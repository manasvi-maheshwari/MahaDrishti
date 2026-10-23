import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { simulateCrowdData, generateAlerts, LOCATIONS, THRESHOLDS } from "@/lib/crowdData";
import { parseMultiplier } from "@/lib/validation";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

// Simple in-memory cache store for Gemini simulation responses
interface CacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

const advisoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cooldown

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request.headers))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const multiplier = parseMultiplier(body.multiplier);

  // Check in-memory cache
  const cacheKey = `mult-${multiplier.toFixed(1)}`;
  const cached = advisoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...cached.data,
      cached: true,
    });
  }

  const readings = simulateCrowdData(multiplier);
  const alerts = generateAlerts(readings);

  const criticalLocs = readings
    .filter((r) => r.densityRatio > THRESHOLDS.advisory.highDensity)
    .map((r) => {
      const loc = LOCATIONS.find((l) => l.id === r.locationId);
      return `${loc?.name ?? r.locationName}: ${Math.round(r.densityRatio * 100)}% full, trend: ${r.trend}`;
    });

  const totalPilgrims = readings.reduce((s, r) => s + r.count, 0);
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback response helper function
  const getFallbackData = (reason: string) => {
    const actions = criticalLocs.length > 0 
      ? [
          "Deploy crowd control officers to high-density choke points",
          "Activate digital variable message signage for alternate routes",
          "Put medical standby teams on high alert in affected sectors"
        ]
      : [
          "Maintain standard gate oversight and perimeter monitoring",
          "Keep designated emergency corridors clear of obstruction",
          "Monitor entry counts at primary transit hubs"
        ];

    return {
      source: "fallback",
      reason,
      advisory: `SITUATION ASSESSMENT:\n${criticalLocs.length} high-density zones active with approximately ${totalPilgrims.toLocaleString()} pilgrims across sectors. Monitoring protocols engaged.\n\nIMMEDIATE ACTIONS:\n- ${actions[0]}\n- ${actions[1]}\n- ${actions[2]}\n\nPILGRIM ADVISORY:\nPlease follow marked routes and avoid overcrowded ghats — use alternate paths for safe darshan.`,
      timestamp: new Date().toISOString(),
    };
  };

  // Check if API key exists before trying to call Gemini
  if (!apiKey) {
    return NextResponse.json(getFallbackData("Missing API Key"));
  }

  const prompt = `You are an AI command center analyst for MahaKumbh 2028 crowd management in Prayagraj.

Current situation:
- Total pilgrims across all zones: ${totalPilgrims.toLocaleString()}
- Active critical/high alerts: ${alerts.filter(a => a.severity === "critical" || a.severity === "high").length}
- High-density locations (>${Math.round(THRESHOLDS.advisory.highDensity * 100)}%): ${criticalLocs.length > 0 ? criticalLocs.join("; ") : "None currently"}
- Simulation intensity: ${multiplier}x normal

Give a concise 3-part situation report:
1. SITUATION ASSESSMENT (2 sentences)
2. IMMEDIATE ACTIONS (3 bullet points for field commanders)
3. PILGRIM ADVISORY (1 sentence public announcement)

Rules:
- Only mention these monitored locations by name: ${LOCATIONS.map((l) => l.name).join(", ")}. Do not invent roads, landmarks, or place names that are not in this list.
- Start directly with "SITUATION ASSESSMENT:" with no introduction line.
- Use plain text only: no markdown, no asterisks, no bold. Start each action line with "- ".
- Be specific, action-oriented, and keep the total response under 200 words.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "AI advisory unavailable.";

    const responseData = {
      source: "gemini",
      advisory: text,
      timestamp: new Date().toISOString(),
    };

    // Save result to cache before returning
    advisoryCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(getFallbackData("API Error"));
  }
}