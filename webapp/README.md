# CoalMiner Web App

Single-page React application (Vite) that visualizes your Arduino gas sensor readings and provides supporting Home/About/Contact experiences for the project.

## Features

- Web Serial dashboard with connect/disconnect, live status cards, rolling Chart.js visualization, and event log.
- About page describing the hardware, mission, and safety principles.
- Contact page with quick support info and a simple inquiry form.
- Fully responsive dark theme built with custom CSS (no UI frameworks).

## Getting Started

```bash
cd webapp
npm install
npm run dev
```

Open the dev server URL printed in the terminal (typically `http://localhost:5173`). Use Chrome or Edge because Web Serial is required for live data.

## Production build

```bash
npm run build
npm run preview    # optional smoke test
```

> ⚠️ Vite 7 needs Node.js ≥ 20.19 or ≥ 22.12. Upgrade Node if you see `EBADENGINE` warnings.

## Using Web Serial

1. Upload the Arduino sketch that prints sensor readings via `Serial.println(value);`.
2. Plug the board in via USB and open the site in Chrome/Edge (enable `chrome://flags/#enable-web-serial` if needed).
3. Click **Connect Sensor** and pick the COM port associated with your Arduino.
4. Keep the tab open to stream data; unplugging the device or closing the tab disconnects automatically.

