import { describe, it, expect } from 'vitest';
import { simulateCrowdData, generateAlerts } from './crowdData';
import { parseMultiplier } from './validation';

describe('MahaDrishti Core Logic', () => {
  it('parses and clamps multiplier values correctly', () => {
    expect(parseMultiplier('1.5')).toBe(1.5);
    expect(parseMultiplier('invalid')).toBe(1.0);
    expect(parseMultiplier('10.0')).toBe(6.0);
    expect(parseMultiplier('0.1')).toBe(0.5);
  });

  it('ensures crowd readings never exceed capacity', () => {
    const readings = simulateCrowdData(2.0);
    expect(readings.length).toBeGreaterThan(0);

    readings.forEach((r: any) => {
      const count = r.count ?? r.currentCrowd ?? r.crowd ?? 0;
      const capacity = r.capacity ?? 100000;
      expect(count).toBeLessThanOrEqual(capacity);
    });
  });

  it('generates critical alerts when density exceeds threshold', () => {
    const mockReadings = [
      {
        locationId: 'loc-1',
        locationName: 'Test Zone',
        type: 'capacity',
        count: 950,
        capacity: 1000,
        densityRatio: 0.95,
        trend: 'rising' as const,
      },
    ];

    const alerts = generateAlerts(mockReadings);
    expect(alerts.length).toBe(1);
    expect(alerts[0].severity).toBe('critical');
  });
});