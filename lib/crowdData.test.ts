import { describe, it, expect } from 'vitest';
import {
  simulateCrowdData,
  generateAlerts,
  getRouteRecommendations,
  buildSnapshot,
  LOCATIONS,
  type CrowdReading,
} from './crowdData';
import { parseMultiplier } from './validation';

const makeReading = (overrides: Partial<CrowdReading> = {}): CrowdReading => ({
  locationId: 'triveni',
  locationName: 'Triveni Sangam',
  capacity: 1000,
  timestamp: new Date().toISOString(),
  count: 500,
  densityRatio: 0.5,
  trend: 'stable',
  temperature: 15,
  ...overrides,
});

describe('MahaDrishti Core Logic', () => {
  it('parses and clamps multiplier values correctly', () => {
    expect(parseMultiplier('1.5')).toBe(1.5);
    expect(parseMultiplier('invalid')).toBe(1.0);
    expect(parseMultiplier(null)).toBe(1.0);
    expect(parseMultiplier('10.0')).toBe(6.0);
    expect(parseMultiplier('0.1')).toBe(0.5);
  });

  it('ensures crowd readings never exceed capacity', () => {
    const readings = simulateCrowdData(6.0);
    expect(readings).toHaveLength(LOCATIONS.length);

    readings.forEach((r) => {
      const loc = LOCATIONS.find((l) => l.id === r.locationId);
      expect(loc).toBeDefined();
      expect(r.capacity).toBe(loc!.capacity);
      expect(r.count).toBeLessThanOrEqual(r.capacity);
      expect(r.densityRatio).toBeLessThanOrEqual(1);
    });
  });

  it('generates critical alerts when density exceeds threshold', () => {
    const alerts = generateAlerts([makeReading({ count: 950, densityRatio: 0.95, trend: 'rising' })]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });

  it('does not alert on low density', () => {
    expect(generateAlerts([makeReading({ densityRatio: 0.2 })])).toHaveLength(0);
  });

  it('routes react to live density at Triveni Sangam', () => {
    const calm = getRouteRecommendations([makeReading({ densityRatio: 0.2 })]);
    const packed = getRouteRecommendations([makeReading({ densityRatio: 0.95 })]);
    expect(calm[0].status).toBe('recommended');
    expect(packed[0].status).toBe('avoid');
  });

  it('builds a snapshot whose pieces agree with each other', () => {
    const snap = buildSnapshot(2.0);
    expect(snap.readings).toHaveLength(LOCATIONS.length);
    expect(snap.locations).toHaveLength(LOCATIONS.length);
    expect(snap.summary.activeAlertsCount).toBe(snap.alerts.length);
    expect(snap.summary.averageDensity).toBeGreaterThanOrEqual(0);
    expect(snap.summary.averageDensity).toBeLessThanOrEqual(1);
  });
});
