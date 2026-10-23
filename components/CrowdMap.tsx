"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Circle } from "leaflet";
import { THRESHOLDS } from "@/lib/crowdData";

interface Reading {
  locationId: string;
  count: number;
  densityRatio: number;
  trend: string;
}

interface LocationData {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  capacity: number;
  zone: string;
}

interface Props {
  readings: Reading[];
  locations: LocationData[];
}

const getDensityColor = (density: number) => {
  if (density >= THRESHOLDS.map.red) return "#ef4444";
  if (density >= THRESHOLDS.map.orange) return "#f97316";
  if (density >= THRESHOLDS.map.yellow) return "#eab308";
  return "#22c55e";
};

const getRadius = (density: number, capacity: number) => {
  const base = Math.min(Math.max(capacity / 50000, 1), 8) * 400;
  return base + density * 600;
};

export default function CrowdMap({ readings, locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Circle[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Create the map once. The cancelled flag guards against React Strict Mode
  // running cleanup before the async leaflet import has finished.
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      map = L.map(mapRef.current, {
        center: [25.4358, 81.8636],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      L.marker([25.4358, 81.8836])
        .addTo(map)
        .bindPopup("<b>Triveni Sangam</b><br/>Holy confluence of Ganga, Yamuna & Saraswati")
        .openPopup();

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      markersRef.current = [];
      if (map) {
        map.remove();
      }
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Redraw circles whenever readings change or the map becomes ready
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map || readings.length === 0) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const typeIcon: Record<string, string> = {
        Ghat: "🏊", Temple: "🛕", Transport: "🚌", Camp: "⛺", Medical: "🏥",
      };

      readings.forEach((reading) => {
        const loc = locations.find((l) => l.id === reading.locationId);
        if (!loc) return;

        const color = getDensityColor(reading.densityRatio);
        const radius = getRadius(reading.densityRatio, loc.capacity);

        const glowCircle = L.circle([loc.lat, loc.lng], {
          radius: radius * 1.4,
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 0,
        }).addTo(map);

        const circle = L.circle([loc.lat, loc.lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 2,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: system-ui; min-width: 180px;">
            <div style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">${typeIcon[loc.type] || "📍"} ${loc.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: capitalize;">${loc.type} · ${loc.zone} Zone</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div style="background: #f5f5f5; padding: 6px 8px; border-radius: 6px;">
                <div style="color: #888;">Current</div>
                <div style="font-weight: 600; color: ${color};">${reading.count.toLocaleString()}</div>
              </div>
              <div style="background: #f5f5f5; padding: 6px 8px; border-radius: 6px;">
                <div style="color: #888;">Density</div>
                <div style="font-weight: 600; color: ${color};">${Math.round(reading.densityRatio * 100)}%</div>
              </div>
              <div style="background: #f5f5f5; padding: 6px 8px; border-radius: 6px;">
                <div style="color: #888;">Capacity</div>
                <div style="font-weight: 600;">${loc.capacity.toLocaleString()}</div>
              </div>
              <div style="background: #f5f5f5; padding: 6px 8px; border-radius: 6px;">
                <div style="color: #888;">Trend</div>
                <div style="font-weight: 600;">${reading.trend === "rising" ? "↑ Rising" : reading.trend === "falling" ? "↓ Falling" : "→ Stable"}</div>
              </div>
            </div>
          </div>
        `);

        markersRef.current.push(glowCircle, circle);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [readings, locations, mapReady]);

  // Leaflet CSS is loaded once in app/layout.tsx
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
