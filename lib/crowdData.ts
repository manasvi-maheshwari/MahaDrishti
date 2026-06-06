export interface Location {
  id: string;
  name: string;
  type: "Ghat" | "Temple" | "Transport" | "Camp" | "Medical";
  lat: number;
  lng: number;
  capacity: number;
  zone: string;
}

export interface CrowdReading {
  locationId: string;
  timestamp: string;
  count: number;
  density: number; // 0-1
  trend: "rising" | "stable" | "falling";
  temperature: number;
}

export interface Alert {
  id: string;
  locationId: string;
  locationName: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  type: "overcrowding" | "surge" | "stampede_risk" | "medical" | "traffic";
}

export interface RouteOption {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  crowdLevel: "low" | "medium" | "high";
  waypoints: [number, number][];
  status: "recommended" | "caution" | "avoid";
  reason: string;
}

// All major Prayagraj Mahakumbh locations
export const LOCATIONS: Location[] = [
  { id: "triveni", name: "Triveni Sangam", type: "Ghat", lat: 25.4358, lng: 81.8836, capacity: 500000, zone: "Central" },
  { id: "ganga_ghat", name: "Ganga Ghat", type: "Ghat", lat: 25.4445, lng: 81.8636, capacity: 300000, zone: "North" },
  { id: "yamuna_ghat", name: "Yamuna Ghat", type: "Ghat", lat: 25.4289, lng: 81.8756, capacity: 250000, zone: "East" },
  { id: "ram_ghat", name: "Ram Ghat", type: "Ghat", lat: 25.4501, lng: 81.8590, capacity: 200000, zone: "North" },
  { id: "hanuman_temple", name: "Hanuman Mandir", type: "Temple", lat: 25.4484, lng: 81.8386, capacity: 80000, zone: "West" },
  { id: "akshayvat", name: "Akshayvat Temple", type: "Temple", lat: 25.4362, lng: 81.8843, capacity: 50000, zone: "Central" },
  { id: "alambagh_bus", name: "Alambagh Bus Terminal", type: "Transport", lat: 25.4350, lng: 81.8200, capacity: 100000, zone: "West" },
  { id: "prayagraj_jn", name: "Prayagraj Junction", type: "Transport", lat: 25.4484, lng: 81.8731, capacity: 150000, zone: "Central" },
  { id: "civil_lines_bus", name: "Civil Lines Bus Stand", type: "Transport", lat: 25.4608, lng: 81.8433, capacity: 80000, zone: "North" },
  { id: "sector_1_camp", name: "Sector 1 Camp", type: "Camp", lat: 25.4280, lng: 81.8620, capacity: 200000, zone: "East" },
  { id: "sector_6_camp", name: "Sector 6 Camp", type: "Camp", lat: 25.4190, lng: 81.8900, capacity: 180000, zone: "South" },
  { id: "central_hospital", name: "Central Medical Hub", type: "Medical", lat: 25.4420, lng: 81.8450, capacity: 5000, zone: "Central" },
];

// Festival event schedule (Snan dates generate massive spikes)
export const SNAN_DATES = [
  { date: "2028-01-14", name: "Makar Sankranti", multiplier: 4.5 },
  { date: "2028-01-15", name: "Makar Sankranti (cont.)", multiplier: 3.8 },
  { date: "2028-01-28", name: "Mauni Amavasya", multiplier: 6.0 },
  { date: "2028-02-02", name: "Basant Panchami", multiplier: 4.2 },
  { date: "2028-02-11", name: "Maghi Purnima", multiplier: 3.5 },
  { date: "2028-03-01", name: "Maha Shivratri", multiplier: 4.0 },
];

