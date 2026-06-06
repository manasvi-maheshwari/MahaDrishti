"use client";
import { useEffect, useRef } from "react";

interface Reading {
  locationId: string;
  count: number;
  density: number;
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

export default function CrowdMap({ readings, locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const initializedRef = useRef(false);

  const getDensityColor = (density: number) => {
    if (density >= 0.85) return "#ef4444";
    if (density >= 0.70) return "#f97316";
    if (density >= 0.50) return "#eab308";
    return "#22c55e";
  };

  const getRadius = (density: number, capacity: number) => {
    const base = Math.min(Math.max(capacity / 50000, 1), 8) * 400;
    return base + density * 600;
  };

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return;

  initializedRef.current = true;
    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const container = mapRef.current! as HTMLElement & {
  _leaflet_id?: number;
};

if (container._leaflet_id) {
  delete container._leaflet_id;
}

const map = L.map(container, {
  center: [25.4358, 81.8636],
  zoom: 13,
  zoomControl: true,
});

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add Triveni Sangam label
      L.marker([25.4358, 81.8836]).addTo(map).bindPopup("<b>Triveni Sangam</b><br/>Holy confluence of Ganga, Yamuna & Saraswati").openPopup();
    });

    return () => {
  if (mapInstanceRef.current) {
    mapInstanceRef.current.remove();
    mapInstanceRef.current = null;
  }

  initializedRef.current = false;
};
  }, []);

  // Update circles when readings change
  useEffect(() => {
    if (!mapInstanceRef.current || readings.length === 0) return;

    import("leaflet").then((L) => {
      // Remove old circles
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      readings.forEach((reading) => {
        const loc = locations.find((l) => l.id === reading.locationId);
        if (!loc) return;

        const color = getDensityColor(reading.density);
        const radius = getRadius(reading.density, loc.capacity);

        // Outer glow circle
        const glowCircle = L.circle([loc.lat, loc.lng], {
          radius: radius * 1.4,
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 0,
        }).addTo(mapInstanceRef.current);

        // Main density circle
        const circle = L.circle([loc.lat, loc.lng], {
          radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 2,
        }).addTo(mapInstanceRef.current);

        const typeIcon: Record<string, string> = {
          Ghat: "🏊", Temple: "🛕", Transport: "🚌", Camp: "⛺", Medical: "🏥",
        };

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
                <div style="font-weight: 600; color: ${color};">${Math.round(reading.density * 100)}%</div>
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
  }, [readings, locations]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
    </div>
  );
}
