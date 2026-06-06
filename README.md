# MahaDrishti

**Real-time crowd intelligence for MahaKumbh 2028, Prayagraj**

MahaDrishti is a full-stack AI-assisted decision support system built for crowd management authorities and pilgrims at MahaKumbh. It monitors 12 key locations across Prayagraj in real-time, predicts crowd surges before they happen, recommends safe routes dynamically, and generates field advisories using Google Gemini AI.

---

## Features

**Live Crowd Heatmap**
Color-coded density circles across 12 monitored zones — ghats, temples, transport hubs, camps, and medical centers. Updated every 15 seconds via the OpenStreetMap + Leaflet stack.

**Congestion Alert Engine**
Four severity levels (Low, Medium, High, Critical) auto-triggered the moment density thresholds are breached. Critical alerts include stampede-risk warnings with immediate action guidance.

**24-Hour Forecast**
Hourly crowd predictions per location using time-of-day patterns and festival multipliers. Identifies safe bathing windows and peak surge hours before they arrive.

**Dynamic Route Optimization**
Five routes recalculate every 15 seconds based on live crowd density. Routes automatically shift between Recommended, Caution, and Avoid as conditions change on the ground.

**AI Command Center**
Powered by Google Gemini 2.5 Flash. Generates situation assessments, immediate action points for field commanders, and public pilgrim advisories based on real crowd data.

**Crowd Simulator**
A header slider simulates crowd load from 1x (normal day) to 6x (Mauni Amavasya peak). Watch alerts fire, routes shift, and the heatmap respond in real-time — useful for both demos and actual pre-event planning.

**Dual Interface**
Authority dashboard for command centers and a separate mobile-first Pilgrim View with safe routes, active warnings, and darshan tips in plain language.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + TypeScript |
| Styling | Tailwind CSS + custom CSS animations |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Animations | Framer Motion |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Fonts | Yatra One (headings), DM Sans (body) |
| Deployment | Vercel |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone
git clone https://github.com/manasvi-maheshwari/MahaDrishti
cd MahaDrishti

# Install
npm install

# Configure environment
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

Get a key at [aistudio.google.com](https://aistudio.google.com) — free tier is sufficient for demos.

```bash
# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> The AI advisory is the only feature that calls an external API. Everything else — heatmap, alerts, forecast, routes — runs entirely on the local simulation engine.

---

## API Reference

All endpoints accept an optional `?multiplier=1.0` query parameter to simulate different crowd intensities.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/crowd-data` | GET | Live readings for all 12 monitored locations |
| `/api/alerts` | GET | Active alerts with severity classification |
| `/api/routes` | GET | Route recommendations with real-time crowd levels |
| `/api/predict` | GET | 24-hour hourly forecast for a given location |
| `/api/simulate` | POST | Gemini AI situation advisory |

---

## Monitored Locations

| Location | Type | Zone |
|----------|------|------|
| Triveni Sangam | Ghat | Central |
| Ganga Ghat | Ghat | North |
| Yamuna Ghat | Ghat | East |
| Ram Ghat | Ghat | North |
| Hanuman Mandir | Temple | West |
| Akshayvat Temple | Temple | Central |
| Prayagraj Junction | Transport | Central |
| Civil Lines Bus Stand | Transport | North |
| Alambagh Terminal | Transport | West |
| Sector 1 Camp | Camp | East |
| Sector 6 Camp | Camp | South |
| Central Medical Hub | Medical | Central |

---

## Simulator Guide

| Multiplier | Scenario | Expected Behavior |
|------------|----------|-------------------|
| 1x | Normal day | Most zones green, no alerts |
| 2x | Festival day | Moderate alerts at major ghats |
| 4x | Snan day | High alerts, route shifts |
| 6x | Mauni Amavasya | Critical alerts, stampede warnings |

---

## Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Add `GEMINI_API_KEY` in your Vercel project's Environment Variables settings.

---

## Project Structure

```
mahadrishti/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout + fonts
│   ├── globals.css           # Design tokens + animations
│   └── api/
│       ├── crowd-data/       # Live crowd readings
│       ├── alerts/           # Congestion alert engine
│       ├── routes/           # Route recommendations
│       ├── predict/          # 24-hour forecast
│       └── simulate/         # Gemini AI advisory
├── components/
│   ├── CrowdMap.tsx          # Leaflet heatmap component
│   └── LandingPage.tsx       # Animated landing screen
├── lib/
│   └── crowdData.ts          # Core simulation engine
└── public/                   # Static assets
```

---

Built with AI-assisted development · Gemini for runtime AI advisory