// Simulate realistic crowd data based on time of day
export function simulateCrowdData(simulationMultiplier = 1.0): CrowdReading[] {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Time-of-day crowd pattern (0-1 multiplier)
  const timePattern = getTimeMultiplier(hour, minute);

  return LOCATIONS.map((loc) => {
    const baseLoad = getBaseLoadForType(loc.type);
    const noise = 0.85 + Math.random() * 0.30; // ±15% random variation
    const locationFactor = getLocationFactor(loc.id, hour);

    const count = Math.floor(
  loc.capacity *
  baseLoad *
  timePattern *
  locationFactor *
  noise *
  simulationMultiplier *
  1.8
);

    const density = Math.min(count / loc.capacity, 1.0);
    const prevDensity = Math.min((count * 0.97) / loc.capacity, 1.0);

    return {
      locationId: loc.id,
      timestamp: now.toISOString(),
      count: Math.min(count, loc.capacity),
      density: parseFloat(density.toFixed(3)),
      trend: density > prevDensity + 0.02 ? "rising" : density < prevDensity - 0.02 ? "falling" : "stable",
      temperature: Math.floor(12 + Math.random() * 8),
    };
  });
}

function getTimeMultiplier(hour: number, minute: number): number {
  const t = hour + minute / 60;
  // Peak bathing times: pre-dawn (4-7am), morning (8-11am), evening (4-7pm)
  if (t >= 3.5 && t <= 7) return 0.55 + 0.45 * Math.sin(((t - 3.5) / 3.5) * Math.PI);
  if (t >= 7 && t <= 12) return 0.60 + 0.40 * Math.sin(((t - 7) / 5) * Math.PI);
  if (t >= 12 && t <= 16) return 0.35 + 0.15 * Math.sin(((t - 12) / 4) * Math.PI);
  if (t >= 16 && t <= 21) return 0.50 + 0.35 * Math.sin(((t - 16) / 5) * Math.PI);
  if (t >= 21 || t < 3.5) return 0.15;
  return 0.3;
}

function getBaseLoadForType(type: Location["type"]): number {
  const loads: Record<Location["type"], number> = {
    Ghat: 0.72,
    Temple: 0.58,
    Transport: 0.65,
    Camp: 0.45,
    Medical: 0.20,
  };
  return loads[type];
}

function getLocationFactor(id: string, hour: number): number {
  // Triveni Sangam always highest
  if (id === "triveni") return 1.0;
  if (id === "ganga_ghat" && hour >= 5 && hour <= 9) return 0.95;
  if (id === "prayagraj_jn" && (hour >= 6 && hour <= 9 || hour >= 17 && hour <= 21)) return 0.90;
  if (id === "akshayvat") return 0.88;
  return 0.70 + Math.random() * 0.20;
}

