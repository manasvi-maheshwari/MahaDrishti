import { NextRequest, NextResponse } from "next/server";
import { buildSnapshot } from "@/lib/crowdData";
import { parseMultiplier } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const multiplier = parseMultiplier(request.nextUrl.searchParams.get("multiplier"));
  return NextResponse.json(buildSnapshot(multiplier));
}