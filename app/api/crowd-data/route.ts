import { NextRequest, NextResponse } from 'next/server';
import { parseMultiplier } from '@/lib/validation';
import { LOCATIONS } from '@/lib/crowdData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationId = searchParams.get('locationId');
  const multParam = searchParams.get('multiplier');

  const validIds = LOCATIONS.map((loc) => loc.id);

  if (!locationId || !validIds.includes(locationId)) {
    return NextResponse.json(
      { error: 'Unknown locationId', validLocations: validIds },
      { status: 400 }
    );
  }

  const multiplier = parseMultiplier(multParam);

  // Continue with prediction logic using locationId and multiplier...
  return NextResponse.json({ success: true, locationId, multiplier });
}