export function generateAlerts(readings: CrowdReading[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  readings.forEach((reading) => {
    const loc = LOCATIONS.find((l) => l.id === reading.locationId);
    if (!loc) return;

    if (reading.density >= 0.92) {
      alerts.push({
        id: `alert-${reading.locationId}-critical`,
        locationId: reading.locationId,
        locationName: loc.name,
        severity: "critical",
        message: `CRITICAL: ${loc.name} at ${Math.round(reading.density * 100)}% capacity. Stampede risk detected. Deploy emergency personnel immediately.`,
        timestamp: now,
        type: "stampede_risk",
      });
    } else if (reading.density >= 0.80) {
      alerts.push({
        id: `alert-${reading.locationId}-high`,
        locationId: reading.locationId,
        locationName: loc.name,
        severity: "high",
        message: `HIGH: ${loc.name} overcrowded (${Math.round(reading.density * 100)}% capacity). Activate alternate route protocols.`,
        timestamp: now,
        type: "overcrowding",
      });
    } else if (reading.density >= 0.65 && reading.trend === "rising") {
      alerts.push({
        id: `alert-${reading.locationId}-medium`,
        locationId: reading.locationId,
        locationName: loc.name,
        severity: "medium",
        message: `SURGE: ${loc.name} crowd rising rapidly. Currently at ${Math.round(reading.density * 100)}% — monitor closely.`,
        timestamp: now,
        type: "surge",
      });
    }
  });

  return alerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export function generateHourlyForecast(locationId: string) {
  const forecasts = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const futureHour = new Date(now);
    futureHour.setHours(now.getHours() + i);
    const h = futureHour.getHours();
    const base = getTimeMultiplier(h, 0);
    const loc = LOCATIONS.find((l) => l.id === locationId);
    const cap = loc?.capacity ?? 100000;
    const factor = locationId === "triveni" ? 1.0 : 0.75;
    const predicted = Math.floor(cap * base * factor * getBaseLoadForType(loc?.type ?? "ghat") * (0.90 + Math.random() * 0.20));

    forecasts.push({
      hour: futureHour.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      predicted: Math.min(predicted, cap),
      capacity: cap,
      percentFull: parseFloat(((predicted / cap) * 100).toFixed(1)),
    });
  }
  return forecasts;
}

export function getRouteRecommendations(readings: CrowdReading[]): RouteOption[] {
  const triveniDensity = readings.find((r) => r.locationId === "triveni")?.density ?? 0.5;
  const jnDensity = readings.find((r) => r.locationId === "prayagraj_jn")?.density ?? 0.5;

  return [
    {
      id: "route-1",
      name: "Northern Corridor",
      from: "Prayagraj Junction",
      to: "Triveni Sangam",
      distance: "4.2 km",
      estimatedTime: triveniDensity > 0.7 ? "45 min" : "22 min",
      crowdLevel: triveniDensity > 0.8 ? "high" : triveniDensity > 0.5 ? "medium" : "low",
      waypoints: [[25.4484, 81.8731], [25.4430, 81.8780], [25.4358, 81.8836]],
      status: triveniDensity > 0.85 ? "avoid" : triveniDensity > 0.65 ? "caution" : "recommended",
      reason: triveniDensity > 0.85 ? "Severe congestion at Sangam — divert via Ram Ghat" : "Moderate flow, standard route",
    },
    {
      id: "route-2",
      name: "Western Bypass",
      from: "Civil Lines",
      to: "Ganga Ghat",
      distance: "6.1 km",
      estimatedTime: "28 min",
      crowdLevel: "low",
      waypoints: [[25.4608, 81.8433], [25.4550, 81.8520], [25.4445, 81.8636]],
      status: "recommended",
      reason: "Least congested route — recommended for families and elderly pilgrims",
    },
    {
      id: "route-3",
      name: "Southern Access Road",
      from: "Sector 6 Camp",
      to: "Yamuna Ghat",
      distance: "3.8 km",
      estimatedTime: "18 min",
      crowdLevel: "medium",
      waypoints: [[25.4190, 81.8900], [25.4240, 81.8830], [25.4289, 81.8756]],
      status: "caution",
      reason: "Active pilgrim movement — allow 2x normal time during peak hours",
    },
    {
      id: "route-4",
      name: "Emergency Vehicle Lane",
      from: "Central Medical Hub",
      to: "Triveni Sangam",
      distance: "2.9 km",
      estimatedTime: "12 min",
      crowdLevel: "low",
      waypoints: [[25.4420, 81.8450], [25.4390, 81.8640], [25.4358, 81.8836]],
      status: "recommended",
      reason: "Reserved emergency corridor — always kept clear",
    },
    {
      id: "route-5",
      name: "Kumbh Mela Express Route",
      from: "Alambagh Terminal",
      to: "Ram Ghat",
      distance: "8.5 km",
      estimatedTime: jnDensity > 0.7 ? "55 min" : "35 min",
      crowdLevel: jnDensity > 0.7 ? "high" : "medium",
      waypoints: [[25.4350, 81.8200], [25.4430, 81.8400], [25.4501, 81.8590]],
      status: jnDensity > 0.75 ? "caution" : "recommended",
      reason: "Main arterial route — may experience delays during peak bathing hours",
    },
  ];
}
